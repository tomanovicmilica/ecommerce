using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class ProductVariantAttribute
    {
        [Key]
        public int Id { get; set; }

        public int ProductVariantId { get; set; }
        public ProductVariant ProductVariant { get; set; } = null!;

        public int AttributeValueId { get; set; }
        public AttributeValue AttributeValue { get; set; } = null!;
    }
}
