using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class OrderItemAttribute
    {
        [Key]
        public int OrderItemAttributeId { get; set; }

        public int OrderItemId { get; set; }
        public OrderItem OrderItem { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string AttributeName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AttributeValue { get; set; } = string.Empty;
    }
}
