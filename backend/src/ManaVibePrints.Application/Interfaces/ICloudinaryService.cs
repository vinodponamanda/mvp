using ManaVibePrints.Application.DTOs;

namespace ManaVibePrints.Application.Interfaces;

public interface ICloudinaryService
{
    Task<UploadImageResponse> UploadImageAsync(Stream fileStream, string fileName, string folderName, CancellationToken cancellationToken = default);
    Task<UploadImageResponse> UploadBase64ImageAsync(string base64Data, string fileName, string folderName, CancellationToken cancellationToken = default);
    Task<bool> DeleteImageAsync(string publicId, CancellationToken cancellationToken = default);
}
