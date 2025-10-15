using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class BasketItem
    {
        [Key]
        public int BasketItemId { get; set; }

        // [ForeignKey("Basket")]
        public Basket? Basket { get; set; }
        public int BasketId { get; set; }

        // [ForeignKey("Product")]
        public Product? Product { get; set; }
        public int ProductId { get; set; }

        public ProductVariant? ProductVariant { get; set; }
        public int? ProductVariantId { get; set; } // nullable, za proizvode bez varijante

        public int Quantity { get; set; }
    }
}
