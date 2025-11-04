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
        public async Task<ActionResult<Product>> CreateProduct([FromForm] CreateProductDto productDto, [FromForm] string? variants)
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

            // Handle digital file upload
            if (productDto.DigitalFile != null)
            {
                var digitalFileResult = await _imageService.AddDigitalFileAsync(productDto.DigitalFile);

                if (digitalFileResult.Error != null)
                    return BadRequest(new ProblemDetails { Title = digitalFileResult.Error.Message });

                product.DigitalFileUrl = digitalFileResult.SecureUrl.ToString();
            }
            // If no digital file uploaded but DigitalFileUrl provided, use that
            else if (!string.IsNullOrEmpty(productDto.DigitalFileUrl))
            {
                product.DigitalFileUrl = productDto.DigitalFileUrl;
            }

            _context.Products!.Add(product);

            // Save the product first to get the ProductId
            var productSaved = await _context.SaveChangesAsync() > 0;
            if (!productSaved) return BadRequest(new ProblemDetails { Title = "Problem creating new product" });

            // Parse and handle variants if they exist
            List<ProductVariantDto>? variantDtos = null;
            if (!string.IsNullOrEmpty(variants))
            {
                try
                {
                    Console.WriteLine($"Variants JSON received: {variants}");
                    var jsonOptions = new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    variantDtos = System.Text.Json.JsonSerializer.Deserialize<List<ProductVariantDto>>(variants, jsonOptions);
                    Console.WriteLine($"Deserialized {variantDtos?.Count ?? 0} variants");
                    if (variantDtos != null)
                    {
                        foreach (var v in variantDtos)
                        {
                            Console.WriteLine($"Variant: Price={v.Price}, Qty={v.QuantityInStock}, AttributeValueIds={string.Join(",", v.AttributeValueIds ?? new List<int>())}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deserializing variants: {ex.Message}");
                }
            }

            if (variantDtos != null && variantDtos.Any())
            {
                foreach (var variantDto in variantDtos)
                {
                    var variant = new ProductVariant
                    {
                        ProductId = product.ProductId,
                        QuantityInStock = variantDto.QuantityInStock,
                        PriceOverride = variantDto.Price != product.Price ? variantDto.Price : null
                    };

                    _context.ProductVariants!.Add(variant);
                    await _context.SaveChangesAsync(); // Save to get variant ID

                    // Add attribute value associations
                    if (variantDto.AttributeValueIds != null && variantDto.AttributeValueIds.Any())
                    {
                        foreach (var attributeValueId in variantDto.AttributeValueIds)
                        {
                            var productVariantAttribute = new ProductVariantAttribute
                            {
                                ProductVariantId = variant.Id,
                                AttributeValueId = attributeValueId
                            };
                            _context.ProductVariantAttributes!.Add(productVariantAttribute);
                        }
                        await _context.SaveChangesAsync();
                    }
                }
            }

            // Return a simple DTO to avoid circular reference
            var createdProductDto = new CreateProductDto
            {
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                CategoryId = product.CategoryId,
                ImageUrl = product.PictureUrl,
                ProductType = product.ProductType,
                DigitalFileUrl = product.DigitalFileUrl,
                IsInstantDelivery = product.IsInstantDelivery
            };

            return CreatedAtRoute("GetProduct", new { Id = product.ProductId }, createdProductDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult<UpdateProductDto>> UpdateProduct([FromForm] UpdateProductDto productDto, [FromForm] string? variants)
        {
            try
            {
                Console.WriteLine($"=== UpdateProduct called ===");
                Console.WriteLine($"ProductId: {productDto.ProductId}");
                Console.WriteLine($"Name: {productDto.Name}");
                Console.WriteLine($"Price: {productDto.Price}");
                Console.WriteLine($"CategoryId: {productDto.CategoryId}");
                Console.WriteLine($"Variants JSON: {variants}");

                var product = await _context.Products!
                    .Include(p => p.Category)
                    .FirstOrDefaultAsync(p => p.ProductId == productDto.ProductId);

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

                // Handle digital file upload
                if (productDto.DigitalFile != null)
                {
                    var digitalFileResult = await _imageService.AddDigitalFileAsync(productDto.DigitalFile);

                    if (digitalFileResult.Error != null)
                        return BadRequest(new ProblemDetails { Title = digitalFileResult.Error.Message });

                    product.DigitalFileUrl = digitalFileResult.SecureUrl.ToString();
                }
                // If no digital file uploaded but DigitalFileUrl provided, use that
                else if (!string.IsNullOrEmpty(productDto.DigitalFileUrl))
                {
                    product.DigitalFileUrl = productDto.DigitalFileUrl;
                }

                // Handle variants update
                if (!string.IsNullOrEmpty(variants))
                {
                    var jsonOptions = new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };
                    var variantDtos = System.Text.Json.JsonSerializer.Deserialize<List<ProductVariantDto>>(variants, jsonOptions);

                    if (variantDtos != null && variantDtos.Any())
                    {
                        // Get existing variants for this product
                        var existingVariants = await _context.ProductVariants!
                            .Include(v => v.Attributes)
                            .Where(v => v.ProductId == product.ProductId)
                            .ToListAsync();

                        // Delete variants that are no longer in the update
                        var variantIdsToKeep = variantDtos
                            .Where(v => v.ProductVariantId > 0)
                            .Select(v => v.ProductVariantId)
                            .ToList();

                        var variantsToDelete = existingVariants
                            .Where(v => !variantIdsToKeep.Contains(v.Id))
                            .ToList();

                        foreach (var variantToDelete in variantsToDelete)
                        {
                            // Delete associated attributes first
                            var attributesToDelete = _context.ProductVariantAttributes!
                                .Where(a => a.ProductVariantId == variantToDelete.Id);
                            _context.ProductVariantAttributes!.RemoveRange(attributesToDelete);

                            // Delete the variant
                            _context.ProductVariants!.Remove(variantToDelete);
                        }

                        // Process each variant (update existing or create new)
                        foreach (var variantDto in variantDtos)
                        {
                            if (variantDto.ProductVariantId > 0)
                            {
                                // Update existing variant
                                var existingVariant = existingVariants.FirstOrDefault(v => v.Id == variantDto.ProductVariantId);
                                if (existingVariant != null)
                                {
                                    existingVariant.QuantityInStock = variantDto.QuantityInStock;
                                    existingVariant.PriceOverride = variantDto.PriceOverride;

                                    // Update attributes: remove old, add new
                                    var oldAttributes = _context.ProductVariantAttributes!
                                        .Where(a => a.ProductVariantId == existingVariant.Id);
                                    _context.ProductVariantAttributes!.RemoveRange(oldAttributes);

                                    if (variantDto.AttributeValueIds != null && variantDto.AttributeValueIds.Any())
                                    {
                                        foreach (var attributeValueId in variantDto.AttributeValueIds)
                                        {
                                            var productVariantAttribute = new ProductVariantAttribute
                                            {
                                                ProductVariantId = existingVariant.Id,
                                                AttributeValueId = attributeValueId
                                            };
                                            _context.ProductVariantAttributes!.Add(productVariantAttribute);
                                        }
                                    }
                                }
                            }
                            else
                            {
                                // Create new variant
                                var newVariant = new ProductVariant
                                {
                                    ProductId = product.ProductId,
                                    QuantityInStock = variantDto.QuantityInStock,
                                    PriceOverride = variantDto.PriceOverride
                                };
                                _context.ProductVariants!.Add(newVariant);
                                await _context.SaveChangesAsync(); // Save to get variant ID

                                // Add attributes for new variant
                                if (variantDto.AttributeValueIds != null && variantDto.AttributeValueIds.Any())
                                {
                                    foreach (var attributeValueId in variantDto.AttributeValueIds)
                                    {
                                        var productVariantAttribute = new ProductVariantAttribute
                                        {
                                            ProductVariantId = newVariant.Id,
                                            AttributeValueId = attributeValueId
                                        };
                                        _context.ProductVariantAttributes!.Add(productVariantAttribute);
                                    }
                                }
                            }
                        }
                    }
                }

                var result = await _context.SaveChangesAsync() > 0;

                if (result)
                {
                    // Return DTO to avoid circular reference issues
                    var updatedProductDto = new UpdateProductDto
                    {
                        ProductId = product.ProductId,
                        Name = product.Name,
                        Price = product.Price,
                        Description = product.Description,
                        CategoryId = product.CategoryId,
                        CategoryName = product.Category?.Name,
                        ImageUrl = product.PictureUrl,
                        ProductType = product.ProductType,
                        DigitalFileUrl = product.DigitalFileUrl,
                        IsInstantDelivery = product.IsInstantDelivery
                    };
                    return Ok(updatedProductDto);
                }

                return BadRequest(new ProblemDetails { Title = "Problem updating product" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== UpdateProduct Error ===");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return BadRequest(new ProblemDetails {
                    Title = "Error updating product",
                    Detail = $"{ex.Message} | Inner: {ex.InnerException?.Message}"
                });
            }
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
                    ProductVariantId = v.Id,
                    v.QuantityInStock,
                    Price = (long)(v.PriceOverride.HasValue ? v.PriceOverride.Value : p.Price),
                    PriceOverride = v.PriceOverride.HasValue ? (long)v.PriceOverride.Value : (long?)null,
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

        // PUT /api/products/bulk-update-prices - Bulk update product prices
        [Authorize(Roles = "Admin")]
        [HttpPut("bulk-update-prices")]
        public async Task<ActionResult> BulkUpdatePrices([FromBody] BulkPriceUpdateDto dto)
        {
            if (dto.ProductIds == null || !dto.ProductIds.Any())
            {
                return BadRequest("No products selected");
            }

            if (dto.Value < 0)
            {
                return BadRequest("Value cannot be negative");
            }

            try
            {
                var products = await _context.Products!
                    .Where(p => dto.ProductIds.Contains(p.ProductId))
                    .ToListAsync();

                if (!products.Any())
                {
                    return NotFound("No products found");
                }

                foreach (var product in products)
                {
                    decimal newPrice;

                    switch (dto.UpdateType.ToLower())
                    {
                        case "increase":
                            // Value is treated as percentage for increase/decrease
                            newPrice = product.Price * (1 + dto.Value / 100);
                            break;

                        case "decrease":
                            newPrice = product.Price * (1 - dto.Value / 100);
                            break;

                        case "set":
                            newPrice = dto.Value;
                            break;

                        default:
                            return BadRequest("Invalid update type. Use 'increase', 'decrease', or 'set'");
                    }

                    // Ensure price doesn't go below 0
                    if (newPrice < 0)
                    {
                        return BadRequest($"Price for product {product.Name} would become negative");
                    }

                    // Round to 2 decimal places and cast to long
                    product.Price = (long)Math.Round(newPrice, 2);
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = $"Successfully updated prices for {products.Count} products",
                    updatedCount = products.Count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Error updating prices", error = ex.Message });
            }
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

public class BulkPriceUpdateDto
{
    public List<int> ProductIds { get; set; } = new();
    public string UpdateType { get; set; } = string.Empty; // "increase", "decrease", or "set"
    public decimal Value { get; set; }
}
