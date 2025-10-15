using API.Entities.enums;

namespace API.Dto
{
    public class UpdateOrderStatusDto
    {
        public OrderStatus Status { get; set; }
        public string? Notes { get; set; }
    }
}
