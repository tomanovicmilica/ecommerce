using System.ComponentModel.DataAnnotations;
using API.Entities.enums;

namespace API.Entities
{
    public class UserAddress
    {
        [Key]
        public int UserAddressId { get; set; }

        public int? UserId { get; set; }

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public string? Company { get; set; }

        public string AddressLine1 { get; set; } = string.Empty;

        public string? AddressLine2 { get; set; }

        public string City { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        public string PostalCode { get; set; } = string.Empty;

        public string Country { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        public bool IsDefault { get; set; }

        public AddressType AddressType { get; set; } = AddressType.Shipping;
    }
}
