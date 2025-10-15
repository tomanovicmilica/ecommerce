using API.Data;
using API.Dto;
using API.Entities;
using API.RequestHelpers;
using API.RequestHelpers.Extensions;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class ProductsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly IMapper _mapper;
        private readonly ImageService _imageService;
        public ProductsController(StoreContext context, IMapper mapper, ImageService imageService)
        {
            _context = context;
            _mapper = mapper;
            _imageService = imageService;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<UpdateProductDto>>> GetProducts([FromQuery] ProductParams productParams)
        {

            var query = _context.Products!
                .Include(p => p.Category)
                .Include(p => p.Variants).ThenInclude(v => v.Attributes).ThenInclude(a => a.AttributeValue).ThenInclude(av => av.Attribute)
                .Sort(productParams.OrderBy!)
                .Search(productParams.SearchTerm!)
                .Filter(productParams.Categories!)
                .FilterByProductType(productParams.ProductTypes!)
                .ProjectToProduct()
                .AsQueryable();

            var products = await PagedList<UpdateProductDto>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);
            Response.AddPaginationHeader(products.MetaData);
            return products!;
        }
        [HttpGet("{id}", Name = "GetProduct")]
        public async Task<ActionResult<UpdateProductDto?>> GetProduct(int id)
        {

            return await _context!.Products!
                .Include(p => p.Category)
                .Include(p => p.Variants).ThenInclude(v => v.Attributes).ThenInclude(a => a.AttributeValue).ThenInclude(av => av.Attribute)
                .Where(p => p.ProductId == id)
                .ProjectToProduct()
                .FirstOrDefaultAsync();


        }
        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var categories = await _context.Products!.Select(p => p.Category).Distinct().ToListAsync();

            return Ok(new { categories });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto)
        {

            var product = _mapper.Map<Product>(productDto);

            if (productDto.File != null)
            {
                var imageResult = await _imageService.AddImageAsync(productDto.File);

                if (imageResult.Error != null)
                    return BadRequest(new ProblemDetails { Title = imageResult.Error.Message });

                product.PictureUrl = imageResult.SecureUrl.ToString();
                product.PublicId = imageResult.PublicId;
            }

            _context.Products!.Add(product);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetProduct", new { Id = product.ProductId }, product);

            return BadRequest(new ProblemDetails { Title = "Problem creating new product" });

        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult<Product>> UpdateProduct([FromForm] UpdateProductDto productDto)
        {
            var product = await _context.Products!.Include(p => p.Variants).FirstOrDefaultAsync(p => p.ProductId == productDto.ProductId);

            if (product == null) return NotFound();

            _mapper.Map(productDto, product);

            if (productDto.File != null)
            {
                var imageUploadResult = await _imageService.AddImageAsync(productDto.File);

                if (imageUploadResult.Error != null)
                    return BadRequest(new ProblemDetails { Title = imageUploadResult.Error.Message });

                if (!string.IsNullOrEmpty(product.PublicId))
                    await _imageService.DeleteImageAsync(product.PublicId);

                product.PictureUrl = imageUploadResult.SecureUrl.ToString();
                product.PublicId = imageUploadResult.PublicId;
            }
            
            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok(product);

            return BadRequest(new ProblemDetails { Title = "Problem updating product" });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products!.FindAsync(id);

            if (product == null) return NotFound();

             if (!string.IsNullOrEmpty(product.PublicId))
                 await _imageService.DeleteImageAsync(product.PublicId);


            _context.Products.Remove(product);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem deleting product" });
        }

        [HttpPost("{productId}/addVariants")]
        public async Task<ActionResult> AddVariantsToProduct(int productId, [FromBody] AddVariantDto dto)
        {
            var product = await _context.Products!
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Attributes)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null) return NotFound();

            product.AddVariant(dto.AttributeValueIds, dto.Quantity);

          
            var result = await _context.SaveChangesAsync() > 0;

            if (!result) return BadRequest(new ProblemDetails { Title = "Could not add variants" });

            return Ok(product); 
        }

        [HttpGet("debug/{productId}")]
        public async Task<ActionResult> DebugProduct(int productId)
        {
            var product = await _context.Products!
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Attributes)
                        .ThenInclude(a => a.AttributeValue) 
                            .ThenInclude(av => av.Attribute)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null) return NotFound();

            var debugInfo = new {
                ProductId = product.ProductId,
                ProductName = product.Name,
                VariantCount = product.Variants.Count,
                Variants = product.Variants.Select(v => new {
                    VariantId = v.Id,
                    QuantityInStock = v.QuantityInStock,
                    AttributeCount = v.Attributes.Count,
                    Attributes = v.Attributes.Select(a => new {
                        AttributeValueId = a.AttributeValueId,
                        AttributeName = a.AttributeValue?.Attribute?.Name ?? "NULL",
                        AttributeValue = a.AttributeValue?.Value ?? "NULL"
                    })
                })
            };

            return Ok(debugInfo);
        }

        // Admin-specific endpoints
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<ActionResult<List<object>>> GetProductsForAdmin([FromQuery] string? search, [FromQuery] string? category, [FromQuery] string? status, [FromQuery] string? productTypes)
        {
            var query = _context.Products!
                .Include(p => p.Category)
                .Include(p => p.Variants)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p => p.Name!.Contains(search) ||
                                        (p.Category != null && p.Category.Name!.Contains(search)));
            }

            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(p => p.Category != null && p.Category.Name == category);
            }

            if (!string.IsNullOrEmpty(productTypes))
            {
                var typeList = productTypes.Split(',')
                    .Where(t => int.TryParse(t.Trim(), out _))
                    .Select(t => int.Parse(t.Trim()))
                    .ToList();

                if (typeList.Any())
                {
                    query = query.Where(p => typeList.Contains((int)p.ProductType));
                }
            }

            var products = await query.Select(p => new
            {
                p.ProductId,
                p.Name,
                p.Description,
                p.Price,
                p.PictureUrl,
                CategoryName = p.Category != null ? p.Category.Name : "No Category",
                p.CategoryId,
                p.ProductType,
                TotalStock = p.Variants.Sum(v => v.QuantityInStock),
                Variants = p.Variants.Select(v => new
                {
                    v.Id,
                    v.QuantityInStock,
                    AttributeValueIds = v.Attributes.Select(a => a.AttributeValueId).ToList(),
                    Attributes = v.Attributes.Select(a => new
                    {
                        AttributeName = a.AttributeValue!.Attribute!.Name,
                        AttributeValue = a.AttributeValue.Value
                    }).ToList()
                }).ToList()
            }).ToListAsync();

            // Apply status filter after loading
            if (!string.IsNullOrEmpty(status))
            {
                products = products.Where(p =>
                {
                    var productStatus = p.TotalStock == 0 ? "Out of Stock" : "Active";
                    return productStatus == status;
                }).ToList();
            }

            return Ok(products);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/status")]
        public async Task<ActionResult> UpdateProductStatus(int id, [FromBody] UpdateProductStatusDto dto)
        {
            var product = await _context.Products!.FindAsync(id);
            if (product == null) return NotFound();

            // You can add a status field to Product entity if needed
            // For now, we'll just return success since status is calculated from stock

            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem updating product status" });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/low-stock")]
        public async Task<ActionResult<List<object>>> GetLowStockProducts([FromQuery] int threshold = 10)
        {
            var lowStockProducts = await _context.ProductVariants!
                .Include(v => v.Product)
                .Include(v => v.Attributes)
                    .ThenInclude(a => a.AttributeValue)
                        .ThenInclude(av => av.Attribute)
                .Where(v => v.QuantityInStock <= threshold)
                .Select(v => new
                {
                    ProductId = v.Product!.ProductId,
                    Name = v.Product.Name,
                    VariantId = v.Id,
                    Stock = v.QuantityInStock,
                    Attributes = v.Attributes.Select(a => new
                    {
                        AttributeName = a.AttributeValue!.Attribute!.Name,
                        AttributeValue = a.AttributeValue.Value
                    }).ToList()
                })
                .ToListAsync();

            return Ok(lowStockProducts);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("admin/stock/adjust")]
        public async Task<ActionResult> AdjustStock([FromBody] StockAdjustmentDto dto)
        {
            ProductVariant? variant;

            if (dto.VariantId > 0)
            {
                variant = await _context.ProductVariants!.FindAsync(dto.VariantId);
            }
            else
            {
                // Handle products without variants by using the first/default variant
                variant = await _context.ProductVariants!
                    .FirstOrDefaultAsync(v => v.ProductId == dto.ProductId);
            }

            if (variant == null) return NotFound("Product variant not found");

            variant.QuantityInStock += dto.Quantity;

            if (variant.QuantityInStock < 0)
            {
                return BadRequest(new ProblemDetails { Title = "Stock cannot be negative" });
            }

            // You could add a StockAdjustmentHistory table to track changes
            // For now, just update the stock

            var result = await _context.SaveChangesAsync() > 0;
            if (result) return Ok();

            return BadRequest(new ProblemDetails { Title = "Problem adjusting stock" });
        }
    }
}

// DTOs for admin endpoints
public class UpdateProductStatusDto
{
    public string Status { get; set; } = string.Empty;
}

public class StockAdjustmentDto
{
    public int ProductId { get; set; }
    public int VariantId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
}
