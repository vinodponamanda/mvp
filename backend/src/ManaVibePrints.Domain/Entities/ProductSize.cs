namespace ManaVibePrints.Domain.Entities;

public class ProductSize
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string SizeLabel { get; set; } = string.Empty; // S, M, L, XL, 2XL, 3XL, Free Size
    public decimal PriceAdjustment { get; set; } = 0m;
    public int DisplayOrder { get; set; }

    // Navigation
    public Product? Product { get; set; }
}
