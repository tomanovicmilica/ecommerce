using API.Data;
using API.Dto;
using API.Entities;
using API.RequestHelpers.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController: BaseApiController
    {
        private readonly StoreContext _context;
        public BasketController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet(Name = "GetBasket")]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            var basket = await RetrieveBasket(GetBuyerId());

            if (basket == null) return NotFound();

            Console.WriteLine($"GetBasket: Found basket with {basket.Items.Count} items");

            foreach (var item in basket.Items)
            {
                Console.WriteLine($"Item: ProductId={item.ProductId}, ProductVariantId={item.ProductVariantId}");
                Console.WriteLine($"ProductVariant is null: {item.ProductVariant == null}");

                if (item.ProductVariant != null)
                {
                    Console.WriteLine($"ProductVariant.Attributes count: {item.ProductVariant.Attributes?.Count ?? 0}");
                    if (item.ProductVariant.Attributes != null)
                    {
                        foreach (var attr in item.ProductVariant.Attributes)
                        {
                            Console.WriteLine($"Attribute: {attr.AttributeValue?.Attribute?.Name} = {attr.AttributeValue?.Value}");
                        }
                    }
                }
            }

            return basket.MapBasketToDto();
        }

        [HttpPost]
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity, [FromBody] List<int> attributeValueIds)
        { 
            Console.WriteLine($"AddItemToBasket called: productId={productId}, quantity={quantity}");
            Console.WriteLine($"attributeValueIds received: [{string.Join(", ", attributeValueIds ?? new List<int>())}]");
           
            var basket = await RetrieveBasket(GetBuyerId());
            if (basket == null) basket = CreateBasket();

            var product = await _context.Products!
                .Include(p => p.Variants)
                    .ThenInclude(v => v.Attributes)
                .FirstOrDefaultAsync(p => p.ProductId == productId);

            if (product == null) return BadRequest(new ProblemDetails { Title = "Product not found" });

            if (attributeValueIds == null || !attributeValueIds.Any())
            {
                Console.WriteLine("ERROR: No attribute values provided");
                return BadRequest(new ProblemDetails { Title = "No attribute values provided" });
            }

            Console.WriteLine($"Looking for variant with attributes: [{string.Join(", ", attributeValueIds)}]");
            var variant = product.FindVariantByAttributes(attributeValueIds);
            Console.WriteLine($"Found variant: {(variant != null ? $"ID {variant.Id}" : "NULL")}");

            // ako ne postoji varijanta, kreiraj je (AddVariant logika)
            if (variant == null)
            {
                product.AddVariant(attributeValueIds, quantity);
                await _context.SaveChangesAsync();

                // Reload product with variants to ensure we get the newly created variant
                await _context.Entry(product)
                    .Collection(p => p.Variants)
                    .Query()
                    .Include(v => v.Attributes)
                    .LoadAsync();

                variant = product.FindVariantByAttributes(attributeValueIds);

                if (variant == null)
                {
                    return BadRequest(new ProblemDetails { Title = "Failed to create or find variant" });
                }
            }

            // Check if there's enough stock (including current basket items)
            var currentBasketQuantity = basket.Items
                .Where(item => item.ProductId == product.ProductId && item.ProductVariantId == variant.Id)
                .Sum(item => item.Quantity);

            var totalRequestedQuantity = currentBasketQuantity + quantity;

            if (totalRequestedQuantity > variant.QuantityInStock)
            {
                return BadRequest(new ProblemDetails
                {
                    Title = "Insufficient stock",
                    Detail = $"Only {variant.QuantityInStock} items available. You already have {currentBasketQuantity} in your basket."
                });
            }

            basket.AddItem(product, quantity, variant.Id);

            var result = await _context.SaveChangesAsync() > 0;

            if (result) return CreatedAtRoute("GetBasket", basket.MapBasketToDto());

            return BadRequest(new ProblemDetails { Title = "Problem saving item to basket" });
        }

        [HttpDelete]
        public async Task<ActionResult> RemoveBasketItem(int productId, int quantity = 1, [FromBody] List<int>? attributeValueIds = null)
        {
            Console.WriteLine($"RemoveBasketItem called: productId={productId}, quantity={quantity}");
            Console.WriteLine($"attributeValueIds received: [{string.Join(", ", attributeValueIds ?? new List<int>())}]");

            var basket = await RetrieveBasket(GetBuyerId());

            if (basket == null)
            {
                Console.WriteLine("ERROR: Basket not found");
                return NotFound();
            }

            Console.WriteLine($"Basket found with {basket.Items.Count} items");

            // Find the variant by attributes to get the productVariantId
            int? productVariantId = null;
            if (attributeValueIds != null && attributeValueIds.Any())
            {
                Console.WriteLine($"Has attribute value IDs, searching for variant...");
                var product = await _context.Products!
                    .Include(p => p.Variants)
                        .ThenInclude(v => v.Attributes)
                    .FirstOrDefaultAsync(p => p.ProductId == productId);

                if (product != null)
                {
                    Console.WriteLine($"Product found, searching for variant with attributes: [{string.Join(", ", attributeValueIds)}]");
                    var variant = product.FindVariantByAttributes(attributeValueIds);

                    if (variant != null)
                    {
                        productVariantId = variant.Id;
                        Console.WriteLine($"Variant found: ID {variant.Id}");
                    }
                    else
                    {
                        Console.WriteLine($"WARNING: Could not find variant for attributes [{string.Join(", ", attributeValueIds)}]");
                        Console.WriteLine($"Attempting to remove by checking existing basket items...");

                        // Try to find the item in the basket by productId and attribute matching
                        var basketItem = basket.Items.FirstOrDefault(i =>
                            i.ProductId == productId &&
                            i.ProductVariant != null &&
                            i.ProductVariant.Attributes != null &&
                            i.ProductVariant.Attributes.Count == attributeValueIds.Count &&
                            i.ProductVariant.Attributes.All(a => attributeValueIds.Contains(a.AttributeValueId))
                        );

                        if (basketItem != null)
                        {
                            productVariantId = basketItem.ProductVariantId;
                            Console.WriteLine($"Found variant from basket item: ID {productVariantId}");
                        }
                        else
                        {
                            Console.WriteLine("ERROR: Could not find variant for the given attributes");
                            return BadRequest(new ProblemDetails { Title = "Product variant not found" });
                        }
                    }
                }
                else
                {
                    Console.WriteLine($"ERROR: Product {productId} not found");
                    return BadRequest(new ProblemDetails { Title = "Product not found" });
                }
            }
            else
            {
                Console.WriteLine("No attribute value IDs provided - removing standard product variant");
            }

            basket.RemoveItem(productId, productVariantId, quantity);

            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                Console.WriteLine("Item removed successfully");
                return Ok();
            }

            Console.WriteLine("ERROR: Failed to save changes");
            return BadRequest(new ProblemDetails { Title = "Problem removing item from the basket" });
        }

        private async Task<Basket?> RetrieveBasket(string buyerId)
        {
            if (string.IsNullOrEmpty(buyerId))
            {
                Response.Cookies.Delete("buyerId");
                return null;
            }

            /*return await _context.Baskets!
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .FirstOrDefaultAsync(basket => basket.UserId == buyerId);*/
            return await _context.Baskets!
                .Include(b => b.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Variants)
                            .ThenInclude(v => v.Attributes)
                                .ThenInclude(a => a.AttributeValue)
                                    .ThenInclude(av => av.Attribute)
                .Include(b => b.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Attributes)
                            .ThenInclude(a => a.AttributeValue)
                                .ThenInclude(av => av.Attribute)
                .FirstOrDefaultAsync(basket => basket.UserId == buyerId);
        }

        private string GetBuyerId()
        {
            return User.Identity?.Name ?? Request.Cookies["buyerId"]!;
        }

        private Basket CreateBasket()
        {

            var buyerId = User.Identity?.Name;
            if (string.IsNullOrEmpty(buyerId))
            {
                buyerId = Guid.NewGuid().ToString();
                var cookieOptions = new CookieOptions { IsEssential = true, Expires = DateTime.Now.AddDays(30) };
                Response.Cookies.Append("buyerId", buyerId, cookieOptions);
            }
            var basket = new Basket { UserId = buyerId };
            _context.Baskets!.Add(basket);
            return basket;
        }
    }
}
