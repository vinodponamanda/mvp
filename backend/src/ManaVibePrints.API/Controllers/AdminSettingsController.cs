using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/admin/settings")]
[Authorize(Roles = "SuperAdmin")]
public class AdminSettingsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminSettingsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPut]
    public async Task<ActionResult<StoreSettingsDto>> UpdateStoreSettings([FromBody] UpdateStoreSettingsRequest request)
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync();
        if (settings == null)
        {
            settings = new Domain.Entities.StoreSettings();
            _context.StoreSettings.Add(settings);
        }

        settings.StoreName = request.StoreName.Trim();
        settings.Phone = request.Phone.Trim();
        settings.WhatsApp = request.WhatsApp.Trim();
        settings.Email = request.Email.Trim();
        settings.Address = request.Address.Trim();
        settings.GpsLatitude = request.GpsLatitude;
        settings.GpsLongitude = request.GpsLongitude;
        settings.FreeDeliveryRadiusKm = request.FreeDeliveryRadiusKm;
        settings.MaxServiceRadiusKm = request.MaxServiceRadiusKm;
        settings.BaseDeliveryCharge = request.BaseDeliveryCharge;
        settings.MinOrderValue = request.MinOrderValue;
        settings.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

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
}
