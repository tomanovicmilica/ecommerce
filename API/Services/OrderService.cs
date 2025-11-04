using API.Data;
using API.Entities;
using API.Entities.enums;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class OrderService : IOrderService
    {
        private readonly StoreContext _context;
        private readonly INotificationService _notificationService;

        public OrderService(StoreContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<Order> CreateOrderFromBasketAsync(int basketId, int userId, OrderAddress shippingAddress, OrderAddress? billingAddress)
        {
            var basket = await _context.Baskets!
                .Include(b => b.Items)
                .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(b => b.BasketId == basketId);

            if (basket == null)
                throw new ArgumentException("Basket not found");

            if (!basket.Items.Any())
                throw new ArgumentException("Basket is empty");

            // Add addresses to context first
            _context.OrderAddresses!.Add(shippingAddress);
            if (billingAddress != null)
                _context.OrderAddresses!.Add(billingAddress);

            await _context.SaveChangesAsync(); // Save to get IDs

            // Create order items from basket items
            var orderItems = new List<OrderItem>();
            foreach (var basketItem in basket.Items)
            {
                var orderItem = new OrderItem
                {
                    ProductId = basketItem.ProductId,
                    ProductName = basketItem.Product!.Name ?? "Unknown Product",
                    ProductDescription = basketItem.Product.Description,
                    UnitPrice = basketItem.Product.Price,
                    Quantity = basketItem.Quantity,
                    ProductImageUrl = basketItem.Product.PictureUrl,
                    ProductType = basketItem.Product.ProductType,
                    DigitalFileUrl = basketItem.Product.DigitalFileUrl
                };
                orderItem.CalculateLineTotal();
                orderItems.Add(orderItem);
            }

            // Check if order contains digital products
            var hasDigitalProducts = basket.Items.Any(item => item.Product!.ProductType == ProductType.Digital);
            var hasPhysicalProducts = basket.Items.Any(item => item.Product!.ProductType == ProductType.Physical);
            var requiresShipping = hasPhysicalProducts;

            // Calculate totals
            var subtotal = orderItems.Sum(item => item.LineTotal);
            var shippingCost = requiresShipping ? (subtotal > 10000 ? 0 : 500) : 0; // No shipping for digital-only orders

            // Generate order number
            var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(1000, 9999)}";

            // Create the order
            // Digital-only orders should be automatically "Delivered" since there's no physical shipping
            var initialOrderStatus = !requiresShipping && hasDigitalProducts
                ? OrderStatus.Delivered
                : OrderStatus.Pending;

            var order = new Order
            {
                OrderNumber = orderNumber,
                UserId = userId,
                BuyerEmail = "order@example.com", // This should be obtained from user context
                OrderItems = orderItems,
                ShippingAddressId = shippingAddress.OrderAddressId,
                ShippingAddress = shippingAddress,
                BillingAddressId = billingAddress?.OrderAddressId,
                BillingAddress = billingAddress,
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                TaxAmount = 0, // Can be calculated based on shipping address
                TotalAmount = subtotal + shippingCost,
                OrderStatus = initialOrderStatus,
                PaymentStatus = PaymentStatus.Pending,
                OrderDate = DateTime.UtcNow,
                ContainsDigitalProducts = hasDigitalProducts,
                RequiresShipping = requiresShipping
            };

            _context.Orders!.Add(order);
            _context.Baskets!.Remove(basket);

            await _context.SaveChangesAsync();

            // Create digital downloads immediately for digital products
            Console.WriteLine($"[DigitalDownload] hasDigitalProducts: {hasDigitalProducts}, userId: {userId}");
            if (hasDigitalProducts && userId > 0)
            {
                Console.WriteLine($"[DigitalDownload] Creating digital downloads for order {order.OrderId}");
                // Use the order we just created (no need to reload since we have snapshot data in OrderItems)
                await CreateDigitalDownloadsAsync(order);
            }
            else
            {
                Console.WriteLine("[DigitalDownload] Skipping digital download creation");
            }

            return order;
        }

        public async Task<Order> GetOrderByIdAsync(int orderId)
        {
            var order = await _context.Orders!
                .Include(o => o.OrderItems)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new ArgumentException("Order not found");

            return order;
        }

        public async Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId)
        {
            return await _context.Orders!
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .Include(o => o.ShippingAddress)
                .Include(o => o.BillingAddress)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus)
        {
            var order = await _context.Orders!
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                throw new ArgumentException("Order not found");

            var oldStatus = order.OrderStatus;
            order.OrderStatus = newStatus;

            // Create digital downloads when order is delivered/completed
            if (newStatus == OrderStatus.Delivered && order.ContainsDigitalProducts && order.UserId.HasValue)
            {
                await CreateDigitalDownloadsAsync(order);
            }

            // Create status history entry
            var statusHistory = new OrderStatusHistory
            {
                OrderId = orderId,
                FromStatus = oldStatus,
                ToStatus = newStatus,
                ChangedAt = DateTime.UtcNow,
                Notes = $"Status changed from {oldStatus} to {newStatus}"
            };

            _context.OrderStatusHistory.Add(statusHistory);
            await _context.SaveChangesAsync();

            // Send real-time notification
            var customerName = $"{order.ShippingAddress?.FirstName} {order.ShippingAddress?.LastName}";
            if (order.UserId.HasValue)
            {
                await _notificationService.SendOrderStatusUpdate(
                    order.UserId.Value,
                    order.OrderId,
                    newStatus.ToString(),
                    customerName
                );
            }

            return order;
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return false;

            if (order.OrderStatus != OrderStatus.Pending && order.OrderStatus != OrderStatus.Confirmed)
                throw new InvalidOperationException("Order cannot be cancelled at this stage");

            order.OrderStatus = OrderStatus.Cancelled;

            // Create status history entry
            var statusHistory = new OrderStatusHistory
            {
                OrderId = orderId,
                FromStatus = order.OrderStatus,
                ToStatus = OrderStatus.Cancelled,
                ChangedAt = DateTime.UtcNow,
                Notes = "Order cancelled by user"
            };

            _context.OrderStatusHistory.Add(statusHistory);
            await _context.SaveChangesAsync();

            return true;
        }

        private async Task CreateDigitalDownloadsAsync(Order order)
        {
            Console.WriteLine($"[DigitalDownload] CreateDigitalDownloadsAsync called for order {order.OrderId}");
            Console.WriteLine($"[DigitalDownload] Order has {order.OrderItems?.Count ?? 0} items");

            // First try to use snapshot data from OrderItem
            var digitalOrderItems = order.OrderItems
                .Where(item => item.ProductType == ProductType.Digital && !string.IsNullOrEmpty(item.DigitalFileUrl))
                .ToList();

            Console.WriteLine($"[DigitalDownload] Found {digitalOrderItems.Count} digital items using snapshot data");

            // Fallback: For older orders (before migration), check Product table
            if (digitalOrderItems.Count == 0)
            {
                Console.WriteLine($"[DigitalDownload] No items found with snapshot data, checking Product table...");

                // Reload order with Product navigation property
                var orderWithProducts = await _context.Orders!
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .FirstOrDefaultAsync(o => o.OrderId == order.OrderId);

                if (orderWithProducts != null)
                {
                    digitalOrderItems = orderWithProducts.OrderItems
                        .Where(item => item.Product?.ProductType == ProductType.Digital && !string.IsNullOrEmpty(item.Product.DigitalFileUrl))
                        .ToList();

                    Console.WriteLine($"[DigitalDownload] Found {digitalOrderItems.Count} digital items from Product table");
                }
            }

            foreach (var orderItem in digitalOrderItems)
            {
                // Get digital file URL from OrderItem or Product
                var digitalFileUrl = !string.IsNullOrEmpty(orderItem.DigitalFileUrl)
                    ? orderItem.DigitalFileUrl
                    : orderItem.Product?.DigitalFileUrl;

                if (string.IsNullOrEmpty(digitalFileUrl))
                {
                    Console.WriteLine($"[DigitalDownload] Skipping {orderItem.ProductName} - no DigitalFileUrl");
                    continue;
                }

                Console.WriteLine($"[DigitalDownload] Creating download for: {orderItem.ProductName}, ProductId: {orderItem.ProductId}, DigitalFileUrl: {digitalFileUrl}");

                // Check if download already exists for this order item
                var existingDownload = await _context.DigitalDownloads!
                    .FirstOrDefaultAsync(d => d.OrderItemId == orderItem.OrderItemId);

                if (existingDownload != null)
                {
                    Console.WriteLine($"[DigitalDownload] Download already exists for OrderItemId: {orderItem.OrderItemId}, skipping");
                    continue;
                }

                var digitalDownload = new DigitalDownload
                {
                    OrderItemId = orderItem.OrderItemId,
                    UserId = order.UserId.Value,
                    ProductName = orderItem.ProductName ?? "Digital Product",
                    DigitalFileUrl = digitalFileUrl!,
                    ExpiresAt = DateTime.UtcNow.AddDays(30), // 30 days to download
                    MaxDownloads = 3 // Allow 3 downloads
                };

                _context.DigitalDownloads!.Add(digitalDownload);
            }

            await _context.SaveChangesAsync();
            Console.WriteLine($"[DigitalDownload] Saved {digitalOrderItems.Count} digital downloads to database");
        }
    }
}