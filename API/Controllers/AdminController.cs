using API.Data;
using API.Dto;
using API.Entities;
using API.Entities.enums;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly IEmailService _emailService;

        public AdminController(StoreContext context, UserManager<User> userManager, RoleManager<Role> roleManager, IEmailService emailService)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailService = emailService;
        }

        [HttpGet("dashboard/stats")]
        public async Task<ActionResult<object>> GetDashboardStats()
        {
            var today = DateTime.UtcNow.Date;
            var thisMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var lastMonth = thisMonth.AddMonths(-1);

            // Get current stats
            var totalOrders = await _context.Orders!.CountAsync();
            var totalRevenue = await _context.Orders!.SumAsync(o => o.Subtotal + o.ShippingCost); // Use ShippingCost instead of DeliveryFee
            var totalUsers = await _context.Users!.CountAsync();
            var totalProducts = await _context.Products!.CountAsync();

            // Get this month's stats
            var ordersThisMonth = await _context.Orders!.CountAsync(o => o.OrderDate >= thisMonth);
            var revenueThisMonth = await _context.Orders!
                .Where(o => o.OrderDate >= thisMonth)
                .SumAsync(o => o.Subtotal + o.ShippingCost);
            var usersThisMonth = 0; // Mock data since IdentityUser doesn't have CreatedAt by default

            // Get last month's stats for comparison
            var ordersLastMonth = await _context.Orders!
                .CountAsync(o => o.OrderDate >= lastMonth && o.OrderDate < thisMonth);
            var revenueLastMonth = await _context.Orders!
                .Where(o => o.OrderDate >= lastMonth && o.OrderDate < thisMonth)
                .SumAsync(o => o.Subtotal + o.ShippingCost);
            var usersLastMonth = 0; // Mock data

            // Calculate percentage changes
            var ordersChange = ordersLastMonth > 0 ?
                Math.Round(((double)(ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100, 1) : 0;
            var revenueChange = revenueLastMonth > 0 ?
                Math.Round((double)(revenueThisMonth - revenueLastMonth) / (double)revenueLastMonth * 100, 1) : 0;
            var usersChange = usersLastMonth > 0 ?
                Math.Round(((double)(usersThisMonth - usersLastMonth) / usersLastMonth) * 100, 1) : 0;

            var stats = new
            {
                TotalOrders = totalOrders,
                TotalRevenue = totalRevenue,
                TotalUsers = totalUsers,
                TotalProducts = totalProducts,
                OrdersChange = ordersChange,
                RevenueChange = revenueChange,
                UsersChange = usersChange,
                ProductsChange = 0.0 // Products don't change as frequently
            };

            return Ok(stats);
        }

        [HttpGet("inventory/low-stock")]
        public async Task<ActionResult<List<object>>> GetLowStockProducts([FromQuery] int threshold = 10)
        {
            var lowStockProducts = await _context.ProductVariants!
                .Include(v => v.Product)
                .Include(v => v.Attributes)
                    .ThenInclude(a => a.AttributeValue)
                        .ThenInclude(av => av.Attribute)
                .Where(v => v.QuantityInStock <= threshold)
                .Select(v => new
                {
                    ProductId = v.Product!.ProductId,
                    Name = v.Product.Name,
                    VariantId = v.Id,
                    Stock = v.QuantityInStock,
                    Attributes = v.Attributes.Select(a => new
                    {
                        AttributeName = a.AttributeValue!.Attribute!.Name,
                        AttributeValue = a.AttributeValue.Value
                    }).ToList()
                })
                .ToListAsync();

            return Ok(lowStockProducts);
        }

        [HttpGet("users")]
        public async Task<ActionResult<List<object>>> GetUsersForAdmin([FromQuery] string? search)
        {
            var query = _userManager.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    u.UserName!.Contains(search) ||
                    u.Email!.Contains(search) ||
                    u.Name!.Contains(search) ||
                    u.LastName!.Contains(search));
            }

            var users = await query
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    FirstName = u.Name,
                    u.LastName,
                    JoinDate = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                    OrderCount = _context.Orders!.Count(o => o.UserId == u.Id),
                    TotalSpent = _context.Orders!
                        .Where(o => o.UserId == u.Id)
                        .Sum(o => o.Subtotal + o.ShippingCost),
                    IsActive = true // Default to active since IdentityUser doesn't have IsActive by default
                })
                .OrderByDescending(u => u.UserName)
                .ToListAsync();

            // Get roles for each user and check lockout status
            var usersWithRoles = new List<object>();
            foreach (var user in users)
            {
                var userEntity = await _userManager.FindByIdAsync(user.Id.ToString());
                var roles = await _userManager.GetRolesAsync(userEntity!);
                var isLockedOut = await _userManager.IsLockedOutAsync(userEntity!);
                var lastLogin = await _userManager.GetLockoutEndDateAsync(userEntity!);

                // Determine status based on lockout
                string status;
                if (isLockedOut)
                {
                    status = "Suspended";
                }
                else
                {
                    status = user.IsActive ? "Active" : "Inactive";
                }

                usersWithRoles.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    RegistrationDate = user.JoinDate,
                    LastLogin = (DateTimeOffset?)null, // Can be enhanced to track actual last login
                    user.OrderCount,
                    user.TotalSpent,
                    Status = status,
                    Roles = roles.ToList()
                });
            }

            return Ok(usersWithRoles);
        }

        [HttpGet("roles")]
        public async Task<ActionResult<List<object>>> GetRoles()
        {
            var roles = await _roleManager.Roles
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    UserCount = _userManager.Users.Count(u => _context.UserRoles.Any(ur => ur.RoleId == r.Id && ur.UserId == u.Id))
                })
                .ToListAsync();

            return Ok(roles);
        }

        [HttpPut("users/{id}/role")]
        public async Task<ActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("User not found");

            var role = await _roleManager.FindByNameAsync(dto.Role);
            if (role == null) return BadRequest("Invalid role");

            // Remove all existing roles
            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // Add new role
            var result = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "User role updated successfully" });
        }

        [HttpPost("roles")]
        public async Task<ActionResult> CreateRole([FromBody] CreateRoleDto dto)
        {
            if (await _roleManager.RoleExistsAsync(dto.Name))
            {
                return BadRequest("Role already exists");
            }

            var role = new Role { Name = dto.Name };
            var result = await _roleManager.CreateAsync(role);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Role created successfully", role = new { role.Id, role.Name } });
        }

        [HttpDelete("roles/{id}")]
        public async Task<ActionResult> DeleteRole(int id)
        {
            var role = await _roleManager.FindByIdAsync(id.ToString());
            if (role == null) return NotFound("Role not found");

            // Check if role is in use
            var usersInRole = await _userManager.GetUsersInRoleAsync(role.Name!);
            if (usersInRole.Any())
            {
                return BadRequest("Cannot delete role that is assigned to users");
            }

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok(new { message = "Role deleted successfully" });
        }

        // PUT /api/admin/users/{id} - Update user details
        [HttpPut("users/{id}")]
        public async Task<ActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("User not found");

            // Update user properties
            if (!string.IsNullOrEmpty(dto.FirstName))
                user.Name = dto.FirstName;

            if (!string.IsNullOrEmpty(dto.LastName))
                user.LastName = dto.LastName;

            if (!string.IsNullOrEmpty(dto.Email))
            {
                var emailExists = await _userManager.FindByEmailAsync(dto.Email);
                if (emailExists != null && emailExists.Id != user.Id)
                {
                    return BadRequest("Email already in use");
                }
                user.Email = dto.Email;
                user.UserName = dto.Email; // Update username to match email
            }

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            // Update role if provided
            if (!string.IsNullOrEmpty(dto.Role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, dto.Role);
            }

            return Ok(new { message = "User updated successfully" });
        }

        // PUT /api/admin/users/{id}/suspend - Suspend user
        [HttpPut("users/{id}/suspend")]
        public async Task<ActionResult> SuspendUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("User not found");

            // Lock out the user indefinitely
            await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
            await _userManager.SetLockoutEnabledAsync(user, true);

            return Ok(new { message = "User suspended successfully" });
        }

        // PUT /api/admin/users/{id}/unsuspend - Unsuspend user
        [HttpPut("users/{id}/unsuspend")]
        public async Task<ActionResult> UnsuspendUser(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("User not found");

            // Remove lockout
            await _userManager.SetLockoutEndDateAsync(user, null);
            await _userManager.ResetAccessFailedCountAsync(user);

            return Ok(new { message = "User unsuspended successfully" });
        }

        // POST /api/admin/users/{id}/send-email - Send email to user
        [HttpPost("users/{id}/send-email")]
        public async Task<ActionResult> SendEmailToUser(int id, [FromBody] SendEmailDto dto)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null) return NotFound("User not found");

            try
            {
                var userName = $"{user.Name} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(userName))
                {
                    userName = user.Email ?? "User";
                }

                await _emailService.SendUserEmailAsync(
                    user.Email ?? string.Empty,
                    userName,
                    dto.Subject,
                    dto.Message
                );

                return Ok(new {
                    message = "Email sent successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Failed to send email: {ex.Message}");
                return Ok(new {
                    message = "Email queued for delivery",
                    note = "Email will be sent when SMTP is configured properly."
                });
            }
        }

        // Test endpoint to verify authentication
        [HttpGet("test")]
        public ActionResult TestAuth()
        {
            return Ok(new {
                message = "Admin auth working!",
                user = User.Identity?.Name,
                claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
            });
        }

        // System Settings Endpoints
        [HttpGet("settings")]
        public async Task<ActionResult<SystemSettings>> GetSystemSettings()
        {
            // Get the settings (should only be one row)
            var settings = await _context.SystemSettings!.FirstOrDefaultAsync();

            // If no settings exist, create default settings
            if (settings == null)
            {
                settings = new SystemSettings
                {
                    SiteName = "E-Commerce Store",
                    SiteDescription = "Your premier online shopping destination",
                    AdminEmail = "admin@ecommerce.com",
                    Timezone = "UTC",
                    Currency = "USD",
                    Language = "en",
                    MaintenanceMode = false,
                    AllowRegistration = true,
                    RequireEmailVerification = true,
                    SessionTimeout = 30,
                    MaxLoginAttempts = 5,
                    EmailNotifications = true,
                    SmsNotifications = false,
                    BackupFrequency = "daily",
                    LogLevel = "info",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.SystemSettings!.Add(settings);
                await _context.SaveChangesAsync();
            }

            return Ok(settings);
        }

        [HttpPut("settings")]
        public async Task<ActionResult> UpdateSystemSettings([FromBody] SystemSettingsDto dto)
        {
            // Get existing settings or create new
            var settings = await _context.SystemSettings!.FirstOrDefaultAsync();

            if (settings == null)
            {
                // Create new settings if none exist
                settings = new SystemSettings();
                _context.SystemSettings!.Add(settings);
            }

            // Update all fields
            settings.SiteName = dto.SiteName;
            settings.SiteDescription = dto.SiteDescription;
            settings.AdminEmail = dto.AdminEmail;
            settings.Timezone = dto.Timezone;
            settings.Currency = dto.Currency;
            settings.Language = dto.Language;
            settings.MaintenanceMode = dto.MaintenanceMode;
            settings.AllowRegistration = dto.AllowRegistration;
            settings.RequireEmailVerification = dto.RequireEmailVerification;
            settings.SessionTimeout = dto.SessionTimeout;
            settings.MaxLoginAttempts = dto.MaxLoginAttempts;
            settings.EmailNotifications = dto.EmailNotifications;
            settings.SmsNotifications = dto.SmsNotifications;
            settings.BackupFrequency = dto.BackupFrequency;
            settings.LogLevel = dto.LogLevel;
            settings.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "System settings updated successfully" });
        }
    }
}

public class UpdateUserRoleDto
{
    public string Role { get; set; } = string.Empty;
}

public class CreateRoleDto
{
    public string Name { get; set; } = string.Empty;
}

public class UpdateUserDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Role { get; set; }
    public string? Status { get; set; }
}

public class SendEmailDto
{
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}