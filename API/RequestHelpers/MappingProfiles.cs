using API.Dto;
using API.Entities;
using AutoMapper;
using Attribute = API.Entities.Attribute;

namespace API.RequestHelpers
{
    public class MappingProfiles: Profile
    {
        public MappingProfiles()
        {

            CreateMap<CreateProductDto, Product>();
            CreateMap<UpdateProductDto, Product>();
            CreateMap<CreateCategoryDto, Category>();
            CreateMap<UpdateCategoryDto, Category>();
            // Variants
            CreateMap<CreateProductVariantDto, ProductVariant>();

            // Attribute definitions
            CreateMap<CreateAttributeDto, Attribute>();

            // Attribute values
            CreateMap<CreateAttributeValueDto, AttributeValue>();

            // Order mappings
            CreateMap<OrderAddressDto, OrderAddress>();
            //CreateMap<PaymentMethodDto, PaymentMethod>();

        }
    }
}
