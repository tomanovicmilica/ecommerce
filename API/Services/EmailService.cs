using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;

namespace API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string toName, string subject, string body)
        {
            try
            {
                var emailSettings = _configuration.GetSection("EmailSettings");
                var smtpHost = emailSettings["SmtpHost"];
                var smtpPort = int.Parse(emailSettings["SmtpPort"] ?? "587");
                var smtpUsername = emailSettings["SmtpUsername"];
                var smtpPassword = emailSettings["SmtpPassword"];
                var fromEmail = emailSettings["FromEmail"];
                var fromName = emailSettings["FromName"];
                var enableSsl = bool.Parse(emailSettings["EnableSsl"] ?? "true");

                // Check if SMTP is configured
                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername))
                {
                    _logger.LogWarning("SMTP not configured. Email not sent to {Email}. Subject: {Subject}", toEmail, subject);
                    return;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(fromName, fromEmail));
                message.To.Add(new MailboxAddress(toName, toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = body,
                    TextBody = StripHtml(body) // Fallback for email clients that don't support HTML
                };

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();

                // Connect to SMTP server
                await client.ConnectAsync(smtpHost, smtpPort, enableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                // Authenticate
                await client.AuthenticateAsync(smtpUsername, smtpPassword);

                // Send email
                await client.SendAsync(message);

                // Disconnect
                await client.DisconnectAsync(true);

                _logger.LogInformation("Email sent successfully to {Email}. Subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}. Subject: {Subject}", toEmail, subject);
                throw;
            }
        }

        public async Task SendOrderEmailAsync(string toEmail, string toName, int orderId, string subject, string message)
        {
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #8B7355; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        .order-id {{ font-weight: bold; color: #8B7355; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>E-Commerce Store</h1>
        </div>
        <div class='content'>
            <h2>Poštovani/a {toName},</h2>
            <p>Porudžbina: <span class='order-id'>#{orderId}</span></p>
            <p>{message}</p>
        </div>
        <div class='footer'>
            <p>Ovo je automatska poruka. Molimo ne odgovarajte na ovaj email.</p>
            <p>&copy; 2024 E-Commerce Store. Sva prava zadržana.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, toName, subject, htmlBody);
        }

        public async Task SendUserEmailAsync(string toEmail, string toName, string subject, string message)
        {
            var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #8B7355; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>E-Commerce Store</h1>
        </div>
        <div class='content'>
            <h2>Poštovani/a {toName},</h2>
            <p>{message}</p>
        </div>
        <div class='footer'>
            <p>Ovo je automatska poruka. Molimo ne odgovarajte na ovaj email.</p>
            <p>&copy; 2024 E-Commerce Store. Sva prava zadržana.</p>
        </div>
    </div>
</body>
</html>";

            await SendEmailAsync(toEmail, toName, subject, htmlBody);
        }

        public async Task SendOrderConfirmationAsync(string toEmail, string toName, int orderId, decimal total)
        {
            var subject = $"Potvrda porudžbine #{orderId}";
            var message = $@"Hvala vam na kupovini! Vaša porudžbina je uspešno primljena i u obradi.

            <strong>Detalji porudžbine:</strong>
            <ul>
                <li>Broj porudžbine: #{orderId}</li>
                <li>Ukupan iznos: {(total / 100):N2} RSD</li>
            </ul>

            <p>Obaveštenje o statusu porudžbine ćete dobiti putem email-a.</p>";

            await SendOrderEmailAsync(toEmail, toName, orderId, subject, message);
        }

        public async Task SendOrderStatusUpdateAsync(string toEmail, string toName, int orderId, string newStatus, string? trackingNumber = null)
        {
            var subject = $"Promena statusa porudžbine #{orderId}";
            var statusMessage = newStatus switch
            {
                "Processing" => "Vaša porudžbina je u obradi.",
                "Shipped" => trackingNumber != null
                    ? $"Vaša porudžbina je poslata! Broj za praćenje pošiljke: <strong>{trackingNumber}</strong>"
                    : "Vaša porudžbina je poslata!",
                "Delivered" => "Vaša porudžbina je uspešno dostavljena. Hvala na poverenju!",
                "Cancelled" => "Vaša porudžbina je otkazana. Za više informacija kontaktirajte našu podršku.",
                _ => $"Status vaše porudžbine je promenjen na: {newStatus}"
            };

            var message = $@"{statusMessage}

            <p><strong>Broj porudžbine:</strong> #{orderId}</p>
            <p><strong>Novi status:</strong> {newStatus}</p>
            {(trackingNumber != null ? $"<p><strong>Broj za praćenje:</strong> {trackingNumber}</p>" : "")}";

            await SendOrderEmailAsync(toEmail, toName, orderId, subject, message);
        }

        private static string StripHtml(string html)
        {
            if (string.IsNullOrEmpty(html))
                return string.Empty;

            // Simple HTML stripping - in production, consider using HtmlAgilityPack
            return System.Text.RegularExpressions.Regex.Replace(html, "<.*?>", string.Empty);
        }
    }
}
