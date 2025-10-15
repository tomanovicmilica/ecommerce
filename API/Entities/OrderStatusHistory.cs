using API.Entities.enums;

namespace API.Entities
{
    public class OrderStatusHistory
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;
        public OrderStatus FromStatus { get; set; }
        public OrderStatus ToStatus { get; set; }
        public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        public int? UserId { get; set; } // Who made the change
        public string UpdatedBy { get; set; } = "System";
    }
}
