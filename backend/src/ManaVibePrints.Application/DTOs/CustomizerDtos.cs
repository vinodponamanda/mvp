namespace ManaVibePrints.Application.DTOs;

public class CalculatePriceRequest
{
    public Guid ProductId { get; set; }
    public Guid? MaterialId { get; set; }
    public Guid? SizeId { get; set; }
    public int Quantity { get; set; } = 1;
    public List<Guid> ActivePrintAreaIds { get; set; } = new();
}

public class CalculatePriceResponse
{
    public decimal BasePrice { get; set; }
    public decimal MaterialAdjustment { get; set; }
    public decimal SizeAdjustment { get; set; }
    public decimal ExtraPrintAreaCost { get; set; }
    public decimal TierUnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public int Quantity { get; set; }
    public string? AppliedTierSummary { get; set; }
}

public class ValidateDpiRequest
{
    public int ImagePixelWidth { get; set; }
    public int ImagePixelHeight { get; set; }
    public decimal TargetPhysicalWidthInches { get; set; }
    public decimal TargetPhysicalHeightInches { get; set; }
}

public class ValidateDpiResponse
{
    public int CalculatedDpi { get; set; }
    public string QualityLevel { get; set; } = "Excellent"; // "Excellent" (>=300), "Good" (150-299), "Low" (<150)
    public string BadgeColor { get; set; } = "green"; // "green", "yellow", "red"
    public string Message { get; set; } = string.Empty;
}
