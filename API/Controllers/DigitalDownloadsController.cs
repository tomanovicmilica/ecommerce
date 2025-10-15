using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace API.Controllers
{
    [Authorize]
    public class DigitalDownloadsController : BaseApiController
    {
        private readonly StoreContext _context;
        private readonly UserManager<User> _userManager;

        public DigitalDownloadsController(StoreContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<List<DigitalDownload>>> GetUserDownloads()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var downloads = await _context.DigitalDownloads
                .Include(d => d.OrderItem)
                .ThenInclude(oi => oi.Product)
                .Where(d => d.UserId == userId.Value)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return downloads;
        }

        [HttpGet("{downloadId}/token")]
        public async Task<ActionResult<object>> GetDownloadToken(int downloadId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var download = await _context.DigitalDownloads
                .FirstOrDefaultAsync(d => d.Id == downloadId && d.UserId == userId.Value);

            if (download == null) return NotFound();

            if (!download.CanDownload)
            {
                return BadRequest("Download limit exceeded or expired");
            }

            // Generate secure token
            var token = GenerateSecureToken();
            download.DownloadToken = token;
            await _context.SaveChangesAsync();

            return new { token };
        }

        [HttpGet("download/{token}")]
        [AllowAnonymous]
        public async Task<ActionResult> DownloadFile(string token)
        {
            var download = await _context.DigitalDownloads
                .Include(d => d.OrderItem)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(d => d.DownloadToken == token);

            if (download == null) return NotFound();

            if (!download.CanDownload)
            {
                return BadRequest("Download limit exceeded or expired");
            }

            // Update download count
            download.DownloadCount++;
            download.DownloadedAt = DateTime.UtcNow;

            // Clear token after use for security
            download.DownloadToken = null;

            await _context.SaveChangesAsync();

            // For demo purposes, return file content or redirect to file URL
            // In production, you'd typically serve the actual file from secure storage
            if (!string.IsNullOrEmpty(download.DigitalFileUrl))
            {
                // If it's a URL, redirect to it
                if (Uri.TryCreate(download.DigitalFileUrl, UriKind.Absolute, out var uri))
                {
                    return Redirect(download.DigitalFileUrl);
                }

                // If it's a file path, serve the file
                var filePath = Path.Combine("wwwroot", "digital-files", download.DigitalFileUrl);
                if (System.IO.File.Exists(filePath))
                {
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                    var fileName = Path.GetFileName(download.DigitalFileUrl);
                    return File(fileBytes, "application/octet-stream", fileName);
                }
            }

            return NotFound("File not found");
        }

        [HttpPost("{downloadId}/complete")]
        public async Task<ActionResult> MarkDownloadCompleted(int downloadId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var download = await _context.DigitalDownloads
                .FirstOrDefaultAsync(d => d.Id == downloadId && d.UserId == userId.Value);

            if (download == null) return NotFound();

            download.IsCompleted = true;
            await _context.SaveChangesAsync();

            return Ok();
        }

        private int? GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (int.TryParse(userIdString, out var userId))
            {
                return userId;
            }
            return null;
        }

        private string GenerateSecureToken()
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var tokenBytes = new byte[32];
                rng.GetBytes(tokenBytes);
                return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
            }
        }
    }
}