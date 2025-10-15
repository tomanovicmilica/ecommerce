using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class DigitalDownload
    {
        [Key]
        public int Id { get; set; }

        public int OrderItemId { get; set; }
        public OrderItem OrderItem { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public string ProductName { get; set; }
        public string DigitalFileUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DownloadedAt { get; set; }
        public DateTime ExpiresAt { get; set; }

        public int DownloadCount { get; set; } = 0;
        public int MaxDownloads { get; set; } = 3;

        public bool IsCompleted { get; set; } = false;
        public string? DownloadToken { get; set; }

        public bool IsExpired => DateTime.UtcNow > ExpiresAt;
        public bool CanDownload => !IsExpired && DownloadCount < MaxDownloads;
    }
}