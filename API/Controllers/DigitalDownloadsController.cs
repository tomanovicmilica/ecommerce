using API.Data;
using API.Entities;
using API.Entities.enums;
using API.Services;
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
        private readonly ImageService _imageService;

        public DigitalDownloadsController(StoreContext context, UserManager<User> userManager, ImageService imageService)
        {
            _context = context;
            _userManager = userManager;
            _imageService = imageService;
        }

        [HttpGet]
        public async Task<ActionResult<List<object>>> GetUserDownloads()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var downloads = await _context.DigitalDownloads
                .Include(d => d.OrderItem)
                .ThenInclude(oi => oi.Product)
                .Where(d => d.UserId == userId.Value)
                .OrderByDescending(d => d.CreatedAt)
                .Select(d => new
                {
                    d.Id,
                    d.OrderItemId,
                    ProductId = d.OrderItem.Product!.ProductId,
                    d.ProductName,
                    d.DigitalFileUrl,
                    d.CreatedAt,
                    d.DownloadedAt,
                    ExpiresAt = d.ExpiresAt,
                    ExpiryDate = d.ExpiresAt, // For backwards compatibility
                    d.DownloadCount,
                    d.MaxDownloads,
                    d.IsCompleted,
                    IsActive = !d.IsExpired,
                    CanDownload = d.CanDownload,
                    IsExpired = d.IsExpired
                })
                .ToListAsync();

            return Ok(downloads);
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

            // Get the file URL
            string? downloadUrl = download.DigitalFileUrl;

            if (string.IsNullOrEmpty(downloadUrl))
            {
                return NotFound("File URL not found");
            }

            // Check if it's a Cloudinary URL - serve as proxy to avoid access issues
            if (Uri.TryCreate(downloadUrl, UriKind.Absolute, out var uri) &&
                uri.Host.Contains("cloudinary.com"))
            {
                Console.WriteLine($"[DigitalDownload] Attempting to fetch Cloudinary file: {downloadUrl}");

                try
                {
                    // Download the file from Cloudinary and serve it
                    using var httpClient = new HttpClient();
                    httpClient.Timeout = TimeSpan.FromSeconds(30);

                    var response = await httpClient.GetAsync(downloadUrl);

                    Console.WriteLine($"[DigitalDownload] Cloudinary response status: {response.StatusCode}");

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"[DigitalDownload] Cloudinary error response: {errorContent}");
                        Console.WriteLine($"[DigitalDownload] Response headers: {response.Headers}");
                        return StatusCode((int)response.StatusCode, $"Cloudinary returned error: {response.StatusCode}. Check backend logs for details.");
                    }

                    var fileBytes = await response.Content.ReadAsByteArrayAsync();
                    var fileName = download.ProductName + ".pdf";

                    Console.WriteLine($"[DigitalDownload] Successfully fetched file, size: {fileBytes.Length} bytes");

                    // Update download count
                    download.DownloadCount++;
                    download.DownloadedAt = DateTime.UtcNow;
                    download.DownloadToken = null;
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"[DigitalDownload] Serving file to user: {fileName}");

                    // Serve the file
                    return File(fileBytes, "application/pdf", fileName);
                }
                catch (HttpRequestException httpEx)
                {
                    Console.WriteLine($"[DigitalDownload] HTTP Request Exception: {httpEx.Message}");
                    Console.WriteLine($"[DigitalDownload] Status Code: {httpEx.StatusCode}");
                    return StatusCode(500, $"Failed to fetch file from Cloudinary: {httpEx.Message}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[DigitalDownload] General Exception: {ex.GetType().Name}");
                    Console.WriteLine($"[DigitalDownload] Message: {ex.Message}");
                    Console.WriteLine($"[DigitalDownload] Stack trace: {ex.StackTrace}");
                    return StatusCode(500, $"Failed to fetch file: {ex.Message}");
                }
            }
            else
            {
                // For local files, serve them directly
                // Remove leading slash if present
                var relativePath = downloadUrl.TrimStart('/');
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

                Console.WriteLine($"[DigitalDownload] Looking for local file at: {filePath}");

                if (System.IO.File.Exists(filePath))
                {
                    Console.WriteLine($"[DigitalDownload] File found, serving...");

                    var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
                    var fileName = Path.GetFileName(downloadUrl);

                    // Update download count before serving file
                    download.DownloadCount++;
                    download.DownloadedAt = DateTime.UtcNow;
                    download.DownloadToken = null;
                    await _context.SaveChangesAsync();

                    return File(fileBytes, "application/pdf", fileName);
                }
                else
                {
                    Console.WriteLine($"[DigitalDownload] File NOT found at: {filePath}");
                    return NotFound($"File not found on server at: {filePath}");
                }
            }
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

        // Debug endpoint to check download status
        [HttpGet("{downloadId}/status")]
        public async Task<ActionResult<object>> GetDownloadStatus(int downloadId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var download = await _context.DigitalDownloads
                .FirstOrDefaultAsync(d => d.Id == downloadId && d.UserId == userId.Value);

            if (download == null) return NotFound();

            return Ok(new
            {
                downloadId = download.Id,
                productName = download.ProductName,
                downloadCount = download.DownloadCount,
                maxDownloads = download.MaxDownloads,
                remainingDownloads = download.MaxDownloads - download.DownloadCount,
                expiresAt = download.ExpiresAt,
                isExpired = download.IsExpired,
                canDownload = download.CanDownload,
                digitalFileUrl = download.DigitalFileUrl
            });
        }

        // Reset download count for testing (development only - remove in production)
        [HttpPost("{downloadId}/reset")]
        public async Task<ActionResult> ResetDownload(int downloadId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var download = await _context.DigitalDownloads
                .FirstOrDefaultAsync(d => d.Id == downloadId && d.UserId == userId.Value);

            if (download == null) return NotFound();

            download.DownloadCount = 0;
            download.DownloadToken = null;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Download count reset successfully" });
        }

        // Sync download URL from product (for current user's downloads)
        [HttpPost("{downloadId}/sync-url")]
        public async Task<ActionResult> SyncDownloadUrl(int downloadId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var download = await _context.DigitalDownloads
                .Include(d => d.OrderItem)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(d => d.Id == downloadId && d.UserId == userId.Value);

            if (download == null) return NotFound();

            if (download.OrderItem?.Product?.DigitalFileUrl != null)
            {
                var oldUrl = download.DigitalFileUrl;
                var newUrl = download.OrderItem.Product.DigitalFileUrl;

                download.DigitalFileUrl = newUrl;
                await _context.SaveChangesAsync();

                Console.WriteLine($"[DigitalDownload] Synced URL for download {downloadId}: {oldUrl} -> {newUrl}");

                return Ok(new
                {
                    message = "Download URL synced from product",
                    oldUrl = oldUrl,
                    newUrl = newUrl
                });
            }

            return BadRequest("Could not find product file URL");
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

        // Admin endpoint to sync digital download URLs from products
        [HttpPost("admin/sync-urls")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> SyncDownloadUrls()
        {
            Console.WriteLine("[DigitalDownload-Admin] Starting to sync download URLs from products...");

            var downloads = await _context.DigitalDownloads
                .Include(d => d.OrderItem)
                .ThenInclude(oi => oi.Product)
                .ToListAsync();

            int updatedCount = 0;

            foreach (var download in downloads)
            {
                if (download.OrderItem?.Product?.DigitalFileUrl != null)
                {
                    var oldUrl = download.DigitalFileUrl;
                    var newUrl = download.OrderItem.Product.DigitalFileUrl;

                    if (oldUrl != newUrl)
                    {
                        Console.WriteLine($"[DigitalDownload-Admin] Updating download {download.Id}: {oldUrl} -> {newUrl}");
                        download.DigitalFileUrl = newUrl;
                        updatedCount++;
                    }
                }
            }

            await _context.SaveChangesAsync();

            Console.WriteLine($"[DigitalDownload-Admin] Updated {updatedCount} download URLs");

            return Ok(new
            {
                message = $"Synced {updatedCount} download URLs from products",
                updated = updatedCount,
                total = downloads.Count
            });
        }

        // Admin endpoint to retroactively create digital downloads for existing orders
        [HttpPost("admin/generate-missing")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GenerateMissingDownloads()
        {
            Console.WriteLine("[DigitalDownload-Admin] Starting to generate missing downloads...");

            // Find all orders with digital products that don't have downloads yet
            var ordersWithDigitalProducts = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.ContainsDigitalProducts && o.UserId.HasValue)
                .ToListAsync();

            Console.WriteLine($"[DigitalDownload-Admin] Found {ordersWithDigitalProducts.Count} orders with digital products");

            int createdCount = 0;
            int skippedCount = 0;

            foreach (var order in ordersWithDigitalProducts)
            {
                var digitalItems = order.OrderItems
                    .Where(oi => oi.Product?.ProductType == ProductType.Digital && !string.IsNullOrEmpty(oi.Product.DigitalFileUrl))
                    .ToList();

                foreach (var item in digitalItems)
                {
                    // Check if download already exists
                    var existingDownload = await _context.DigitalDownloads
                        .FirstOrDefaultAsync(d => d.OrderItemId == item.OrderItemId);

                    if (existingDownload != null)
                    {
                        skippedCount++;
                        continue;
                    }

                    // Create digital download
                    var download = new DigitalDownload
                    {
                        OrderItemId = item.OrderItemId,
                        UserId = order.UserId.Value,
                        ProductName = item.ProductName,
                        DigitalFileUrl = item.Product!.DigitalFileUrl!,
                        ExpiresAt = DateTime.UtcNow.AddDays(30),
                        MaxDownloads = 3
                    };

                    _context.DigitalDownloads.Add(download);
                    createdCount++;
                }
            }

            await _context.SaveChangesAsync();

            Console.WriteLine($"[DigitalDownload-Admin] Created {createdCount} downloads, skipped {skippedCount}");

            return Ok(new
            {
                message = $"Generated {createdCount} missing digital downloads",
                created = createdCount,
                skipped = skippedCount
            });
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