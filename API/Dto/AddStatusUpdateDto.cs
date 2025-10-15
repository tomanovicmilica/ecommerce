namespace API.Dto
{
    public class AddStatusUpdateDto
    {
        public string Status { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string? TrackingNumber { get; set; }
        public bool SendCustomerEmail { get; set; } = true;
    }
}