namespace API.Dto
{
    public class PaymentDto
    {
        public int PaymentId { get; set; }
        public int OrderId { get; set; }
        public string PaymentIntentId { get; set; } = string.Empty;
        public string? PaymentMethodId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "USD";
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? StripeChargeId { get; set; }
        public string? FailureReason { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public decimal RefundedAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}