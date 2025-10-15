namespace API.Dto
{
    public class OrderStatusHistoryDto
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string FromStatus { get; set; } = string.Empty;
        public string ToStatus { get; set; } = string.Empty;
        public DateTime ChangedAt { get; set; }
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        public int? UserId { get; set; }
        public string? UserName { get; set; } // For display purposes
        public string UpdatedBy { get; set; } = "System";
    }
}