using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/delivery")]
public class DeliveryController : ControllerBase
{
    private readonly IDeliveryService _deliveryService;

    public DeliveryController(IDeliveryService deliveryService)
    {
        _deliveryService = deliveryService;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<object>> CalculateDelivery([FromBody] CheckDeliveryRequest request)
    {
        var result = await _deliveryService.CheckDeliveryEligibilityAsync(request);

        return Ok(new
        {
            deliveryFee = result.DeliveryFee,
            distanceKm = result.DistanceKm,
            isEligibleForDelivery = result.IsDeliverable,
            isFreeDelivery = result.IsFreeDelivery,
            rejectionReason = result.IsDeliverable ? null : result.Message,
            message = result.Message
        });
    }
}
