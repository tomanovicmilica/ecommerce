namespace API.Entities
{
    public class SystemSettings
    {
        public int Id { get; set; }

        // General Settings
        public string SiteName { get; set; } = "E-Commerce Store";
        public string SiteDescription { get; set; } = "Your premier online shopping destination";
        public string AdminEmail { get; set; } = "admin@ecommerce.com";
        public string Timezone { get; set; } = "UTC";
        public string Currency { get; set; } = "USD";
        public string Language { get; set; } = "en";

        // Security Settings
        public bool MaintenanceMode { get; set; } = false;
        public bool AllowRegistration { get; set; } = true;
        public bool RequireEmailVerification { get; set; } = true;
        public int SessionTimeout { get; set; } = 30; // minutes
        public int MaxLoginAttempts { get; set; } = 5;

        // Notification Settings
        public bool EmailNotifications { get; set; } = true;
        public bool SmsNotifications { get; set; } = false;

        // System Maintenance
        public string BackupFrequency { get; set; } = "daily";
        public string LogLevel { get; set; } = "info";

        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
