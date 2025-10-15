namespace API.Entities.enums
{
    public enum PaymentStatus
    {
        Pending,
        RequiresAction,
        Succeeded,
        Failed,
        Cancelled,
        Refunded,
        PartiallyRefunded
    }
}
