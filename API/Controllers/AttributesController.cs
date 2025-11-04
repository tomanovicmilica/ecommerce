using API.Data;
using API.Dto;
using API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Attribute = API.Entities.Attribute;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttributesController : BaseApiController
    {
        private readonly StoreContext _context;

        public AttributesController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAttributes()
        {
            var attributes = await _context.Attributes!
                .Include(a => a.Values)
                .ToListAsync();

            var result = attributes.Select(a => new
            {
                id = a.AttributeId,
                name = a.Name,
                type = "text", // Default type since your entity doesn't have a Type property
                values = a.Values?.Select(v => new AttributeValueDto
                {
                    Id = v.AttributeValueId,
                    Value = v.Value,
                    AttributeDefinitionId = v.AttributeId
                }).ToList() ?? new List<AttributeValueDto>()
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateAttribute([FromBody] CreateAttributeDto dto)
        {
            var attribute = new Attribute
            {
                Name = dto.Name
            };

            _context.Attributes!.Add(attribute);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = attribute.AttributeId,
                name = attribute.Name,
                type = "text",
                values = new List<object>()
            });
        }

        [HttpPost("{id}/values")]
        public async Task<ActionResult<object>> AddValue(int id, [FromBody] CreateAttributeValueDto dto)
        {
            var attribute = await _context.Attributes!.FindAsync(id);
            if (attribute == null) return NotFound();

            var value = new AttributeValue
            {
                Value = dto.Value,
                AttributeId = id
            };

            _context.AttributeValues!.Add(value);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = value.AttributeValueId,
                value = value.Value,
                attributeId = value.AttributeId
            });
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<object>> UpdateAttribute(int id, [FromBody] CreateAttributeDto dto)
        {
            var attribute = await _context.Attributes!.FindAsync(id);
            if (attribute == null) return NotFound();

            attribute.Name = dto.Name;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                id = attribute.AttributeId,
                name = attribute.Name,
                type = "text",
                values = attribute.Values?.Select(v => new
                {
                    id = v.AttributeValueId,
                    value = v.Value,
                    attributeId = v.AttributeId
                }).ToList()
            });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAttribute(int id)
        {
            var attribute = await _context.Attributes!
                .Include(a => a.Values)
                .FirstOrDefaultAsync(a => a.AttributeId == id);

            if (attribute == null) return NotFound();

            _context.Attributes!.Remove(attribute);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{attributeId}/values/{valueId}")]
        public async Task<ActionResult> DeleteAttributeValue(int attributeId, int valueId)
        {
            var attributeValue = await _context.AttributeValues!
                .FirstOrDefaultAsync(v => v.AttributeValueId == valueId && v.AttributeId == attributeId);

            if (attributeValue == null) return NotFound();

            _context.AttributeValues!.Remove(attributeValue);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateAttributeDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Type { get; set; }
    }

    public class CreateAttributeValueDto
    {
        public string Value { get; set; } = string.Empty;
    }
}
