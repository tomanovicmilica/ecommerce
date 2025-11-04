using API.Entities;
using API.Entities.enums;

namespace API.Services
{
    public interface IOrderService
    {
        Task<Order> CreateOrderFromBasketAsync(int basketId, int userId, OrderAddress shippingAddress, OrderAddress? billingAddress);
        Task<Order> GetOrderByIdAsync(int orderId);
        Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId);
        Task<Order> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus);
        Task<bool> CancelOrderAsync(int orderId);
    
    }
}
