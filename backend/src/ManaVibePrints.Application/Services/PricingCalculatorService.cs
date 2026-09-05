using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.Application.Services;

public class PricingCalculatorService : IPricingCalculatorService
{
    private readonly IApplicationDbContext _context;

    public PricingCalculatorService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CalculatePriceResponse> CalculatePriceAsync(CalculatePriceRequest request, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products
            .Include(p => p.Materials)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID '{request.ProductId}' was not found.");
        }

        int quantity = Math.Max(1, request.Quantity);
        decimal basePrice = product.BasePrice;
        decimal materialAdjustment = 0m;
        decimal sizeAdjustment = 0m;

        if (request.MaterialId.HasValue)
        {
            var material = product.Materials.FirstOrDefault(m => m.Id == request.MaterialId.Value);
            if (material != null)
            {
                materialAdjustment = material.PriceAdjustment;
            }
        }
        else
        {
            var defaultMaterial = product.Materials.FirstOrDefault(m => m.IsDefault);
            if (defaultMaterial != null)
            {
                materialAdjustment = defaultMaterial.PriceAdjustment;
            }
        }

        if (request.SizeId.HasValue)
        {
            var size = product.Sizes.FirstOrDefault(s => s.Id == request.SizeId.Value);
            if (size != null)
            {
                sizeAdjustment = size.PriceAdjustment;
            }
        }

        // Calculate Extra Cost from multiple print sides (e.g. Front is 0, Back is +100, Sleeve is +60)
        decimal extraPrintAreaCost = 0m;
        if (request.ActivePrintAreaIds != null && request.ActivePrintAreaIds.Count > 0)
        {
            var matchedPrintAreas = product.PrintAreas
                .Where(pa => request.ActivePrintAreaIds.Contains(pa.Id))
                .ToList();

            extraPrintAreaCost = matchedPrintAreas.Sum(pa => pa.ExtraCost);
        }

        // Volume Tier Matching
        decimal tierUnitPrice = basePrice;
        decimal discountPercentage = 0m;
        string? appliedTierSummary = null;

        var matchingTier = product.VolumeTiers
            .Where(vt => quantity >= vt.MinQuantity && (!vt.MaxQuantity.HasValue || quantity <= vt.MaxQuantity.Value))
            .OrderByDescending(vt => vt.MinQuantity)
            .FirstOrDefault();

        if (matchingTier != null)
        {
            if (matchingTier.UnitPrice > 0)
            {
                tierUnitPrice = matchingTier.UnitPrice;
                if (basePrice > 0)
                {
                    discountPercentage = Math.Round(((basePrice - matchingTier.UnitPrice) / basePrice) * 100m, 2);
                }
            }
            else if (matchingTier.DiscountPercentage > 0)
            {
                discountPercentage = matchingTier.DiscountPercentage;
                tierUnitPrice = Math.Round(basePrice * (1m - (discountPercentage / 100m)), 2);
            }

            appliedTierSummary = matchingTier.MaxQuantity.HasValue
                ? $"Tier {matchingTier.MinQuantity}-{matchingTier.MaxQuantity.Value} pcs ({discountPercentage}% Off)"
                : $"Tier {matchingTier.MinQuantity}+ pcs ({discountPercentage}% Off)";
        }

        decimal unitPrice = tierUnitPrice + materialAdjustment + sizeAdjustment + extraPrintAreaCost;
        decimal subtotal = Math.Round(unitPrice * quantity, 2);

        return new CalculatePriceResponse
        {
            BasePrice = basePrice,
            MaterialAdjustment = materialAdjustment,
            SizeAdjustment = sizeAdjustment,
            ExtraPrintAreaCost = extraPrintAreaCost,
            TierUnitPrice = tierUnitPrice,
            DiscountPercentage = discountPercentage,
            UnitPrice = unitPrice,
            Subtotal = subtotal,
            Quantity = quantity,
            AppliedTierSummary = appliedTierSummary
        };
    }

    public ValidateDpiResponse ValidateDpi(ValidateDpiRequest request)
    {
        if (request.TargetPhysicalWidthInches <= 0 || request.TargetPhysicalHeightInches <= 0 ||
            request.ImagePixelWidth <= 0 || request.ImagePixelHeight <= 0)
        {
            return new ValidateDpiResponse
            {
                CalculatedDpi = 0,
                QualityLevel = "Low",
                BadgeColor = "red",
                Message = "Invalid image or print dimensions."
            };
        }

        double dpiX = request.ImagePixelWidth / (double)request.TargetPhysicalWidthInches;
        double dpiY = request.ImagePixelHeight / (double)request.TargetPhysicalHeightInches;
        int calculatedDpi = (int)Math.Round(Math.Min(dpiX, dpiY));

        if (calculatedDpi >= 300)
        {
            return new ValidateDpiResponse
            {
                CalculatedDpi = calculatedDpi,
                QualityLevel = "Excellent",
                BadgeColor = "green",
                Message = $"Crisp vector/print resolution ({calculatedDpi} DPI). Print will be razor-sharp."
            };
        }
        else if (calculatedDpi >= 150)
        {
            return new ValidateDpiResponse
            {
                CalculatedDpi = calculatedDpi,
                QualityLevel = "Good",
                BadgeColor = "yellow",
                Message = $"Acceptable print resolution ({calculatedDpi} DPI). Minor blur may occur at close inspection."
            };
        }
        else
        {
            return new ValidateDpiResponse
            {
                CalculatedDpi = calculatedDpi,
                QualityLevel = "Low",
                BadgeColor = "red",
                Message = $"Low resolution artwork ({calculatedDpi} DPI). Recommendation: upload higher resolution file (300+ DPI recommended)."
            };
        }
    }
}
