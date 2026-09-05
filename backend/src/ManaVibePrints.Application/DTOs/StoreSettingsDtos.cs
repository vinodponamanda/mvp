namespace ManaVibePrints.Application.DTOs;

public class StoreSettingsDto
{
    public Guid Id { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal GpsLatitude { get; set; }
    public decimal GpsLongitude { get; set; }
    public decimal FreeDeliveryRadiusKm { get; set; }
    public decimal MaxServiceRadiusKm { get; set; }
    public decimal BaseDeliveryCharge { get; set; }
    public decimal MinOrderValue { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class UpdateStoreSettingsRequest
{
    public string StoreName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal GpsLatitude { get; set; }
    public decimal GpsLongitude { get; set; }
    public decimal FreeDeliveryRadiusKm { get; set; }
    public decimal MaxServiceRadiusKm { get; set; }
    public decimal BaseDeliveryCharge { get; set; }
    public decimal MinOrderValue { get; set; }
}

public class CheckDeliveryRequest
{
    public decimal CustomerLatitude { get; set; }
    public decimal CustomerLongitude { get; set; }
    public decimal OrderSubtotal { get; set; }
}

public class CheckDeliveryResponse
{
    public bool IsDeliverable { get; set; }
    public double DistanceKm { get; set; }
    public decimal DeliveryFee { get; set; }
    public bool IsFreeDelivery { get; set; }
    public string Message { get; set; } = string.Empty;
}
