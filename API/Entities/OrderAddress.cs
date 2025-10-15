using API.Entities.enums;
using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class OrderAddress
    {
        [Key]
        public int OrderAddressId { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Company { get; set; }

        [Required]
        [MaxLength(255)]
        public string AddressLine1 { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? AddressLine2 { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public bool IsDefault { get; set; }

        public AddressType AddressType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Order> ShippingOrders { get; set; } = new List<Order>();
        public ICollection<Order> BillingOrders { get; set; } = new List<Order>();
    }
}
