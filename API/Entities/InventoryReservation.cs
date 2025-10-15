namespace API.Entities
{
    public class InventoryReservation
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public int? ProductVariantId { get; set; }
        public int ReservedQuantity { get; set; }
        public DateTime ReservedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
        public bool IsReleased { get; set; }
    }
}
