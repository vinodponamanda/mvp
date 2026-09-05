using ManaVibePrints.Application.DTOs;

namespace ManaVibePrints.Application.Interfaces;

public interface IPricingCalculatorService
{
    Task<CalculatePriceResponse> CalculatePriceAsync(CalculatePriceRequest request, CancellationToken cancellationToken = default);
    ValidateDpiResponse ValidateDpi(ValidateDpiRequest request);
}
