# Controller Architecture for New Order System

## 🎯 Controllers You NEED for the New System:

### 1. OrdersController - ✅ ESSENTIAL
```csharp
// Endpoints:
GET    /api/orders                    // Get user's orders
GET    /api/orders/{id}               // Get specific order
POST   /api/orders                    // Create order from basket
PUT    /api/orders/{id}/status        // Update order status (admin)
DELETE /api/orders/{id}               // Cancel order
GET    /api/orders/{id}/history       // Get order status history
```

### 2. PaymentsController - ✅ ESSENTIAL  
```csharp
// Endpoints:
POST   /api/payments/create-intent    // Create Stripe payment intent
POST   /api/payments/webhook          // Stripe webhook handler
GET    /api/payments/order/{orderId}  // Get payment info for order
POST   /api/payments/{id}/refund      // Process refund (admin)
```

### 3. ShippingController - ✅ RECOMMENDED
```csharp
// Endpoints:
GET    /api/shipping/methods          // Get available shipping methods
GET    /api/shipping/orders/{id}      // Get shipping info for order  
PUT    /api/shipping/orders/{id}      // Update shipping info (admin)
```

## ❌ Controllers You DON'T Need:

### 4. PaymentMethodController - REMOVE
- **Why**: Payment methods are now enum-based (Card, BankTransfer, DigitalWallet)
- **Stripe handles**: Payment method creation/management

## 🔄 Optional Controllers (Nice-to-have):

### 5. OrderTrackingController - Optional
```csharp
// Could be merged into OrdersController
GET /api/orders/{id}/tracking
```

### 6. AddressController - Maybe  
```csharp
// For managing user addresses separately
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/{id}
DELETE /api/addresses/{id}
```

## ✅ Created DTOs:

- ✅ OrderDto.cs
- ✅ OrderItemDto.cs  
- ✅ OrderAddressDto.cs
- ✅ OrderItemAttributeDto.cs
- ✅ PaymentDto.cs
- ✅ OrderStatusHistoryDto.cs
- ✅ ShippingInfoDto.cs
- ✅ ShippingMethodDto.cs

## 🔄 Updated Files:

- ✅ OrderExtensions.cs - Updated to match new order design
- ✅ Service interfaces already exist:
  - IOrderService.cs
  - IPaymentService.cs

## 📋 Controller Implementation Examples:

### OrdersController.cs
```csharp
using API.Data;
using API.Dto;
using API.Entities;
using API.RequestHelpers.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    public class OrdersController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IOrderService _orderService;
        private readonly UserManager<User> _userManager;

        public OrdersController(StoreContext context, IOrderService orderService, UserManager<User> userManager)
        {
            _context = context;
            _orderService = orderService;
            _userManager = userManager;
        }

        // GET /api/orders - Get user's orders
        [Authorize]
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetUserOrders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var orders = await _context.Orders
                .Where(o => o.UserId == int.Parse(userId))
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Attributes)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .OrderByDescending(o => o.OrderDate)
                .ProjectOrderToOrderDto()
                .ToListAsync();

            return orders;
        }

        // GET /api/orders/{id} - Get specific order
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderDto>> GetOrder(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders
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

        // POST /api/orders - Create order from basket
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<OrderDto>> CreateOrder(CreateOrderDto createOrderDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

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
                    shippingAddress, 
                    billingAddress
                );

                return Ok(new { OrderId = order.OrderId, PaymentIntentId = order.PaymentIntentId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

            var order = await _context.Orders
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

            var order = await _context.Orders
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
    }
}
```

### PaymentsController.cs
```csharp
using API.Data;
using API.Dto;
using API.Entities;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using System.Security.Claims;

namespace API.Controllers
{
    public class PaymentsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _config;

        public PaymentsController(StoreContext context, IPaymentService paymentService, IConfiguration config)
        {
            _context = context;
            _paymentService = paymentService;
            _config = config;
        }

        // POST /api/payments/create-intent - Create Stripe payment intent
        [Authorize]
        [HttpPost("create-intent")]
        public async Task<ActionResult<CreatePaymentIntentDto>> CreatePaymentIntent(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound("Order not found");

            if (order.PaymentStatus == PaymentStatus.Succeeded)
                return BadRequest("Order is already paid");

            try
            {
                var paymentIntent = await _paymentService.CreatePaymentIntentAsync(order);
                
                return Ok(new CreatePaymentIntentDto
                {
                    PaymentIntentId = paymentIntent.Id,
                    ClientSecret = paymentIntent.ClientSecret
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST /api/payments/webhook - Stripe webhook handler
        [HttpPost("webhook")]
        public async Task<ActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            
            try
            {
                var stripeSignature = Request.Headers["Stripe-Signature"];
                var endpointSecret = _config["Stripe:WebhookSecret"];
                
                var isValid = await _paymentService.ValidateWebhookAsync(json, stripeSignature);
                if (!isValid)
                    return BadRequest("Invalid signature");

                var stripeEvent = EventUtility.ParseEvent(json);
                
                if (stripeEvent.Type == Events.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent != null)
                    {
                        await _paymentService.ProcessPaymentAsync(paymentIntent.Id);
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET /api/payments/order/{orderId} - Get payment info for order
        [Authorize]
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<List<PaymentDto>>> GetOrderPayments(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound();

            var payments = await _context.Payments
                .Where(p => p.OrderId == orderId)
                .Select(p => new PaymentDto
                {
                    PaymentId = p.PaymentId,
                    OrderId = p.OrderId,
                    PaymentIntentId = p.PaymentIntentId,
                    PaymentMethodId = p.PaymentMethodId,
                    Amount = p.Amount,
                    Currency = p.Currency,
                    PaymentStatus = p.PaymentStatus.ToString(),
                    PaymentMethod = p.PaymentMethod.ToString(),
                    StripeChargeId = p.StripeChargeId,
                    FailureReason = p.FailureReason,
                    ProcessedAt = p.ProcessedAt,
                    RefundedAmount = p.RefundedAmount,
                    CreatedAt = p.CreatedAt
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return payments;
        }

        // POST /api/payments/{id}/refund - Process refund (admin only)
        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/refund")]
        public async Task<ActionResult> RefundPayment(int id, RefundPaymentDto refundDto)
        {
            try
            {
                var payment = await _paymentService.RefundPaymentAsync(id, refundDto.Amount);
                return Ok(new { message = "Refund processed successfully", payment });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
```

### Additional DTOs Needed:

#### CreateOrderDto.cs
```csharp
namespace API.Dto
{
    public class CreateOrderDto
    {
        public int BasketId { get; set; }
        public OrderAddressDto ShippingAddress { get; set; } = null!;
        public OrderAddressDto? BillingAddress { get; set; }
    }
}
```

#### UpdateOrderStatusDto.cs
```csharp
using API.Entities;

namespace API.Dto
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
```

#### CreatePaymentIntentDto.cs
```csharp
namespace API.Dto
{
    public class CreatePaymentIntentDto
    {
        public string PaymentIntentId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}
```

#### RefundPaymentDto.cs
```csharp
namespace API.Dto
{
    public class RefundPaymentDto
    {
        public decimal Amount { get; set; }
        public string? Reason { get; set; }
    }
}
```

## Next Steps:

1. ✅ Controller implementations provided above
2. Create additional DTOs (CreateOrderDto, UpdateOrderStatusDto, etc.)
3. Implement service classes for IOrderService and IPaymentService
4. Add Entity Framework configuration for new entities
5. Configure Stripe settings in appsettings.json