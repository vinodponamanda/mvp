using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadsController : ControllerBase
{
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<UploadsController> _logger;

    public UploadsController(ICloudinaryService cloudinaryService, ILogger<UploadsController> logger)
    {
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    [HttpPost("image")]
    [HttpPost("artwork")]
    public async Task<ActionResult<UploadImageResponse>> UploadImage(
        [FromForm] IFormFile? file,
        [FromForm] string? folder = null,
        [FromQuery] string? folderName = null)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "Please select a valid image file to upload." });
        }

        // Limit file size to 35MB for high resolution 300 DPI master artworks
        if (file.Length > 35 * 1024 * 1024)
        {
            return BadRequest(new { message = "Image size exceeds maximum limit of 35MB." });
        }

        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".svg", ".webp", ".pdf", ".tif", ".tiff" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = $"Unsupported file format '{extension}'. Allowed: PNG, JPG, JPEG, SVG, WEBP, PDF, TIFF." });
        }

        try
        {
            string targetFolder = !string.IsNullOrWhiteSpace(folder) 
                ? folder 
                : (!string.IsNullOrWhiteSpace(folderName) ? folderName : "customer-artworks");

            using var stream = file.OpenReadStream();
            var response = await _cloudinaryService.UploadImageAsync(stream, file.FileName, targetFolder);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file '{FileName}'", file.FileName);
            return StatusCode(500, new { message = "Failed to upload file. Please try again." });
        }
    }
}
