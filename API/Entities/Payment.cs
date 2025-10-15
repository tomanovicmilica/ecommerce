using API.Entities.enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        [Required]
        public string PaymentIntentId { get; set; } = string.Empty;

        public string? PaymentMethodId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        public PaymentStatus PaymentStatus { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public string? StripeChargeId { get; set; }

        [MaxLength(500)]
        public string? FailureReason { get; set; }

        public DateTime? ProcessedAt { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundedAmount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
