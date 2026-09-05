using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Services;
using ManaVibePrints.Domain.Entities;
using ManaVibePrints.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace ManaVibePrints.Tests;

public class PricingCalculatorTests
{
    private ApplicationDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: $"TestDb_{Guid.NewGuid()}")
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }

    [Fact]
    public async Task CalculatePrice_SinglePiece_CalculatesCorrectBasePrice()
    {
        using var context = GetInMemoryDbContext();

        var product = new Product
        {
            Name = "Test T-Shirt",
            Slug = "test-tshirt",
            BasePrice = 499.00m,
            IsActive = true
        };

        var frontPrint = new PrintArea
        {
            PositionName = "Front",
            ExtraCost = 0m,
            PhysicalWidthInches = 10m,
            PhysicalHeightInches = 12m
        };

        var backPrint = new PrintArea
        {
            PositionName = "Back",
            ExtraCost = 100m,
            PhysicalWidthInches = 12m,
            PhysicalHeightInches = 14m
        };

        product.PrintAreas.Add(frontPrint);
        product.PrintAreas.Add(backPrint);

        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 1, MaxQuantity = 5, UnitPrice = 499m, DiscountPercentage = 0m });
        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 6, MaxQuantity = 20, UnitPrice = 399m, DiscountPercentage = 20m });
        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 21, MaxQuantity = null, UnitPrice = 299m, DiscountPercentage = 40m });

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new PricingCalculatorService(context);

        // 1 piece with Front only
        var response = await service.CalculatePriceAsync(new CalculatePriceRequest
        {
            ProductId = product.Id,
            Quantity = 1,
            ActivePrintAreaIds = new List<Guid> { frontPrint.Id }
        });

        Assert.Equal(499m, response.UnitPrice);
        Assert.Equal(499m, response.Subtotal);
        Assert.Equal(0m, response.ExtraPrintAreaCost);
    }

    [Fact]
    public async Task CalculatePrice_BulkQuantity_AppliesTierDiscountAndExtraPrintSide()
    {
        using var context = GetInMemoryDbContext();

        var product = new Product
        {
            Name = "Bulk Tee",
            Slug = "bulk-tee",
            BasePrice = 499.00m,
            IsActive = true
        };

        var frontPrint = new PrintArea { PositionName = "Front", ExtraCost = 0m };
        var backPrint = new PrintArea { PositionName = "Back", ExtraCost = 120m };

        product.PrintAreas.Add(frontPrint);
        product.PrintAreas.Add(backPrint);

        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 1, MaxQuantity = 5, UnitPrice = 499m });
        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 6, MaxQuantity = 20, UnitPrice = 399m });
        product.VolumeTiers.Add(new VolumePricingTier { MinQuantity = 21, MaxQuantity = null, UnitPrice = 249m });

        context.Products.Add(product);
        await context.SaveChangesAsync();

        var service = new PricingCalculatorService(context);

        // 10 pieces with Front + Back print (+120 extra side cost per piece)
        var response = await service.CalculatePriceAsync(new CalculatePriceRequest
        {
            ProductId = product.Id,
            Quantity = 10,
            ActivePrintAreaIds = new List<Guid> { frontPrint.Id, backPrint.Id }
        });

        // Tier price for 10 pcs = 399. Extra side cost = 120. Total unit price = 519.
        // Subtotal for 10 pcs = 519 * 10 = 5190.
        Assert.Equal(399m, response.TierUnitPrice);
        Assert.Equal(120m, response.ExtraPrintAreaCost);
        Assert.Equal(519m, response.UnitPrice);
        Assert.Equal(5190m, response.Subtotal);
        Assert.Contains("Tier 6-20", response.AppliedTierSummary);
    }
}
