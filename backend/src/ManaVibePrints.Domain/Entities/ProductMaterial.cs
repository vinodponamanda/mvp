namespace ManaVibePrints.Domain.Entities;

public class ProductMaterial
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public int? GsmValue { get; set; }
    public decimal PriceAdjustment { get; set; } = 0m;
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }

    // Navigation
    public Product? Product { get; set; }
}
