using API.Entities.enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        public int? UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string BuyerEmail { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        // Digital product handling
        public bool ContainsDigitalProducts { get; set; } = false;
        public bool RequiresShipping { get; set; } = true;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        // Stripe integration
        public string? PaymentIntentId { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // Addresses
        public int ShippingAddressId { get; set; }
        public OrderAddress ShippingAddress { get; set; } = null!;

        public int? BillingAddressId { get; set; }
        public OrderAddress? BillingAddress { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        public decimal GetTotal()
        {
            return Subtotal + TaxAmount + ShippingCost;
        }
    }
}
