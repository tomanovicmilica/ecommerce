using API.Dto;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers.Extensions
{
    public static class OrderExtensions
    {
        public static IQueryable<OrderDto> ProjectOrderToOrderDto(this IQueryable<Order> query)
        {
            return query
                .Select(order => new OrderDto
                {
                    OrderId = order.OrderId,
                    OrderNumber = order.OrderNumber,
                    UserId = order.UserId,
                    BuyerEmail = order.BuyerEmail,
                    OrderDate = order.OrderDate,
                    OrderStatus = order.OrderStatus.ToString(),
                    Subtotal = order.Subtotal,
                    TaxAmount = order.TaxAmount,
                    ShippingCost = order.ShippingCost,
                    TotalAmount = order.TotalAmount,
                    Currency = order.Currency,
                    PaymentIntentId = order.PaymentIntentId,
                    PaymentStatus = order.PaymentStatus.ToString(),
                    ShippingAddress = new OrderAddressDto
                    {
                        OrderAddressId = order.ShippingAddress.OrderAddressId,
                        UserId = order.ShippingAddress.UserId,
                        FirstName = order.ShippingAddress.FirstName,
                        LastName = order.ShippingAddress.LastName,
                        Company = order.ShippingAddress.Company,
                        AddressLine1 = order.ShippingAddress.AddressLine1,
                        AddressLine2 = order.ShippingAddress.AddressLine2,
                        City = order.ShippingAddress.City,
                        State = order.ShippingAddress.State,
                        PostalCode = order.ShippingAddress.PostalCode,
                        Country = order.ShippingAddress.Country,
                        PhoneNumber = order.ShippingAddress.PhoneNumber,
                        IsDefault = order.ShippingAddress.IsDefault,
                        AddressType = order.ShippingAddress.AddressType.ToString()
                    },
                    BillingAddress = order.BillingAddress != null ? new OrderAddressDto
                    {
                        OrderAddressId = order.BillingAddress.OrderAddressId,
                        UserId = order.BillingAddress.UserId,
                        FirstName = order.BillingAddress.FirstName,
                        LastName = order.BillingAddress.LastName,
                        Company = order.BillingAddress.Company,
                        AddressLine1 = order.BillingAddress.AddressLine1,
                        AddressLine2 = order.BillingAddress.AddressLine2,
                        City = order.BillingAddress.City,
                        State = order.BillingAddress.State,
                        PostalCode = order.BillingAddress.PostalCode,
                        Country = order.BillingAddress.Country,
                        PhoneNumber = order.BillingAddress.PhoneNumber,
                        IsDefault = order.BillingAddress.IsDefault,
                        AddressType = order.BillingAddress.AddressType.ToString()
                    } : null,
                    OrderItems = order.OrderItems.Select(item => new OrderItemDto
                    {
                        OrderItemId = item.OrderItemId,
                        ProductId = item.ProductId,
                        ProductVariantId = item.ProductVariantId,
                        ProductName = item.ProductName,
                        ProductDescription = item.ProductDescription,
                        UnitPrice = item.UnitPrice,
                        Quantity = item.Quantity,
                        LineTotal = item.LineTotal,
                        ProductImageUrl = item.ProductImageUrl,
                        Attributes = item.Attributes.Select(attr => new OrderItemAttributeDto
                        {
                            OrderItemAttributeId = attr.OrderItemAttributeId,
                            AttributeName = attr.AttributeName,
                            AttributeValue = attr.AttributeValue
                        }).ToList()
                    }).ToList(),
                    CreatedAt = order.CreatedAt,
                    UpdatedAt = order.UpdatedAt,
                    Notes = order.Notes,
                    TrackingNumber = order.TrackingNumber
                }).AsNoTracking();
        }
    }
}
