using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Services;
using ManaVibePrints.Domain.Entities;
using ManaVibePrints.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ManaVibePrints.Tests;

public class DeliveryServiceTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"DeliveryDb_{Guid.NewGuid()}")
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task CheckDelivery_WithinFreeRadius_ReturnsFreeDelivery()
    {
        using var context = GetInMemoryDbContext();

        var settings = new StoreSettings
        {
            GpsLatitude = 17.4486m,
            GpsLongitude = 78.3742m,
            FreeDeliveryRadiusKm = 15.0m,
            MaxServiceRadiusKm = 50.0m,
            BaseDeliveryCharge = 99.0m
        };

        context.StoreSettings.Add(settings);
        await context.SaveChangesAsync();

        var service = new DeliveryService(context);

        // Near location (~3 km away in Hyderabad)
        var response = await service.CheckDeliveryEligibilityAsync(new CheckDeliveryRequest
        {
            CustomerLatitude = 17.4400m,
            CustomerLongitude = 78.3900m,
            OrderSubtotal = 500m
        });

        Assert.True(response.IsDeliverable);
        Assert.True(response.IsFreeDelivery);
        Assert.Equal(0m, response.DeliveryFee);
    }

    [Fact]
    public async Task CheckDelivery_BeyondMaxRadius_RejectsDelivery()
    {
        using var context = GetInMemoryDbContext();

        var settings = new StoreSettings
        {
            GpsLatitude = 17.4486m,
            GpsLongitude = 78.3742m, // Hyderabad
            FreeDeliveryRadiusKm = 15.0m,
            MaxServiceRadiusKm = 50.0m,
            BaseDeliveryCharge = 99.0m
        };

        context.StoreSettings.Add(settings);
        await context.SaveChangesAsync();

        var service = new DeliveryService(context);

        // Far location (Bengaluru: ~500 km away)
        var response = await service.CheckDeliveryEligibilityAsync(new CheckDeliveryRequest
        {
            CustomerLatitude = 12.9716m,
            CustomerLongitude = 77.5946m,
            OrderSubtotal = 1000m
        });

        Assert.False(response.IsDeliverable);
        Assert.Contains("exceeds our maximum service radius", response.Message);
    }

    [Fact]
    public void ValidateDpi_ReturnsCorrectQualityBadges()
    {
        using var context = GetInMemoryDbContext();
        var pricingService = new PricingCalculatorService(context);

        // 3000 x 3600 px image on a 10 x 12 inch area -> 300 DPI (Excellent / green)
        var resultHigh = pricingService.ValidateDpi(new ValidateDpiRequest
        {
            ImagePixelWidth = 3000,
            ImagePixelHeight = 3600,
            TargetPhysicalWidthInches = 10m,
            TargetPhysicalHeightInches = 12m
        });

        Assert.Equal(300, resultHigh.CalculatedDpi);
        Assert.Equal("Excellent", resultHigh.QualityLevel);
        Assert.Equal("green", resultHigh.BadgeColor);

        // 800 x 960 px image on 10 x 12 inch area -> 80 DPI (Low / red)
        var resultLow = pricingService.ValidateDpi(new ValidateDpiRequest
        {
            ImagePixelWidth = 800,
            ImagePixelHeight = 960,
            TargetPhysicalWidthInches = 10m,
            TargetPhysicalHeightInches = 12m
        });

        Assert.Equal(80, resultLow.CalculatedDpi);
        Assert.Equal("Low", resultLow.QualityLevel);
        Assert.Equal("red", resultLow.BadgeColor);
    }
}
