namespace API.Entities
{
    public class ShippingMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Cost { get; set; }
        public int EstimatedDays { get; set; }
        public bool IsActive { get; set; }
        public decimal? FreeShipping { get; set; }

        public ICollection<ShippingInfo> ShippingInfos { get; set; } = new List<ShippingInfo>();
    }
}
