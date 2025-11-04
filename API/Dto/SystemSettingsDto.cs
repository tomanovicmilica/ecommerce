namespace API.Dto
{
    public class SystemSettingsDto
    {
        // General Settings
        public string SiteName { get; set; } = string.Empty;
        public string SiteDescription { get; set; } = string.Empty;
        public string AdminEmail { get; set; } = string.Empty;
        public string Timezone { get; set; } = string.Empty;
        public string Currency { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;

        // Security Settings
        public bool MaintenanceMode { get; set; }
        public bool AllowRegistration { get; set; }
        public bool RequireEmailVerification { get; set; }
        public int SessionTimeout { get; set; }
        public int MaxLoginAttempts { get; set; }

        // Notification Settings
        public bool EmailNotifications { get; set; }
        public bool SmsNotifications { get; set; }

        // System Maintenance
        public string BackupFrequency { get; set; } = string.Empty;
        public string LogLevel { get; set; } = string.Empty;
    }
}
