using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class AttributeValue
    {
        [Key]
        public int AttributeValueId { get; set; }
        public string Value { get; set; } = string.Empty; // npr. "Red", "XL", "Chocolate"
        public int AttributeId { get; set; }
        public Attribute Attribute { get; set; } = null!;
    }
}
