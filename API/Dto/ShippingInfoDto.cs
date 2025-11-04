namespace API.Dto
{
    public class ShippingInfoDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string ShippingMethodName { get; set; } = string.Empty;
        public string? CarrierName { get; set; }
        public string? TrackingNumber { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? EstimatedDeliveryDate { get; set; }
        public decimal ShippingCost { get; set; }
    }
}