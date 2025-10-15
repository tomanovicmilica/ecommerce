namespace API.Dto
{
    public class UpdateTrackingDto
    {
        public string TrackingNumber { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}