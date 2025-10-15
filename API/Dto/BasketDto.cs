namespace API.Dto
{
    public class BasketDto
    {
        public int BasketId { get; set; }

        public string? BuyerId { get; set; }

        public List<BasketItemDto>? Items { get; set; }

        public int SubtotalPrice { get; set; }

        public string? PaymentIntentId { get; set; }
        public string? ClientSecret { get; set; }
    }
}
