using ManaVibePrints.Domain.Entities;
using ManaVibePrints.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ManaVibePrints.Infrastructure.Persistence;

public static class DbInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context, ILogger logger)
    {
        try
        {
            // Ensure database and complete schema are created in a single step
            await context.Database.EnsureCreatedAsync();

            // 1. Seed Admin Users (SuperAdmin)
            if (!await context.AdminUsers.AnyAsync())
            {
                logger.LogInformation("Seeding default SuperAdmin user...");
                var admin = new AdminUser
                {
                    FullName = "MVP SuperAdmin",
                    Email = "admin@manavibeprints.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@12345"),
                    Role = AdminRole.SuperAdmin,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                context.AdminUsers.Add(admin);
            }

            // 2. Seed Store Settings (Required for calculation and contact)
            if (!await context.StoreSettings.AnyAsync())
            {
                logger.LogInformation("Seeding default Store Settings...");
                var settings = new StoreSettings
                {
                    StoreName = "Mana Vibe Prints",
                    Phone = "+91 9876543210",
                    WhatsApp = "+91 9876543210",
                    Email = "support@manavibeprints.com",
                    Address = "Plot 42, Hitech City Main Road, Hyderabad, Telangana, India - 500081",
                    GpsLatitude = 17.4486m,
                    GpsLongitude = 78.3742m,
                    FreeDeliveryRadiusKm = 15.0m,
                    MaxServiceRadiusKm = 60.0m,
                    BaseDeliveryCharge = 99.0m,
                    MinOrderValue = 299.0m,
                    UpdatedAt = DateTime.UtcNow
                };
                context.StoreSettings.Add(settings);
            }

            // Note: Categories, Products, and Order Data are NOT seeded.
            // Shop owners will add categories and products manually via the Admin Portal.
            await context.SaveChangesAsync();
            logger.LogInformation("Database initialization completed (Clean DB).");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while initializing the database.");
            throw;
        }
    }
}
