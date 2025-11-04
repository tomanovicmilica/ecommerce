using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Npgsql.BackendMessages;
using System.Security.Principal;

namespace API.Services
{
    public class ImageService
    {
        private readonly Cloudinary _cloudinary;
        private readonly string _cloudName;

        public ImageService(IConfiguration config)
        {
            _cloudName = config["Cloudinary:CloudName"] ?? throw new ArgumentNullException("Cloudinary:CloudName");

            var acc = new Account
            (
                _cloudName,
                config["Cloudinary:ApiKey"],
                config["Cloudinary:ApiSecret"]
            );

            _cloudinary = new Cloudinary(acc);
        }

        public async Task<ImageUploadResult> AddImageAsync(IFormFile file)
        {
            var uploadResult = new ImageUploadResult();

            if (file.Length > 0)
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream)
                };
                uploadResult = await _cloudinary.UploadAsync(uploadParams);
            }

            return uploadResult;
        }

        public async Task<RawUploadResult> AddDigitalFileAsync(IFormFile file)
        {
            var uploadResult = new RawUploadResult();

            if (file.Length > 0)
            {
                // Store files locally instead of Cloudinary to avoid ACL issues
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "digital-files");

                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                // Save file to disk
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Create a result that mimics Cloudinary response
                // Store relative path instead of Cloudinary URL
                uploadResult.SecureUrl = new Uri($"/digital-files/{uniqueFileName}", UriKind.Relative);
                uploadResult.PublicId = Path.GetFileNameWithoutExtension(uniqueFileName);

                Console.WriteLine($"[ImageService] Digital file saved locally: {filePath}");
            }

            return uploadResult;
        }

        public async Task<DeletionResult> DeleteImageAsync(string publicId)
        {
            var deleteParams = new DeletionParams(publicId);

            var result = await _cloudinary.DestroyAsync(deleteParams);

            return result;
        }

        public string GenerateDownloadUrl(string publicId, string resourceType = "raw")
        {
            // For raw files, Cloudinary URLs should just be the direct URL without transformations
            // The file is already set to AccessMode = "public" when uploaded
            // Simply return the direct Cloudinary URL
            var url = _cloudinary.Api.UrlImgUp
                .ResourceType(resourceType)
                .Secure(true)
                .BuildUrl(publicId);

            // Add .pdf extension if not present
            if (!url.EndsWith(".pdf"))
            {
                url += ".pdf";
            }

            return url;
        }

        public string GetPublicIdFromUrl(string url)
        {
            // Extract public ID from Cloudinary URL
            // URL format: https://res.cloudinary.com/[cloud-name]/[resource-type]/upload/v[version]/[public-id].[extension]
            if (string.IsNullOrEmpty(url)) return string.Empty;

            var uri = new Uri(url);
            var segments = uri.AbsolutePath.Split('/');

            // Find the upload segment
            var uploadIndex = Array.IndexOf(segments, "upload");
            if (uploadIndex == -1 || uploadIndex + 2 >= segments.Length) return string.Empty;

            // Get everything after version (v123456)
            var fileWithExtension = string.Join("/", segments.Skip(uploadIndex + 2));

            // Remove extension
            var lastDotIndex = fileWithExtension.LastIndexOf('.');
            if (lastDotIndex > 0)
            {
                return fileWithExtension.Substring(0, lastDotIndex);
            }

            return fileWithExtension;
        }
    }
}
