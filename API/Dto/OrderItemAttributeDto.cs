namespace API.Dto
{
    public class OrderItemAttributeDto
    {
        public int OrderItemAttributeId { get; set; }
        public string AttributeName { get; set; } = string.Empty;
        public string AttributeValue { get; set; } = string.Empty;
    }
}