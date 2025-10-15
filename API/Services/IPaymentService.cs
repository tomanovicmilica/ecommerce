using API.Entities;
using Stripe;

namespace API.Services
{
    public interface IPaymentService
    {
        Task<PaymentIntent> CreatePaymentIntentAsync(Order order);
        Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket);
        Task<Payment> ProcessPaymentAsync(string paymentIntentId);
        Task<Payment> RefundPaymentAsync(int paymentId, decimal amount);
        Task<bool> ValidateWebhookAsync(string payload, string signature);
    }
}
 