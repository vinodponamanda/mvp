using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ManaVibePrints.Infrastructure.Services;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary? _cloudinary;
    private readonly ILogger<CloudinaryService> _logger;
    private readonly bool _isConfigured;

    public CloudinaryService(IConfiguration configuration, ILogger<CloudinaryService> logger)
    {
        _logger = logger;
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        if (!string.IsNullOrWhiteSpace(cloudName) &&
            !string.IsNullOrWhiteSpace(apiKey) &&
            !string.IsNullOrWhiteSpace(apiSecret) &&
            cloudName != "YOUR_CLOUD_NAME")
        {
            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
            _isConfigured = true;
        }
        else
        {
            _logger.LogWarning("Cloudinary credentials not provided or using defaults. Mocking file uploads for development.");
            _isConfigured = false;
        }
    }

    public async Task<UploadImageResponse> UploadImageAsync(Stream fileStream, string fileName, string folderName, CancellationToken cancellationToken = default)
    {
        if (_isConfigured && _cloudinary != null)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = $"manavibeprints/{folderName}",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Message}", uploadResult.Error.Message);
                throw new InvalidOperationException($"Cloudinary upload failed: {uploadResult.Error.Message}");
            }

            return new UploadImageResponse
            {
                Url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? string.Empty,
                PublicId = uploadResult.PublicId,
                Width = uploadResult.Width,
                Height = uploadResult.Height,
                Format = uploadResult.Format,
                Bytes = uploadResult.Bytes
            };
        }

        // Local development simulation fallback
        var simulatedPublicId = $"local_{folderName}_{Guid.NewGuid():N}";
        var simulatedUrl = $"https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&sim_id={simulatedPublicId}";

        return new UploadImageResponse
        {
            Url = simulatedUrl,
            PublicId = simulatedPublicId,
            Width = 1200,
            Height = 1200,
            Format = "png",
            Bytes = 512000
        };
    }

    public async Task<UploadImageResponse> UploadBase64ImageAsync(string base64Data, string fileName, string folderName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(base64Data))
        {
            return new UploadImageResponse { Url = string.Empty };
        }

        if (_isConfigured && _cloudinary != null)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, base64Data),
                Folder = $"manavibeprints/{folderName}",
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

            if (uploadResult.Error != null)
            {
                _logger.LogError("Cloudinary base64 upload failed: {Message}", uploadResult.Error.Message);
                return new UploadImageResponse { Url = base64Data }; // Fallback to raw base64 if Cloudinary throws
            }

            return new UploadImageResponse
            {
                Url = uploadResult.SecureUrl?.ToString() ?? uploadResult.Url?.ToString() ?? base64Data,
                PublicId = uploadResult.PublicId,
                Width = uploadResult.Width,
                Height = uploadResult.Height,
                Format = uploadResult.Format,
                Bytes = uploadResult.Bytes
            };
        }

        return new UploadImageResponse
        {
            Url = base64Data,
            PublicId = $"local_{folderName}_{Guid.NewGuid():N}",
            Width = 1200,
            Height = 1200,
            Format = "png",
            Bytes = 512000
        };
    }

    public async Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default)
    {
        if (_isConfigured && _cloudinary != null)
        {
            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);
            return result.Result == "ok";
        }

        return true;
    }
}
