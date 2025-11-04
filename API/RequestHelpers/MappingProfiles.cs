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

            CreateMap<CreateProductDto, Product>()
                .ForMember(dest => dest.Variants, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore());

            CreateMap<UpdateProductDto, Product>()
                .ForMember(dest => dest.Variants, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore())
                .ForMember(dest => dest.PictureUrl, opt => opt.Ignore())
                .ForMember(dest => dest.PublicId, opt => opt.Ignore())
                .ForMember(dest => dest.DigitalFileUrl, opt => opt.Ignore());

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
