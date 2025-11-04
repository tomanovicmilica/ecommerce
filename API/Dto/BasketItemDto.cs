using API.Entities.enums;

namespace API.Dto
{
    public class BasketItemDto
    {
        public int ProductId { get; set; }

        public string? Name { get; set; }

        public long Price { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public int? ProductVariantId { get; set; }

        public int Quantity { get; set; }

        public ProductType ProductType { get; set; }

        public List<VariantAttributeDto> Attributes { get; set; } = new();
        public List<int> AttributeValueIds { get; set; } = new();
}
}
