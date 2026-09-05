namespace ManaVibePrints.Domain.Entities;

public class StoreSettings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string StoreName { get; set; } = "Mana Vibe Prints";
    public string Phone { get; set; } = "+91 9876543210";
    public string WhatsApp { get; set; } = "+91 9876543210";
    public string Email { get; set; } = "support@manavibeprints.com";
    public string Address { get; set; } = "Plot 42, Hitech City Main Road, Hyderabad, Telangana, India - 500081";
    public decimal GpsLatitude { get; set; } = 17.4486m; // Default store coordinates (Hyderabad)
    public decimal GpsLongitude { get; set; } = 78.3742m;
    public decimal FreeDeliveryRadiusKm { get; set; } = 15.0m;
    public decimal MaxServiceRadiusKm { get; set; } = 60.0m;
    public decimal BaseDeliveryCharge { get; set; } = 99.0m;
    public decimal MinOrderValue { get; set; } = 299.0m;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
