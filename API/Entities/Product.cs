using System.ComponentModel.DataAnnotations;
using API.Entities.enums;

namespace API.Entities
{
    public class Product
    {
        [Key]
        public int ProductId { get; set; }

        public string? Name { get; set; }

        public string? Description { get; set; }

        public long Price { get; set; }

        public string? PictureUrl { get; set; }

        public int QuantityInStock { get; set; }

        public Category? Category { get; set; }
        public int CategoryId { get; set; }

        // Product Type - Physical or Digital
        public ProductType ProductType { get; set; } = ProductType.Physical;

        // Digital Product specific fields
        public string? DigitalFileUrl { get; set; }  // URL for digital download
        public bool IsInstantDelivery { get; set; } = false;  // Auto-deliver after payment

        public string? PublicId { get; set; }

        public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public void AddVariant(List<int> attributeValueIds, int quantity)
        {
            // Proveri da li već postoji variant sa istim atributima
            var existingVariant = Variants.FirstOrDefault(v =>
                v.Attributes.Count == attributeValueIds.Count &&
                v.Attributes.All(attr => attributeValueIds.Contains(attr.AttributeValueId))
            );

            if (existingVariant == null)
            {
                // Kreiraj novi variant
                var newVariant = new ProductVariant
                {
                    ProductId = this.ProductId,
                    QuantityInStock = quantity,
                    Attributes = attributeValueIds.Select(id => new ProductVariantAttribute
                    {
                        AttributeValueId = id
                    }).ToList()
                };

                Variants.Add(newVariant);
            }
            else
            {
                // Ako već postoji, samo poveća količinu
                existingVariant.QuantityInStock += quantity;
            }
        }

    }
}
