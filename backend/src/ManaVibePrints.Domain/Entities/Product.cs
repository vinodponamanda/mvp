namespace ManaVibePrints.Domain.Entities;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BaseSku { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsCustomizable { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Navigations
    public Category? Category { get; set; }
    public ICollection<ProductMaterial> Materials { get; set; } = new List<ProductMaterial>();
    public ICollection<ProductColor> Colors { get; set; } = new List<ProductColor>();
    public ICollection<ProductSize> Sizes { get; set; } = new List<ProductSize>();
    public ICollection<PrintArea> PrintAreas { get; set; } = new List<PrintArea>();
    public ICollection<VolumePricingTier> VolumeTiers { get; set; } = new List<VolumePricingTier>();
}
