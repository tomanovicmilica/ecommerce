using API.Data;
using API.Entities;
using API.Entities.enums;
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

        public AdminController(StoreContext context, UserManager<User> userManager, RoleManager<Role> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
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

            // Get roles for each user
            var usersWithRoles = new List<object>();
            foreach (var user in users)
            {
                var userEntity = await _userManager.FindByIdAsync(user.Id.ToString());
                var roles = await _userManager.GetRolesAsync(userEntity!);

                usersWithRoles.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FirstName,
                    user.LastName,
                    user.JoinDate,
                    user.OrderCount,
                    user.TotalSpent,
                    user.IsActive,
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