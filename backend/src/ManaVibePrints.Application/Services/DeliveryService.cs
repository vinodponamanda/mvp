using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.Application.Services;

public class DeliveryService : IDeliveryService
{
    private readonly IApplicationDbContext _context;

    public DeliveryService(IApplicationDbContext context)
    {
        _context = context;
    }

    public double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0; // Earth radius in Kilometers

        double dLat = ToRadians(lat2 - lat1);
        double dLon = ToRadians(lon2 - lon1);

        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return Math.Round(R * c, 2);
    }

    private static double ToRadians(double deg) => deg * (Math.PI / 180.0);

    public async Task<CheckDeliveryResponse> CheckDeliveryEligibilityAsync(CheckDeliveryRequest request, CancellationToken cancellationToken = default)
    {
        var settings = await _context.StoreSettings.FirstOrDefaultAsync(cancellationToken);
        if (settings == null)
        {
            return new CheckDeliveryResponse
            {
                IsDeliverable = true,
                DistanceKm = 0,
                DeliveryFee = 0,
                IsFreeDelivery = true,
                Message = "Store delivery settings not configured. Default free delivery applied."
            };
        }

        double distance = CalculateHaversineDistance(
            (double)settings.GpsLatitude,
            (double)settings.GpsLongitude,
            (double)request.CustomerLatitude,
            (double)request.CustomerLongitude
        );

        double maxRadius = (double)settings.MaxServiceRadiusKm;
        double freeRadius = (double)settings.FreeDeliveryRadiusKm;

        if (distance > maxRadius)
        {
            return new CheckDeliveryResponse
            {
                IsDeliverable = false,
                DistanceKm = distance,
                DeliveryFee = 0,
                IsFreeDelivery = false,
                Message = $"Location is {distance} km away, which exceeds our maximum service radius of {maxRadius} km."
            };
        }

        if (distance <= freeRadius)
        {
            return new CheckDeliveryResponse
            {
                IsDeliverable = true,
                DistanceKm = distance,
                DeliveryFee = 0,
                IsFreeDelivery = true,
                Message = $"Location is within our {freeRadius} km free delivery zone ({distance} km)."
            };
        }

        return new CheckDeliveryResponse
        {
            IsDeliverable = true,
            DistanceKm = distance,
            DeliveryFee = settings.BaseDeliveryCharge,
            IsFreeDelivery = false,
            Message = $"Standard delivery charge applies (₹{settings.BaseDeliveryCharge:0}) for {distance} km."
        };
    }
}
