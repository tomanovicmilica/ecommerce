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

        public IFormFile? File { get; set; }

        public string? ImageUrl { get; set; }

        public string? CategoryName { get; set; }

        // Digital product fields
        public ProductType ProductType { get; set; } = ProductType.Physical;
        public string? DigitalFileUrl { get; set; }
        public IFormFile? DigitalFile { get; set; }  // For uploading digital files
        public bool IsInstantDelivery { get; set; } = false;

        // Variants - used for projection in queries, not for form binding
        public List<ProductVariantDto>? Variants { get; set; }

    }
    public class CreateProductDto : ProductDto
    {
        [Required]
        public new IFormFile? File { get; set; }

        public int CategoryId { get; set; }
    }

    public class UpdateProductDto : ProductDto
    {
        public int ProductId { get; set; }
        public int CategoryId { get; set; }
    }
}

