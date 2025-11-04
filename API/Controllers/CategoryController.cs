using API.Data;
using API.Dto;
using API.Entities;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class CategoryController: BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;

        public CategoryController(StoreContext context, IMapper mapper)
        {

            _context = context;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<List<Category>>> GetCategories()
        {
            var categories = await _context.Categories!
                .ToListAsync();

            return categories;
        }

        [HttpGet("{id}", Name = "GetCategory")]
        public async Task<ActionResult<Category>> GetCategory(int id)
        {

            var category = await _context!.Categories!.FindAsync(id);

            if (category == null) return NotFound();

            return category;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] CreateCategoryDto categoryDto)
        {

            var category = _mapper.Map<Category>(categoryDto);

            _context.Categories!.Add(category);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetCategory", new { Id = category.CategoryId }, category);

            return BadRequest(new ProblemDetails { Title = "Problem creating new category" });

        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<Category>> UpdateCategory(int id, [FromBody] UpdateCategoryDto categoryDto)
        {
            var category = await _context.Categories!.FindAsync(id);

            if (category == null) return NotFound();

            _mapper.Map(categoryDto, category);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok(category);

            return BadRequest(new ProblemDetails { Title = "Problem updating category" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories!.FindAsync(id);

            if (category == null) return NotFound();

            // Check if category has products
            var hasProducts = await _context.Products!.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest(new ProblemDetails { Title = "Cannot delete category with existing products" });
            }

            _context.Categories.Remove(category);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem deleting category" });
        }

        // Admin-specific endpoints
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<object>>> GetCategoriesForAdmin()
        {
            var categories = await _context.Categories!
                .Select(c => new
                {
                    CategoryId = c.CategoryId,
                    c.Name,
                    Description = (string?)null, // Category doesn't have Description property
                    ProductCount = _context.Products!.Count(p => p.CategoryId == c.CategoryId),
                    CreatedAt = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc) // Mock data - you might want to add this field to Category entity
                })
                .ToListAsync();

            return Ok(categories);
        }
    }
}

// Additional DTO for category updates
public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; } // This won't be used since Category doesn't have Description
}
