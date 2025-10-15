using API.Entities;

namespace API.Services
{
    public interface INotificationService
    {
        Task SendOrderStatusUpdate(int userId, int orderId, string newStatus, string customerName);
        Task SendNewOrderAlert(Order order);
        Task SendLowStockAlert(int productId, string productName, int stockLevel);
        Task SendInventoryAlert(string message);
        Task SendNotificationAsync(string userId, string title, string message);
    }
}