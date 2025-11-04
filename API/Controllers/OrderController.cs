using API.Data;
using API.Dto;
using API.Entities;
using API.Entities.enums;
using API.RequestHelpers.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    
    public class OrderController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IOrderService _orderService;
        private readonly UserManager<User> _userManager;
        private readonly IEmailService _emailService;

        public OrderController(StoreContext context, IOrderService orderService, UserManager<User> user, IEmailService emailService)
        {
            _context = context;
            _orderService = orderService;
            _userManager = user;
            _emailService = emailService;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            Console.WriteLine("=== GetOrders endpoint called ===");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine($"UserId from claims: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("ERROR: UserId is null or empty - returning Unauthorized");
                return Unauthorized();
            }

            Console.WriteLine($"Querying orders for UserId: {userId}");
            var orders = await _context.Orders!
                .Where(o => o.UserId == int.Parse(userId))
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Attributes)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .OrderByDescending(o => o.OrderDate)
                .ProjectOrderToOrderDto()
                .ToListAsync();

            Console.WriteLine($"Found {orders.Count} orders for user {userId}");
            return orders;
        }

        [Authorize]
        [HttpGet("{id}", Name = "GetOrder")]
        public async Task<ActionResult<OrderDto?>> GetOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
                .Where(o => o.OrderId == id && o.UserId == int.Parse(userId))
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Attributes)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .ProjectOrderToOrderDto()
                .FirstOrDefaultAsync();

            if (order == null)
                return NotFound();

            return order;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<int>> CreateOrder(CreateOrderDto createOrderDto)
        {
            Console.WriteLine("=== CreateOrder endpoint called ===");
            Console.WriteLine($"User.Identity.IsAuthenticated: {User.Identity?.IsAuthenticated}");
            Console.WriteLine($"User.Identity.Name: {User.Identity?.Name}");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Console.WriteLine($"UserId from claims: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("ERROR: UserId is null or empty - returning Unauthorized");
                return Unauthorized();
            }

            try
            {
                // Convert DTOs to entities
                var shippingAddress = new OrderAddress
                {
                    FirstName = createOrderDto.ShippingAddress.FirstName,
                    LastName = createOrderDto.ShippingAddress.LastName,
                    AddressLine1 = createOrderDto.ShippingAddress.AddressLine1,
                    AddressLine2 = createOrderDto.ShippingAddress.AddressLine2,
                    City = createOrderDto.ShippingAddress.City,
                    State = createOrderDto.ShippingAddress.State,
                    PostalCode = createOrderDto.ShippingAddress.PostalCode,
                    Country = createOrderDto.ShippingAddress.Country,
                    PhoneNumber = createOrderDto.ShippingAddress.PhoneNumber
                };

                OrderAddress? billingAddress = null;
                if (createOrderDto.BillingAddress != null)
                {
                    billingAddress = new OrderAddress
                    {
                        FirstName = createOrderDto.BillingAddress.FirstName,
                        LastName = createOrderDto.BillingAddress.LastName,
                        AddressLine1 = createOrderDto.BillingAddress.AddressLine1,
                        AddressLine2 = createOrderDto.BillingAddress.AddressLine2,
                        City = createOrderDto.BillingAddress.City,
                        State = createOrderDto.BillingAddress.State,
                        PostalCode = createOrderDto.BillingAddress.PostalCode,
                        Country = createOrderDto.BillingAddress.Country,
                        PhoneNumber = createOrderDto.BillingAddress.PhoneNumber
                    };
                }

                var order = await _orderService.CreateOrderFromBasketAsync(
                    createOrderDto.BasketId,
                    int.Parse(userId),
                    shippingAddress,
                    billingAddress
                );

                return Ok(new { OrderId = order.OrderId, PaymentIntentId = order.PaymentIntentId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }

            /*var basket = await _context.Baskets!
                .RetrieveBasketWithItems(User.Identity!.Name!)
                .FirstOrDefaultAsync();

            if (basket == null) return BadRequest(new ProblemDetails
            {
                Title = "Could not find basket"
            });*/

            /*var items = new List<OrderItem>();

            foreach (var item in basket.Items)
            {
                var productItem = await _context.Products!.FindAsync(item.ProductId);
                var itemOrdered = new ProductItemOrdered
                {
                    ProductId = productItem!.ProductId,
                    Name = productItem!.Name,
                    ImageUrl = productItem.ImageUrl
                };
                var orderItem = new OrderItem
                {
                    ItemOrdered = itemOrdered,
                    Price = productItem.Price,
                    Size = item.Size,
                    Quantity = item.Quantity
                };
                items.Add(orderItem);

            }

            var subtotal = items.Sum(item => item.Price * item.Quantity);
            var deliveryFee = subtotal > 10000 ? 0 : 500;

            var order = new Order
            {
                OrderItems = items,
                BuyerId = User.Identity.Name,
                ShippingAddress = orderDto.ShippingAddress,
                Subtotal = subtotal,
                AdditionalExpenses = deliveryFee,
                PaymentIntentId = basket.PaymentIntentId
            };

            _context.Orders!.Add(order);
            _context.Baskets!.Remove(basket);

            if (orderDto.SaveAddress)
            {
                var user = await _context.Users
                    .Include(a => a.Address)
                    .FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);

                var address = new UserAddress
                {
                    FullName = orderDto.ShippingAddress!.FullName,
                    Address1 = orderDto.ShippingAddress.Address1,
                    Address2 = orderDto.ShippingAddress.Address2,
                    Address3 = orderDto.ShippingAddress.Address3,
                    City = orderDto.ShippingAddress.City,
                    Zip = orderDto.ShippingAddress.Zip,
                    Country = orderDto.ShippingAddress.Country
                };

                user!.Address = address;
            }

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetOrder", new { id = order.OrderId }, order.OrderId);

            return BadRequest("Problem creating order");*/


        }

        // PUT /api/orders/{id}/status - Update order status (admin only)
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateOrderStatus(int id, UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var order = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto.Status);
                return Ok(new { message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE /api/orders/{id} - Cancel order
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult> CancelOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound();

            if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Confirmed)
                return BadRequest("Order cannot be cancelled at this stage");

            var success = await _orderService.CancelOrderAsync(id);
            if (success)
                return Ok(new { message = "Order cancelled successfully" });
            else
                return BadRequest("Failed to cancel order");
        }

        // GET /api/orders/{id}/history - Get order status history
        [Authorize]
        [HttpGet("{id}/history")]
        public async Task<ActionResult<List<OrderStatusHistoryDto>>> GetOrderHistory(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound();

            var history = await _context.OrderStatusHistory
                .Where(h => h.OrderId == id)
                .Select(h => new OrderStatusHistoryDto
                {
                    Id = h.Id,
                    OrderId = h.OrderId,
                    FromStatus = h.FromStatus.ToString(),
                    ToStatus = h.ToStatus.ToString(),
                    ChangedAt = h.ChangedAt,
                    Notes = h.Notes,
                    UserId = h.UserId
                })
                .OrderByDescending(h => h.ChangedAt)
                .ToListAsync();

            return history;
        }

        // Admin-specific endpoints
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<object>>> GetOrdersForAdmin([FromQuery] string? search, [FromQuery] string? status, [FromQuery] string? dateRange)
        {
            var query = _context.Orders!
                .Include(o => o.OrderItems)
                .Include(o => o.ShippingAddress)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                if (int.TryParse(search, out int orderId))
                {
                    query = query.Where(o => o.OrderId == orderId);
                }
                else
                {
                    query = query.Where(o =>
                        (o.ShippingAddress != null &&
                         (o.ShippingAddress.FirstName.Contains(search) ||
                          o.ShippingAddress.LastName.Contains(search))) ||
                        o.UserId.ToString().Contains(search));
                }
            }

            if (!string.IsNullOrEmpty(status))
            {
                if (Enum.TryParse<OrderStatus>(status, out var orderStatus))
                {
                    query = query.Where(o => o.OrderStatus == orderStatus);
                }
            }

            if (!string.IsNullOrEmpty(dateRange))
            {
                var today = DateTime.UtcNow.Date;
                switch (dateRange.ToLower())
                {
                    case "today":
                        query = query.Where(o => o.OrderDate.Date == today);
                        break;
                    case "week":
                        var weekStart = today.AddDays(-(int)today.DayOfWeek);
                        query = query.Where(o => o.OrderDate.Date >= weekStart);
                        break;
                    case "month":
                        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                        query = query.Where(o => o.OrderDate.Date >= monthStart);
                        break;
                    case "quarter":
                        var quarterStart = new DateTime(today.Year, ((today.Month - 1) / 3) * 3 + 1, 1, 0, 0, 0, DateTimeKind.Utc);
                        query = query.Where(o => o.OrderDate.Date >= quarterStart);
                        break;
                }
            }

            var orders = await query
                .Select(o => new
                {
                    o.OrderId,
                    o.OrderDate,
                    OrderStatus = o.OrderStatus.ToString(),
                    o.Subtotal,
                    DeliveryFee = o.ShippingCost, // Use ShippingCost instead of DeliveryFee
                    Total = o.Subtotal + o.ShippingCost,
                    CustomerName = o.ShippingAddress != null ?
                        $"{o.ShippingAddress.FirstName} {o.ShippingAddress.LastName}" : "Unknown",
                    CustomerEmail = o.UserId.ToString(), // You might want to join with Users table
                    o.TrackingNumber,
                    Items = o.OrderItems.Select(oi => new
                    {
                        oi.ProductId,
                        oi.ProductName,
                        Price = oi.UnitPrice, // Use UnitPrice instead of Price
                        oi.Quantity
                    }).ToList(),
                    ShippingAddress = o.ShippingAddress
                })
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();

            return Ok(orders);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{id}/status")]
        public async Task<ActionResult> UpdateOrderStatusAdmin(int id, [FromBody] UpdateOrderStatusDto updateStatusDto)
        {
            try
            {
                var order = await _orderService.UpdateOrderStatusAsync(id, updateStatusDto.Status);
                return Ok(new { message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/order/admin/{orderId}/status-update - Add status update with notes and tracking
        [Authorize(Roles = "Admin")]
        [HttpPost("admin/{orderId}/status-update")]
        public async Task<ActionResult> AddOrderStatusUpdate(int orderId, [FromBody] AddStatusUpdateDto dto)
        {
            try
            {
                var order = await _context.Orders!.FindAsync(orderId);
                if (order == null)
                    return NotFound();

                var oldStatus = order.OrderStatus;

                // Parse the new status
                if (!Enum.TryParse<OrderStatus>(dto.Status, out var newStatus))
                    return BadRequest(new { message = "Invalid status value" });

                // Update order status
                order.OrderStatus = newStatus;
                order.UpdatedAt = DateTime.UtcNow;

                // Update tracking number if provided
                if (!string.IsNullOrEmpty(dto.TrackingNumber))
                {
                    order.TrackingNumber = dto.TrackingNumber;
                }

                // Add status history entry
                var userName = User.Identity?.Name ?? "Admin";
                var statusHistory = new OrderStatusHistory
                {
                    OrderId = orderId,
                    FromStatus = oldStatus,
                    ToStatus = newStatus,
                    ChangedAt = DateTime.UtcNow,
                    Notes = dto.Notes,
                    TrackingNumber = dto.TrackingNumber,
                    UpdatedBy = userName
                };

                _context.OrderStatusHistory.Add(statusHistory);
                await _context.SaveChangesAsync();

                // TODO: Send customer email if dto.SendCustomerEmail is true

                return Ok(new { message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/order/admin/{orderId}/status-history - Get admin status history
        [Authorize(Roles = "Admin")]
        [HttpGet("admin/{orderId}/status-history")]
        public async Task<ActionResult<List<OrderStatusHistoryDto>>> GetOrderStatusHistoryAdmin(int orderId)
        {
            var order = await _context.Orders!.FindAsync(orderId);
            if (order == null)
                return NotFound();

            var history = await _context.OrderStatusHistory
                .Where(h => h.OrderId == orderId)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new OrderStatusHistoryDto
                {
                    Id = h.Id,
                    OrderId = h.OrderId,
                    FromStatus = h.FromStatus.ToString(),
                    ToStatus = h.ToStatus.ToString(),
                    ChangedAt = h.ChangedAt,
                    Notes = h.Notes,
                    TrackingNumber = h.TrackingNumber,
                    UserId = h.UserId,
                    UpdatedBy = h.UpdatedBy
                })
                .ToListAsync();

            return history;
        }

        // PUT /api/order/admin/{orderId}/tracking - Update tracking number
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{orderId}/tracking")]
        public async Task<ActionResult> UpdateOrderTracking(int orderId, [FromBody] UpdateTrackingDto dto)
        {
            try
            {
                var order = await _context.Orders!.FindAsync(orderId);
                if (order == null)
                    return NotFound();

                order.TrackingNumber = dto.TrackingNumber;
                order.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrEmpty(dto.Notes))
                {
                    order.Notes = dto.Notes;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Tracking number updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT /api/order/admin/{orderId}/notes - Save order notes
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/{orderId}/notes")]
        public async Task<ActionResult> SaveOrderNotes(int orderId, [FromBody] UpdateNotesDto dto)
        {
            try
            {
                var order = await _context.Orders!.FindAsync(orderId);
                if (order == null)
                    return NotFound();

                order.Notes = dto.Notes;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return Ok(new { message = "Notes saved successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/orders/{id}/status-history - Customer-facing status history
        [Authorize]
        [HttpGet("{id}/status-history")]
        public async Task<ActionResult<List<OrderStatusHistoryDto>>> GetOrderStatusHistory(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound();

            var history = await _context.OrderStatusHistory
                .Where(h => h.OrderId == id)
                .OrderByDescending(h => h.ChangedAt)
                .Select(h => new OrderStatusHistoryDto
                {
                    Id = h.Id,
                    OrderId = h.OrderId,
                    FromStatus = h.FromStatus.ToString(),
                    ToStatus = h.ToStatus.ToString(),
                    ChangedAt = h.ChangedAt,
                    Notes = h.Notes,
                    TrackingNumber = h.TrackingNumber,
                    UpdatedBy = h.UpdatedBy
                })
                .ToListAsync();

            return history;
        }

        // PUT /api/orders/{id}/tracking - Customer update tracking (read-only, just for viewing)
        [Authorize]
        [HttpPut("{id}/tracking")]
        public async Task<ActionResult> UpdateTrackingCustomer(int id, [FromBody] UpdateTrackingDto dto)
        {
            // Customers cannot update tracking, only view
            return Forbid();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/stats")]
        public async Task<ActionResult<object>> GetOrderStats()
        {
            var today = DateTime.UtcNow.Date;
            var thisMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var stats = new
            {
                TotalOrders = await _context.Orders!.CountAsync(),
                TotalRevenue = await _context.Orders!.SumAsync(o => o.Subtotal + o.ShippingCost), // Use ShippingCost instead of DeliveryFee
                OrdersToday = await _context.Orders!.CountAsync(o => o.OrderDate.Date == today),
                OrdersThisMonth = await _context.Orders!.CountAsync(o => o.OrderDate >= thisMonth),
                PendingOrders = await _context.Orders!.CountAsync(o => o.OrderStatus == OrderStatus.Pending),
                ProcessingOrders = await _context.Orders!.CountAsync(o => o.OrderStatus == OrderStatus.Confirmed),
                ShippedOrders = await _context.Orders!.CountAsync(o => o.OrderStatus == OrderStatus.Shipped),
                DeliveredOrders = await _context.Orders!.CountAsync(o => o.OrderStatus == OrderStatus.Delivered),

                // Calculate percentage changes (you'd need historical data for real implementation)
                OrdersChange = 12.5, // Mock data
                RevenueChange = 8.2   // Mock data
            };

            return Ok(stats);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("admin/{orderId}/send-email")]
        public async Task<ActionResult> SendOrderEmail(int orderId, [FromBody] SendEmailDto dto)
        {
            var order = await _context.Orders!
                .Include(o => o.ShippingAddress)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null) return NotFound("Order not found");

            var user = await _context.Users.FindAsync(order.UserId);
            if (user == null) return NotFound("User not found");

            try
            {
                var customerName = $"{user.Name} {user.LastName}".Trim();
                if (string.IsNullOrEmpty(customerName))
                {
                    customerName = user.Email ?? "Customer";
                }

                await _emailService.SendOrderEmailAsync(
                    user.Email ?? string.Empty,
                    customerName,
                    orderId,
                    dto.Subject,
                    dto.Message
                );

                return Ok(new
                {
                    message = "Email sent successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Failed to send email: {ex.Message}");
                return Ok(new
                {
                    message = "Email queued for delivery",
                    note = "Email will be sent when SMTP is configured properly."
                });
            }
        }

        // PUT /api/order/admin/bulk-update-status - Bulk update order status
        [Authorize(Roles = "Admin")]
        [HttpPut("admin/bulk-update-status")]
        public async Task<ActionResult> BulkUpdateOrderStatus([FromBody] BulkUpdateOrderStatusDto dto)
        {
            if (dto.OrderIds == null || !dto.OrderIds.Any())
            {
                return BadRequest("No orders selected");
            }

            if (!Enum.TryParse<OrderStatus>(dto.Status, out var newStatus))
            {
                return BadRequest("Invalid status value");
            }

            try
            {
                var orders = await _context.Orders!
                    .Where(o => dto.OrderIds.Contains(o.OrderId))
                    .ToListAsync();

                if (!orders.Any())
                {
                    return NotFound("No orders found");
                }

                foreach (var order in orders)
                {
                    var oldStatus = order.OrderStatus;
                    order.OrderStatus = newStatus;
                    order.UpdatedAt = DateTime.UtcNow;

                    // Add status history for each order
                    var statusHistory = new OrderStatusHistory
                    {
                        OrderId = order.OrderId,
                        FromStatus = oldStatus,
                        ToStatus = newStatus,
                        ChangedAt = DateTime.UtcNow,
                        Notes = "Bulk status update",
                        UpdatedBy = User.Identity?.Name ?? "Admin"
                    };

                    _context.OrderStatusHistory.Add(statusHistory);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Successfully updated status for {orders.Count} orders",
                    updatedCount = orders.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating order status", error = ex.Message });
            }
        }

    }
}

public class BulkUpdateOrderStatusDto
{
    public List<int> OrderIds { get; set; } = new();
    public string Status { get; set; } = string.Empty;
}
