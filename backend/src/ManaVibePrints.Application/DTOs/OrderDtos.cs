using ManaVibePrints.Domain.Enums;

namespace ManaVibePrints.Application.DTOs;

public class CreateOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal? GpsLatitude { get; set; }
    public decimal? GpsLongitude { get; set; }
    public decimal? CustomerLatitude { get; set; }
    public decimal? CustomerLongitude { get; set; }
    public string PaymentMethod { get; set; } = "UPI";
    public List<CreateOrderItemRequest> Items { get; set; } = new();
}

public class CreateOrderItemRequest
{
    public Guid ProductId { get; set; }
    public Guid? ProductColorId { get; set; }
    public string? ColorName { get; set; }
    public Guid? ProductSizeId { get; set; }
    public string? SizeLabel { get; set; }
    public Guid? ProductMaterialId { get; set; }
    public string? MaterialName { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public List<CreateOrderItemCustomizationRequest> Customizations { get; set; } = new();
}

public class CreateOrderItemCustomizationRequest
{
    public Guid? PrintAreaId { get; set; }
    public string Position { get; set; } = "Front";
    public string SelectedPrintMethod { get; set; } = "DTF";
    public string OriginalArtworkUrl { get; set; } = string.Empty;
    public string CompositeMockupUrl { get; set; } = string.Empty;
    public string CanvasJson { get; set; } = "{}";
    public string DesignJson { get; set; } = "{}";
    public int EstimatedDpi { get; set; } = 300;
}

public class OrderSummaryDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal DeliveryFee { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public OrderStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    public int ItemCount { get; set; }
    public string? FirstItemPreviewUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class OrderDetailDto
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public decimal? GpsLatitude { get; set; }
    public decimal? GpsLongitude { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DeliveryFee { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public OrderStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<OrderItemDetailDto> Items { get; set; } = new();
}

public class OrderItemDetailDto
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ColorName { get; set; }
    public string? HexCode { get; set; }
    public string? SizeLabel { get; set; }
    public string? MaterialName { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public List<OrderItemCustomizationDetailDto> Customizations { get; set; } = new();
}

public class OrderItemCustomizationDetailDto
{
    public Guid Id { get; set; }
    public Guid? PrintAreaId { get; set; }
    public string Position { get; set; } = "Front";
    public string SelectedPrintMethod { get; set; } = "DTF";
    public string OriginalArtworkUrl { get; set; } = string.Empty;
    public string CompositeMockupUrl { get; set; } = string.Empty;
    public string CanvasJson { get; set; } = "{}";
    public int EstimatedDpi { get; set; }
    public decimal? PhysicalWidthInches { get; set; }
    public decimal? PhysicalHeightInches { get; set; }
}

public class UpdateOrderStatusRequest
{
    public OrderStatus Status { get; set; }
    public string? CancellationReason { get; set; }
    public string? Notes { get; set; }
}
