namespace API.Entities
{
    public class ShippingInfo
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public int ShippingMethodId { get; set; }
        public ShippingMethod ShippingMethod { get; set; } = null!;
        public string? CarrierName { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public decimal ShippingCost { get; set; }
    }
}
