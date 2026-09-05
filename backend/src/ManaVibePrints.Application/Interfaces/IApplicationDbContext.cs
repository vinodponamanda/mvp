using ManaVibePrints.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductMaterial> ProductMaterials { get; }
    DbSet<ProductColor> ProductColors { get; }
    DbSet<ProductMockup> ProductMockups { get; }
    DbSet<ProductSize> ProductSizes { get; }
    DbSet<PrintArea> PrintAreas { get; }
    DbSet<VolumePricingTier> VolumePricingTiers { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderItemCustomization> OrderItemCustomizations { get; }
    DbSet<StoreSettings> StoreSettings { get; }
    DbSet<AdminUser> AdminUsers { get; }
    DbSet<CustomerUser> CustomerUsers { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
