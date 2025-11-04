using API.Data;
using API.Dto;
using API.Entities.enums;
using API.RequestHelpers.Extensions;
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
        private readonly IPaymentService _paymentService;
        private readonly StoreContext _context;
        private IConfiguration _config;

        public PaymentsController(IPaymentService paymentService, StoreContext context, IConfiguration config)
        {
            _paymentService = paymentService;
            _context = context;
            _config = config;
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreatePaymentIntent()
        {
            var basket = await _context.Baskets!
                .RetrieveBasketWithItems(User!.Identity!.Name!)
                .FirstOrDefaultAsync();

            if (basket == null) return NotFound();

            var intent = await _paymentService.CreateOrUpdatePaymentIntent(basket);

            if (intent == null) return BadRequest(new ProblemDetails { Title = "Problem creating payment intent" });

            // Always update with the current intent details (in case a new one was created)
            basket.PaymentIntentId = intent.Id;
            basket.ClientSecret = intent.ClientSecret;

            _context.Update(basket);

            var result = await _context.SaveChangesAsync() > 0;

            if (!result) return BadRequest(new ProblemDetails { Title = "Problem updating basket with intent" });

            return basket.MapBasketToDto();
        }

        [Authorize]
        [HttpPost("order/{orderId}")]
        public async Task<ActionResult<CreatePaymentIntentDto>> CreatePaymentIntentForOrder(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
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

                if (stripeEvent.Type == "payment_intent.succeeded")
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

            /*var stripeEvent = EventUtility.ConstructEvent(json, Request.Headers["Stripe-Signature"],
                _config["StripeSettings:WhSecret"]);

            var charge = (Charge)stripeEvent.Data.Object;

            var order = await _context.Orders!.FirstOrDefaultAsync(x =>
                x.PaymentIntentId == charge.PaymentIntentId);

            if (charge.Status == "succeeded") order!.OrderStatus = OrderStatus.PaymentReceived;

            await _context.SaveChangesAsync();

            return new EmptyResult();*/
        }

        // GET /api/payments/order/{orderId} - Get payment info for order
        [Authorize]
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<List<PaymentDto>>> GetOrderPayments(int orderId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var order = await _context.Orders!
                .FirstOrDefaultAsync(o => o.OrderId == orderId && o.UserId == int.Parse(userId));

            if (order == null)
                return NotFound();

            var payments = await _context.Payments!
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
