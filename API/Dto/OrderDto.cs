namespace API.Dto
{
    public class OrderDto
    {
        public int OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string BuyerEmail { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal TotalAmount { get; set; }
        public string Currency { get; set; } = "USD";
        public string? PaymentIntentId { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public OrderAddressDto ShippingAddress { get; set; } = null!;
        public OrderAddressDto? BillingAddress { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
    }
}