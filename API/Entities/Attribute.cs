using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class Attribute
    {
        [Key]
        public int AttributeId { get; set; }
        public string Name { get; set; } = string.Empty; // npr. "Color", "Size", "Taste"
        public ICollection<AttributeValue> Values { get; set; } = new List<AttributeValue>();
    }
}
