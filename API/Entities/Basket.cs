using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Basket
    {
        [Key]
        public int BasketId { get; set; }

        public int SubtotalPrice { get; set; }

        public DateTime Date { get; set; } = DateTime.UtcNow;

        public string? UserId { get; set; }

        public List<BasketItem> Items { get; set; } = new List<BasketItem>();

        public string? PaymentIntentId { get; set; }
        public string? ClientSecret { get; set; }

        public void AddItem(Product product, int quantity, int? productVariantId = null)
        {
            if (Items.All(item => item.ProductId != product.ProductId || item.ProductVariantId != productVariantId))
            {
                Items.Add(new BasketItem { Product = product, Quantity = quantity, ProductVariantId = productVariantId });
                return;
            }

            var existingItem = Items.FirstOrDefault(item => item.ProductId == product.ProductId && item.ProductVariantId == productVariantId);
            if (existingItem != null) existingItem.Quantity += quantity;
            //dodati i size u proveru
        }

        public void RemoveItem(int productId, int? productVariantId, int quantity = 1)
        {
            var item = Items.FirstOrDefault(basketItem => basketItem.ProductId == productId && basketItem.ProductVariantId == productVariantId);
            if (item == null) return;

            item.Quantity -= quantity;
            if (item.Quantity <= 0) Items.Remove(item);
        }
    }
}
