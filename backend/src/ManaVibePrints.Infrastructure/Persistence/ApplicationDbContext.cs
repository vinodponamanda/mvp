using System.Text.Json;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductMaterial> ProductMaterials => Set<ProductMaterial>();
    public DbSet<ProductColor> ProductColors => Set<ProductColor>();
    public DbSet<ProductMockup> ProductMockups => Set<ProductMockup>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();
    public DbSet<PrintArea> PrintAreas => Set<PrintArea>();
    public DbSet<VolumePricingTier> VolumePricingTiers => Set<VolumePricingTier>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderItemCustomization> OrderItemCustomizations => Set<OrderItemCustomization>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<CustomerUser> CustomerUsers => Set<CustomerUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Category
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        // Product
        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(250).IsRequired();
            entity.Property(e => e.Slug).HasMaxLength(250).IsRequired();
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.Property(e => e.BaseSku).HasMaxLength(100);
            entity.Property(e => e.BasePrice).HasPrecision(18, 2);

            entity.HasOne(e => e.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(e => e.Materials)
                .WithOne(m => m.Product)
                .HasForeignKey(m => m.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Colors)
                .WithOne(c => c.Product)
                .HasForeignKey(c => c.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.Sizes)
                .WithOne(s => s.Product)
                .HasForeignKey(s => s.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.PrintAreas)
                .WithOne(p => p.Product)
                .HasForeignKey(p => p.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.VolumeTiers)
                .WithOne(v => v.Product)
                .HasForeignKey(v => v.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Product Material
        modelBuilder.Entity<ProductMaterial>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MaterialName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.PriceAdjustment).HasPrecision(18, 2);
        });

        // Product Color & Mockups
        modelBuilder.Entity<ProductColor>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ColorName).HasMaxLength(100).IsRequired();
            entity.Property(e => e.HexCode).HasMaxLength(20).IsRequired();

            entity.HasMany(e => e.Mockups)
                .WithOne(m => m.ProductColor)
                .HasForeignKey(m => m.ProductColorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ProductMockup>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Position).HasMaxLength(50).IsRequired();
            entity.Property(e => e.MockupUrl).HasMaxLength(1000).IsRequired();
        });

        // Product Size
        modelBuilder.Entity<ProductSize>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SizeLabel).HasMaxLength(50).IsRequired();
            entity.Property(e => e.PriceAdjustment).HasPrecision(18, 2);
        });

        // Print Area
        modelBuilder.Entity<PrintArea>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PositionName).HasMaxLength(50).IsRequired();
            entity.Property(e => e.BoxXPercent).HasPrecision(8, 4);
            entity.Property(e => e.BoxYPercent).HasPrecision(8, 4);
            entity.Property(e => e.BoxWidthPercent).HasPrecision(8, 4);
            entity.Property(e => e.BoxHeightPercent).HasPrecision(8, 4);
            entity.Property(e => e.PhysicalWidthInches).HasPrecision(8, 2);
            entity.Property(e => e.PhysicalHeightInches).HasPrecision(8, 2);
            entity.Property(e => e.ExtraCost).HasPrecision(18, 2);

            // Supported print methods stored as JSON string conversion
            entity.Property(e => e.SupportedPrintMethods)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>()
                );
        });

        // Volume Pricing Tier
        modelBuilder.Entity<VolumePricingTier>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.DiscountPercentage).HasPrecision(8, 2);
        });

        // Order
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.OrderNumber).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.OrderNumber).IsUnique();
            entity.Property(e => e.CustomerName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.CustomerPhone).HasMaxLength(30).IsRequired();
            entity.Property(e => e.CustomerEmail).HasMaxLength(150);
            entity.Property(e => e.TotalAmount).HasPrecision(18, 2);
            entity.Property(e => e.DeliveryFee).HasPrecision(18, 2);
            entity.Property(e => e.GpsLatitude).HasPrecision(10, 6);
            entity.Property(e => e.GpsLongitude).HasPrecision(10, 6);
            entity.Property(e => e.PaymentMethod).HasConversion<string>();
            entity.Property(e => e.PaymentStatus).HasConversion<string>();
            entity.Property(e => e.Status).HasConversion<string>();

            entity.HasMany(e => e.Items)
                .WithOne(i => i.Order)
                .HasForeignKey(i => i.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Order Item
        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UnitPrice).HasPrecision(18, 2);
            entity.Property(e => e.TotalPrice).HasPrecision(18, 2);

            entity.HasOne(e => e.Product)
                .WithMany()
                .HasForeignKey(e => e.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ProductColor)
                .WithMany()
                .HasForeignKey(e => e.ProductColorId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ProductSize)
                .WithMany()
                .HasForeignKey(e => e.ProductSizeId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.ProductMaterial)
                .WithMany()
                .HasForeignKey(e => e.ProductMaterialId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasMany(e => e.Customizations)
                .WithOne(c => c.OrderItem)
                .HasForeignKey(c => c.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Order Item Customization
        modelBuilder.Entity<OrderItemCustomization>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Position).HasMaxLength(50).IsRequired();
            entity.Property(e => e.SelectedPrintMethod).HasMaxLength(50).IsRequired();
            entity.Property(e => e.OriginalArtworkUrl).HasColumnType("text");
            entity.Property(e => e.CompositeMockupUrl).HasColumnType("text");
            entity.Property(e => e.CanvasJson).HasColumnType("text");

            entity.HasOne(e => e.PrintArea)
                .WithMany()
                .HasForeignKey(e => e.PrintAreaId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // Store Settings
        modelBuilder.Entity<StoreSettings>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StoreName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(30).IsRequired();
            entity.Property(e => e.WhatsApp).HasMaxLength(30).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.Property(e => e.GpsLatitude).HasPrecision(10, 6);
            entity.Property(e => e.GpsLongitude).HasPrecision(10, 6);
            entity.Property(e => e.FreeDeliveryRadiusKm).HasPrecision(8, 2);
            entity.Property(e => e.MaxServiceRadiusKm).HasPrecision(8, 2);
            entity.Property(e => e.BaseDeliveryCharge).HasPrecision(18, 2);
            entity.Property(e => e.MinOrderValue).HasPrecision(18, 2);
        });

        // Admin User
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.Email).HasMaxLength(150).IsRequired();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.PasswordHash).HasMaxLength(500).IsRequired();
            entity.Property(e => e.Role).HasConversion<string>();
        });

        // Customer User
        modelBuilder.Entity<CustomerUser>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            entity.Property(e => e.MobileNumber).HasMaxLength(20).IsRequired();
            entity.HasIndex(e => e.MobileNumber).IsUnique();
            entity.Property(e => e.PinHash).HasMaxLength(200).IsRequired();
        });
    }
}
