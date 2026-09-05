namespace ManaVibePrints.Domain.Entities;

public class PrintArea
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public string PositionName { get; set; } = "Front"; // Front, Back, Left Sleeve, Right Sleeve, Mug-Wrap, Hood
    public decimal BoxXPercent { get; set; } // Left offset % (e.g. 28.5)
    public decimal BoxYPercent { get; set; } // Top offset % (e.g. 22.0)
    public decimal BoxWidthPercent { get; set; } // Width % (e.g. 43.0)
    public decimal BoxHeightPercent { get; set; } // Height % (e.g. 52.0)
    public decimal PhysicalWidthInches { get; set; } = 10.0m;
    public decimal PhysicalHeightInches { get; set; } = 12.0m;
    public decimal ExtraCost { get; set; } = 0m; // Extra cost for this print side
    public List<string> SupportedPrintMethods { get; set; } = new() { "DTF", "Screen Printing" };

    // Navigation
    public Product? Product { get; set; }
}
