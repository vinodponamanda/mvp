using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IDeliveryService _deliveryService;

    public SettingsController(IApplicationDbContext context, IDeliveryService deliveryService)
    {
        _context = context;
        _deliveryService = deliveryService;
    }

    [HttpGet]
    public async Task<ActionResult<StoreSettingsDto>> GetStoreSettings()
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync();
        if (settings == null) return NotFound(new { message = "Store settings not found." });

        return Ok(new StoreSettingsDto
        {
            Id = settings.Id,
            StoreName = settings.StoreName,
            Phone = settings.Phone,
            WhatsApp = settings.WhatsApp,
            Email = settings.Email,
            Address = settings.Address,
            GpsLatitude = settings.GpsLatitude,
            GpsLongitude = settings.GpsLongitude,
            FreeDeliveryRadiusKm = settings.FreeDeliveryRadiusKm,
            MaxServiceRadiusKm = settings.MaxServiceRadiusKm,
            BaseDeliveryCharge = settings.BaseDeliveryCharge,
            MinOrderValue = settings.MinOrderValue,
            UpdatedAt = settings.UpdatedAt
        });
    }

    [HttpPost("check-delivery")]
    public async Task<ActionResult<CheckDeliveryResponse>> CheckDelivery([FromBody] CheckDeliveryRequest request)
    {
        var response = await _deliveryService.CheckDeliveryEligibilityAsync(request);
        return Ok(response);
    }
}
