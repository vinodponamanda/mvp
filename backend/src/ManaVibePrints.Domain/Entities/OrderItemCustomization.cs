namespace ManaVibePrints.Domain.Entities;

public class OrderItemCustomization
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderItemId { get; set; }
    public Guid? PrintAreaId { get; set; }
    public string Position { get; set; } = "Front"; // e.g. "Front", "Back", "Left Sleeve"
    public string SelectedPrintMethod { get; set; } = "DTF"; // "DTF", "Screen Printing", "Sublimation", "Embroidery"
    public string OriginalArtworkUrl { get; set; } = string.Empty; // Uncompressed high-res customer upload
    public string CompositeMockupUrl { get; set; } = string.Empty; // Preview screenshot with mockup
    public string CanvasJson { get; set; } = "{}"; // Fabric.js objects tree
    public int EstimatedDpi { get; set; } = 300;

    // Navigation
    public OrderItem? OrderItem { get; set; }
    public PrintArea? PrintArea { get; set; }
}
