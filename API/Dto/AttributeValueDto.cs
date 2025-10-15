namespace API.Dto
{
    public class CreateAttributeValueDto
    {
        public int AttributeDefinitionId { get; set; }
        public string Value { get; set; } = string.Empty;
    }
    public class AttributeValueDto : CreateAttributeValueDto
    {
        public int Id { get; set; }
    }
}
