using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomizerController : ControllerBase
{
    private readonly IPricingCalculatorService _pricingCalculator;

    public CustomizerController(IPricingCalculatorService pricingCalculator)
    {
        _pricingCalculator = pricingCalculator;
    }

    [HttpPost("calculate-price")]
    public async Task<ActionResult<CalculatePriceResponse>> CalculatePrice([FromBody] CalculatePriceRequest request)
    {
        try
        {
            var response = await _pricingCalculator.CalculatePriceAsync(request);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("validate-dpi")]
    public ActionResult<ValidateDpiResponse> ValidateDpi([FromBody] ValidateDpiRequest request)
    {
        var response = _pricingCalculator.ValidateDpi(request);
        return Ok(response);
    }
}
