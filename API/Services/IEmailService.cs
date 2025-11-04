namespace API.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string toName, string subject, string body);
        Task SendOrderEmailAsync(string toEmail, string toName, int orderId, string subject, string message);
        Task SendUserEmailAsync(string toEmail, string toName, string subject, string message);
        Task SendOrderConfirmationAsync(string toEmail, string toName, int orderId, decimal total);
        Task SendOrderStatusUpdateAsync(string toEmail, string toName, int orderId, string newStatus, string? trackingNumber = null);
    }
}
