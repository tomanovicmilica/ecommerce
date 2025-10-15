namespace API.Dto
{
    public class CreatePaymentIntentDto
    {
        public string PaymentIntentId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
    }
}
