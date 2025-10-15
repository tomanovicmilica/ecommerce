namespace API.Entities
{
    public class OrderNotification
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string NotificationType { get; set; } = string.Empty; // email, sms
        public string Recipient { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsSent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? SentAt { get; set; }
    }
}
