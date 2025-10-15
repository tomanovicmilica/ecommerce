using API.Dto;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers.Extensions
{
    public static class BasketExtensions
    {
        public static BasketDto MapBasketToDto(this Basket basket)
        {

            return new BasketDto
            {
                BasketId = basket.BasketId,
                BuyerId = basket.UserId,
                PaymentIntentId = basket.PaymentIntentId,
                ClientSecret = basket.ClientSecret,
                SubtotalPrice = basket.SubtotalPrice,
                Items = basket.Items.Select(item => new BasketItemDto
                {
                    ProductId = item.ProductId,
                    Name = item.Product!.Name,
                    Price = (long)(item.ProductVariant?.PriceOverride ?? item.Product.Price),
                    ProductVariantId = item.ProductVariantId,
                    Description = item.Product.Description,
                    ImageUrl = item.Product.PictureUrl,
                    Quantity = item.Quantity,
                    Attributes = GetItemAttributes(item),
                    AttributeValueIds = GetItemAttributeValueIds(item)
                }).ToList()
            };
        }

        private static List<VariantAttributeDto> GetItemAttributes(BasketItem item)
        {
            if (item.ProductVariant?.Attributes != null && item.ProductVariant.Attributes.Any())
            {
                return item.ProductVariant.Attributes
                    .Where(pva => pva.AttributeValue != null && pva.AttributeValue.Attribute != null)
                    .Select(pva => new VariantAttributeDto
                    {
                        AttributeName = pva.AttributeValue.Attribute.Name,
                        AttributeValue = pva.AttributeValue.Value
                    }).ToList();
            }

            // If ProductVariant is null but we have a ProductVariantId, try to reconstruct
            if (item.ProductVariantId.HasValue && item.Product?.Variants != null)
            {
                var variant = item.Product.Variants.FirstOrDefault(v => v.Id == item.ProductVariantId.Value);
                if (variant?.Attributes != null)
                {
                    return variant.Attributes
                        .Where(pva => pva.AttributeValue != null && pva.AttributeValue.Attribute != null)
                        .Select(pva => new VariantAttributeDto
                        {
                            AttributeName = pva.AttributeValue.Attribute.Name,
                            AttributeValue = pva.AttributeValue.Value
                        }).ToList();
                }
            }

            return new List<VariantAttributeDto>();
        }

        private static List<int> GetItemAttributeValueIds(BasketItem item)
        {
            if (item.ProductVariant?.Attributes != null && item.ProductVariant.Attributes.Any())
            {
                return item.ProductVariant.Attributes
                    .Where(pva => pva.AttributeValue != null)
                    .Select(pva => pva.AttributeValueId)
                    .ToList();
            }

            // If ProductVariant is null but we have a ProductVariantId, try to reconstruct
            if (item.ProductVariantId.HasValue && item.Product?.Variants != null)
            {
                var variant = item.Product.Variants.FirstOrDefault(v => v.Id == item.ProductVariantId.Value);
                if (variant?.Attributes != null)
                {
                    return variant.Attributes
                        .Where(pva => pva.AttributeValue != null)
                        .Select(pva => pva.AttributeValueId)
                        .ToList();
                }
            }

            return new List<int>();
        }

        public static IQueryable<Basket> RetrieveBasketWithItems(this IQueryable<Basket> query, string buyerId)
        {
            return query
                .Include(i => i.Items)
                .ThenInclude(p => p.Product)
                .Include(i => i.Items)
                .ThenInclude(i => i.ProductVariant)
                .ThenInclude(pv => pv!.Attributes)
                .ThenInclude(pva => pva.AttributeValue)
                .ThenInclude(av => av.Attribute)
                .Where(basket => basket.UserId == buyerId);
        }
    }
}
