using API.Entities;
using API.Entities.enums;

namespace API.Services
{
    public interface IDigitalDeliveryService
    {
        Task ProcessDigitalOrderAsync(Order order);
        Task SendDigitalProductLinksAsync(Order order);
    }

    public class DigitalDeliveryService : IDigitalDeliveryService
    {
        private readonly INotificationService _notificationService;

        public DigitalDeliveryService(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task ProcessDigitalOrderAsync(Order order)
        {
            if (!order.ContainsDigitalProducts)
                return;

            // For digital-only orders, automatically complete after payment
            if (!order.RequiresShipping && order.PaymentStatus == PaymentStatus.Succeeded)
            {
                await SendDigitalProductLinksAsync(order);

                // Update order status to completed for digital-only orders
                order.OrderStatus = OrderStatus.Delivered;
            }
        }

        public async Task SendDigitalProductLinksAsync(Order order)
        {
            // Get digital products from the order
            var digitalProducts = order.OrderItems
                .Where(item => item.Product?.ProductType == ProductType.Digital)
                .ToList();

            if (!digitalProducts.Any())
                return;

            // Create download links and send notification
            var downloadLinks = new List<string>();

            foreach (var item in digitalProducts)
            {
                if (!string.IsNullOrEmpty(item.Product?.DigitalFileUrl))
                {
                    downloadLinks.Add($"{item.ProductName}: {item.Product.DigitalFileUrl}");
                }
            }

            if (downloadLinks.Any())
            {
                var message = $"Your digital products are ready for download:\n\n" +
                             string.Join("\n", downloadLinks) +
                             $"\n\nOrder: {order.OrderNumber}";

                // Send notification to user
                await _notificationService.SendNotificationAsync(
                    order.UserId?.ToString() ?? "guest",
                    "Digital Products Ready",
                    message
                );
            }
        }
    }
}