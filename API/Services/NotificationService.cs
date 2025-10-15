using API.Services;
using Microsoft.AspNetCore.SignalR;
using API.Hubs;
using API.Entities;

namespace API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendOrderStatusUpdate(int userId, int orderId, string newStatus, string customerName)
        {
            var notification = new
            {
                Type = "OrderStatusUpdate",
                OrderId = orderId,
                Status = newStatus,
                CustomerName = customerName,
                Timestamp = DateTime.UtcNow,
                Message = $"Your order #{orderId} status has been updated to {newStatus}"
            };

            // Send to specific user
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("OrderStatusUpdated", notification);

            // Send to admins for tracking
            await _hubContext.Clients.Group("Admins")
                .SendAsync("OrderStatusChanged", notification);

            Console.WriteLine($"Notification sent: Order #{orderId} → {newStatus} for User {userId}");
        }

        public async Task SendNewOrderAlert(Order order)
        {
            var notification = new
            {
                Type = "NewOrder",
                OrderId = order.OrderId,
                CustomerName = order.ShippingAddress?.FirstName + " " + order.ShippingAddress?.LastName,
                Total = order.Subtotal + order.ShippingCost,
                Timestamp = DateTime.UtcNow,
                Message = $"New order #{order.OrderId} received from {order.ShippingAddress?.FirstName} {order.ShippingAddress?.LastName}"
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("NewOrderReceived", notification);

            Console.WriteLine($"New order notification sent: #{order.OrderId}");
        }

        public async Task SendLowStockAlert(int productId, string productName, int stockLevel)
        {
            var notification = new
            {
                Type = "LowStock",
                ProductId = productId,
                ProductName = productName,
                StockLevel = stockLevel,
                Timestamp = DateTime.UtcNow,
                Message = $"Low stock alert: {productName} has only {stockLevel} items left"
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("LowStockAlert", notification);

            Console.WriteLine($"Low stock alert sent: {productName} ({stockLevel} left)");
        }

        public async Task SendInventoryAlert(string message)
        {
            var notification = new
            {
                Type = "Inventory",
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("InventoryAlert", notification);

            Console.WriteLine($"Inventory alert sent: {message}");
        }

        public async Task SendNotificationAsync(string userId, string title, string message)
        {
            var notification = new
            {
                Type = "General",
                Title = title,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            // Send to specific user
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("Notification", notification);

            Console.WriteLine($"Notification sent to user {userId}: {title}");
        }
    }
}