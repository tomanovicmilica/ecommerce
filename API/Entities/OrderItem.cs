using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int? ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }

        // Snapshot data at time of order
        [Required]
        [MaxLength(255)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ProductDescription { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        public string? ProductImageUrl { get; set; }

        // Navigation properties
        public ICollection<OrderItemAttribute> Attributes { get; set; } = new List<OrderItemAttribute>();

        public void CalculateLineTotal()
        {
            LineTotal = UnitPrice * Quantity;
        }
    }
}
