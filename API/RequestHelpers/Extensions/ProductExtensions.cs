using API.Dto;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers.Extensions
{
    public static class ProductExtensions
    {
        public static IQueryable<Product> Sort(this IQueryable<Product> query, string orderBy)
        {

            if (string.IsNullOrWhiteSpace(orderBy)) return query.OrderBy(p => p.Name);

            query = orderBy switch
            {
                "price" => query.OrderBy(p => p.Price),
                "priceDesc" => query.OrderByDescending(p => p.Price),
                _ => query.OrderBy(n => n.Name)
            };

            return query;
        }

        public static IQueryable<Product> Search(this IQueryable<Product> query, string searchTerm)
        {
            if (string.IsNullOrEmpty(searchTerm)) return query;

            var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

            return query.Where(p => p.Name!.ToLower().Contains(lowerCaseSearchTerm));
        }

        public static IQueryable<Product> Filter(this IQueryable<Product> query, string type)
        {
            var categoryList = new List<string>();

            if (!string.IsNullOrEmpty(type))
                categoryList.AddRange(type.ToLower().Split(",").ToList());

            query = query.Where(p => categoryList.Count == 0 || categoryList.Contains(p.Category!.Name!.ToLower()));

            return query;
        }

        public static IQueryable<Product> FilterByProductType(this IQueryable<Product> query, string productTypes)
        {
            if (string.IsNullOrEmpty(productTypes))
                return query;

            var typeList = productTypes.Split(',')
                .Where(t => int.TryParse(t.Trim(), out _))
                .Select(t => int.Parse(t.Trim()))
                .ToList();

            if (typeList.Any())
            {
                query = query.Where(p => typeList.Contains((int)p.ProductType));
            }

            return query;
        }
        public static IQueryable<UpdateProductDto> ProjectToProduct(this IQueryable<Product> query)
        {
            return query
                .Select(p => new UpdateProductDto
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Price = p.Price,
                    Description = p.Description,
                    CategoryName = p.Category!.Name,
                    CategoryId = p.CategoryId,
                    ImageUrl = p.PictureUrl,
                    ProductType = p.ProductType,
                    DigitalFileUrl = p.DigitalFileUrl,
                    IsInstantDelivery = p.IsInstantDelivery,
                    Variants = p.Variants.Select(v => new ProductVariantDto
                    {
                        ProductVariantId = v.Id,
                        ProductId = v.ProductId,
                        Price = v.PriceOverride ?? p.Price,
                        QuantityInStock = v.QuantityInStock,
                        AttributeValueIds = v.Attributes
                                        .Select(pva => pva.AttributeValueId)
                                        .ToList(),
                        Attributes = v.Attributes
                                  .Select(pva => new VariantAttributeDto
                                  {
                                      AttributeName = pva.AttributeValue.Attribute.Name,
                                      AttributeValue = pva.AttributeValue.Value
                                  }).ToList()
                    }).ToList()
                }).AsNoTracking();
        }
        public static ProductVariant? FindVariantByAttributes(this Product product, List<int> attributeValueIds)
        {
            if (attributeValueIds == null || !attributeValueIds.Any())
                return null;

            var attributeSet = attributeValueIds.ToHashSet();

            return product.Variants.FirstOrDefault(v =>
                v.Attributes.Select(a => a.AttributeValueId).ToHashSet().SetEquals(attributeSet));
        }

        public static int? ResolveVariantId(this Product product, List<int> attributeValueIds)
        {
            var variant = product.FindVariantByAttributes(attributeValueIds);
            return variant?.Id;
        }

    }

    }
