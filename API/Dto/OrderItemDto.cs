namespace API.Dto
{
    public class OrderItemDto
    {
        public int OrderItemId { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductDescription { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal LineTotal { get; set; }
        public string? ProductImageUrl { get; set; }
        public List<OrderItemAttributeDto> Attributes { get; set; } = new();
    }
}