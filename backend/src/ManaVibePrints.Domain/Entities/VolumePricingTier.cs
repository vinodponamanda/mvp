namespace ManaVibePrints.Domain.Entities;

public class VolumePricingTier
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public int MinQuantity { get; set; } // e.g. 1, 6, 21, 51, 100
    public int? MaxQuantity { get; set; } // e.g. 5, 20, 50, null (unlimited)
    public decimal UnitPrice { get; set; } // Discounted base price per piece for this tier
    public decimal DiscountPercentage { get; set; } // Percentage discount e.g. 15.00

    // Navigation
    public Product? Product { get; set; }
}
