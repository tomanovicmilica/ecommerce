using System.ComponentModel.DataAnnotations;

namespace API.Dto
{
    public class CreateCategoryDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
