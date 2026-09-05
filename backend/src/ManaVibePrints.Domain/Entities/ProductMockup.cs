namespace ManaVibePrints.Domain.Entities;

public class ProductMockup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductColorId { get; set; }
    public string Position { get; set; } = "Front"; // e.g. "Front", "Back", "Left Sleeve", "Right Sleeve", "Mug Wrap", "Hood"
    public string MockupUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }

    // Navigation
    public ProductColor? ProductColor { get; set; }
}
