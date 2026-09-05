using ManaVibePrints.Application.DTOs;

namespace ManaVibePrints.Application.Interfaces;

public interface IDeliveryService
{
    Task<CheckDeliveryResponse> CheckDeliveryEligibilityAsync(CheckDeliveryRequest request, CancellationToken cancellationToken = default);
    double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2);
}
