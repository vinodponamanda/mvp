namespace ManaVibePrints.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? ProductColorId { get; set; }
    public Guid? ProductSizeId { get; set; }
    public Guid? ProductMaterialId { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }

    // Navigations
    public Order? Order { get; set; }
    public Product? Product { get; set; }
    public ProductColor? ProductColor { get; set; }
    public ProductSize? ProductSize { get; set; }
    public ProductMaterial? ProductMaterial { get; set; }
    public ICollection<OrderItemCustomization> Customizations { get; set; } = new List<OrderItemCustomization>();
}
