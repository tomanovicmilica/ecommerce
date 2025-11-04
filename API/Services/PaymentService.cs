using API.Data;
using API.Entities;
using API.Entities.enums;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _config;
        private readonly StoreContext _context;

        public PaymentService(IConfiguration config, StoreContext context)
        {
            _config = config;
            _context = context;
        }

        public async Task<PaymentIntent> CreatePaymentIntentAsync(Order order)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var service = new PaymentIntentService();

            var intent = new PaymentIntent();
            var amount = order.GetTotal();

            if (string.IsNullOrEmpty(order.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)(amount * 100), // Convert to cents
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" },
                    Metadata = new Dictionary<string, string>
                    {
                        { "orderId", order.OrderId.ToString() }
                    }
                };
                intent = await service.CreateAsync(options);

                // Update order with payment intent ID
                order.PaymentIntentId = intent.Id;
                await _context.SaveChangesAsync();
            }
            else
            {
                var options = new PaymentIntentUpdateOptions
                {
                    Amount = (long)(amount * 100) // Convert to cents
                };
                intent = await service.UpdateAsync(order.PaymentIntentId, options);
            }

            return intent;
        }

        public async Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket)
        {
            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            var service = new PaymentIntentService();
            var intent = new PaymentIntent();

            // Calculate basket total
            var subtotal = basket.Items.Sum(item => item.Quantity * item.Product!.Price);
            var deliveryFee = subtotal > 10000 ? 0 : 500; // Free delivery over $100
            var amount = subtotal + deliveryFee;

            if (string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                var options = new PaymentIntentCreateOptions
                {
                    Amount = (long)amount, // Amount already in cents
                    Currency = "usd",
                    PaymentMethodTypes = new List<string> { "card" }
                };
                intent = await service.CreateAsync(options);
                basket.PaymentIntentId = intent.Id;
            }
            else
            {
                try
                {
                    // Get existing intent
                    intent = await service.GetAsync(basket.PaymentIntentId);

                    // Statuses that allow updates
                    if (intent.Status == "requires_payment_method" ||
                        intent.Status == "requires_confirmation" ||
                        intent.Status == "requires_action")
                    {
                        var options = new PaymentIntentUpdateOptions
                        {
                            Amount = (long)amount
                        };
                        intent = await service.UpdateAsync(basket.PaymentIntentId, options);
                    }
                    // Statuses that require new payment intent
                    else if (intent.Status == "succeeded" ||
                             intent.Status == "canceled" ||
                             intent.Status == "processing")
                    {
                        // Create a new payment intent
                        var options = new PaymentIntentCreateOptions
                        {
                            Amount = (long)amount,
                            Currency = "usd",
                            PaymentMethodTypes = new List<string> { "card" }
                        };
                        intent = await service.CreateAsync(options);
                        basket.PaymentIntentId = intent.Id;
                    }
                }
                catch (StripeException)
                {
                    // If the payment intent doesn't exist or there's an error, create a new one
                    var options = new PaymentIntentCreateOptions
                    {
                        Amount = (long)amount,
                        Currency = "usd",
                        PaymentMethodTypes = new List<string> { "card" }
                    };
                    intent = await service.CreateAsync(options);
                    basket.PaymentIntentId = intent.Id;
                }
            }

            return intent;
        }

        public async Task<Payment> ProcessPaymentAsync(string paymentIntentId)
        {
            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.PaymentIntentId == paymentIntentId);

            if (order == null)
                throw new ArgumentException("Order not found for payment intent");

            // Create payment record
            var payment = new Payment
            {
                OrderId = order.OrderId,
                PaymentIntentId = paymentIntentId,
                Amount = order.GetTotal(),
                Currency = "USD",
                PaymentStatus = PaymentStatus.Succeeded,
                PaymentMethod = API.Entities.enums.PaymentMethod.Card,
                ProcessedAt = DateTime.UtcNow
            };

            _context.Payments!.Add(payment);

            // Update order status
            order.OrderStatus = OrderStatus.PaymentReceived;
            order.PaymentStatus = PaymentStatus.Succeeded;

            await _context.SaveChangesAsync();
            return payment;
        }

        public async Task<Payment> RefundPaymentAsync(int paymentId, decimal amount)
        {
            var payment = await _context.Payments!
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null)
                throw new ArgumentException("Payment not found");

            if (payment.PaymentStatus != PaymentStatus.Succeeded)
                throw new InvalidOperationException("Cannot refund a payment that was not successful");

            var maxRefundAmount = payment.Amount - payment.RefundedAmount;
            if (amount > maxRefundAmount)
                throw new ArgumentException($"Refund amount cannot exceed {maxRefundAmount}");

            StripeConfiguration.ApiKey = _config["StripeSettings:SecretKey"];

            try
            {
                var refundService = new RefundService();
                var refundOptions = new RefundCreateOptions
                {
                    PaymentIntent = payment.PaymentIntentId,
                    Amount = (long)(amount * 100) // Convert to cents
                };

                var refund = await refundService.CreateAsync(refundOptions);

                // Update payment record
                payment.RefundedAmount += amount;
                if (payment.RefundedAmount >= payment.Amount)
                {
                    payment.PaymentStatus = PaymentStatus.Refunded;
                }

                await _context.SaveChangesAsync();
                return payment;
            }
            catch (StripeException ex)
            {
                throw new InvalidOperationException($"Refund failed: {ex.Message}");
            }
        }

        public Task<bool> ValidateWebhookAsync(string payload, string signature)
        {
            try
            {
                var webhookSecret = _config["StripeSettings:WhSecret"];
                var stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);
                return Task.FromResult(true);
            }
            catch (StripeException)
            {
                return Task.FromResult(false);
            }
        }
    }
}