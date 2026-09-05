namespace ManaVibePrints.Domain.Entities;

public class ProductColor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string ColorName { get; set; } = string.Empty;
    public string HexCode { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    // Navigation
    public Product? Product { get; set; }
    public ICollection<ProductMockup> Mockups { get; set; } = new List<ProductMockup>();
}
