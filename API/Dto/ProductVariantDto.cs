namespace API.Dto
{
    public class CreateProductVariantDto
    {
        public int ProductId { get; set; }
        public decimal Price { get; set; }
        public decimal? PriceOverride { get; set; }
        public int QuantityInStock { get; set; }

        public List<int> AttributeValueIds { get; set; } = new();

    }

    public class ProductVariantDto : CreateProductVariantDto
    {
        public int ProductVariantId { get; set; }
        public List<VariantAttributeDto> Attributes { get; set; } = new();
    }
}