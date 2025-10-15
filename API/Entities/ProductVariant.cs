using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class ProductVariant
    {
        [Key]
        public int Id { get; set; }
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int QuantityInStock { get; set; }
        public decimal? PriceOverride { get; set; }

        public ICollection<ProductVariantAttribute> Attributes { get; set; } = new List<ProductVariantAttribute>();
    }
}
