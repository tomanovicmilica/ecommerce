namespace API.Dto
{
    public class CreateAttributeDto
    {
        public string Name { get; set; } = string.Empty;
    }
    public class AttributeDto : CreateAttributeDto
    {
        public int Id { get; set; }
        public List<AttributeValueDto> Values { get; set; } = new();
    }
}
