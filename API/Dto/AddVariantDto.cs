namespace API.Dto
{
    public class AddVariantDto
    {
        public List<int> AttributeValueIds { get; set; } = new();
        public int Quantity { get; set; }
    }
}
