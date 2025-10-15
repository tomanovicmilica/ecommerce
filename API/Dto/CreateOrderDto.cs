namespace API.Dto
{
    public class CreateOrderDto
    {
        public int BasketId { get; set; }
        public OrderAddressDto ShippingAddress { get; set; } = null!;
        public OrderAddressDto? BillingAddress { get; set; }
    }
}
