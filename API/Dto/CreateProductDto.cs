using API.Entities;
using API.Entities.enums;
using System.ComponentModel.DataAnnotations;

namespace API.Dto
{
    public class ProductDto
    {
        [Required]
        public string? Name { get; set; }

        [Required]
        [Range(100, Double.PositiveInfinity)]
        public long Price { get; set; }

        [Required]
        public string? Description { get; set; }

        [Required]
        public IFormFile? File { get; set; }

        public string? ImageUrl { get; set; }

        public string? CategoryName { get; set; }

        // Digital product fields
        public ProductType ProductType { get; set; } = ProductType.Physical;
        public string? DigitalFileUrl { get; set; }
        public bool IsInstantDelivery { get; set; } = false;

        public List<ProductVariantDto>? Variants { get; set; } = new();

    }
    public class CreateProductDto : ProductDto
    {
        public int CategoryId { get; set; }
    }

    public class UpdateProductDto : CreateProductDto
    {
        public int ProductId { get; set; }
    }
}

