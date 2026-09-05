-- ============================================================================
-- Mana Vibe Prints - Master Database Migration (Single Consolidated File)
-- Engine: PostgreSQL 14+
-- Description: Complete schema definition including all entities, constraints,
--              indexes, and initial seeds in a single idempotent script.
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES & RELATIONSHIPS

-- Categories Table
CREATE TABLE IF NOT EXISTS "Categories" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "Name" character varying(150) NOT NULL,
    "Slug" character varying(150) NOT NULL,
    "Description" text NULL,
    "ImageUrl" character varying(1000) NULL,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Categories_Slug" ON "Categories" ("Slug");

-- Products Table
CREATE TABLE IF NOT EXISTS "Products" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "CategoryId" uuid NOT NULL,
    "Name" character varying(250) NOT NULL,
    "Slug" character varying(250) NOT NULL,
    "Description" text NULL,
    "BaseSku" character varying(100) NULL,
    "BasePrice" numeric(18, 2) NOT NULL DEFAULT 0.00,
    "ProductType" integer NOT NULL DEFAULT 0,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp with time zone NULL,
    CONSTRAINT "FK_Products_Categories_CategoryId" FOREIGN KEY ("CategoryId") 
        REFERENCES "Categories" ("Id") ON DELETE RESTRICT
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Products_Slug" ON "Products" ("Slug");
CREATE INDEX IF NOT EXISTS "IX_Products_CategoryId" ON "Products" ("CategoryId");

-- Product Materials Table
CREATE TABLE IF NOT EXISTS "ProductMaterials" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" uuid NOT NULL,
    "MaterialName" character varying(150) NOT NULL,
    "PriceAdjustment" numeric(18, 2) NOT NULL DEFAULT 0.00,
    "IsDefault" boolean NOT NULL DEFAULT false,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_ProductMaterials_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ProductMaterials_ProductId" ON "ProductMaterials" ("ProductId");

-- Product Colors Table
CREATE TABLE IF NOT EXISTS "ProductColors" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" uuid NOT NULL,
    "ColorName" character varying(100) NOT NULL,
    "HexCode" character varying(20) NOT NULL,
    "IsDefault" boolean NOT NULL DEFAULT false,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_ProductColors_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ProductColors_ProductId" ON "ProductColors" ("ProductId");

-- Product Mockups Table (Per Color Angle / Side)
CREATE TABLE IF NOT EXISTS "ProductMockups" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductColorId" uuid NOT NULL,
    "Position" character varying(50) NOT NULL,
    "MockupUrl" character varying(1000) NOT NULL,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_ProductMockups_ProductColors_ProductColorId" FOREIGN KEY ("ProductColorId") 
        REFERENCES "ProductColors" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ProductMockups_ProductColorId" ON "ProductMockups" ("ProductColorId");

-- Product Sizes Table
CREATE TABLE IF NOT EXISTS "ProductSizes" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" uuid NOT NULL,
    "SizeLabel" character varying(50) NOT NULL,
    "PriceAdjustment" numeric(18, 2) NOT NULL DEFAULT 0.00,
    "StockQuantity" integer NOT NULL DEFAULT 100,
    "DisplayOrder" integer NOT NULL DEFAULT 0,
    CONSTRAINT "FK_ProductSizes_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_ProductSizes_ProductId" ON "ProductSizes" ("ProductId");

-- Print Areas (Configurable Bounding Box Zones) Table
CREATE TABLE IF NOT EXISTS "PrintAreas" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" uuid NOT NULL,
    "PositionName" character varying(50) NOT NULL,
    "BoxXPercent" numeric(8, 4) NOT NULL DEFAULT 0.0000,
    "BoxYPercent" numeric(8, 4) NOT NULL DEFAULT 0.0000,
    "BoxWidthPercent" numeric(8, 4) NOT NULL DEFAULT 0.0000,
    "BoxHeightPercent" numeric(8, 4) NOT NULL DEFAULT 0.0000,
    "PhysicalWidthInches" numeric(8, 2) NOT NULL DEFAULT 0.00,
    "PhysicalHeightInches" numeric(8, 2) NOT NULL DEFAULT 0.00,
    "ExtraCost" numeric(18, 2) NOT NULL DEFAULT 0.00,
    "SupportedPrintMethods" text NOT NULL DEFAULT '[]',
    CONSTRAINT "FK_PrintAreas_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_PrintAreas_ProductId" ON "PrintAreas" ("ProductId");

-- Volume Pricing Tiers Table
CREATE TABLE IF NOT EXISTS "VolumePricingTiers" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "ProductId" uuid NOT NULL,
    "MinQuantity" integer NOT NULL,
    "MaxQuantity" integer NULL,
    "UnitPrice" numeric(18, 2) NOT NULL,
    "DiscountPercentage" numeric(8, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT "FK_VolumePricingTiers_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "IX_VolumePricingTiers_ProductId" ON "VolumePricingTiers" ("ProductId");

-- Store Settings Table
CREATE TABLE IF NOT EXISTS "StoreSettings" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "StoreName" character varying(150) NOT NULL,
    "Phone" character varying(30) NOT NULL,
    "WhatsApp" character varying(30) NOT NULL,
    "Email" character varying(150) NOT NULL,
    "Address" text NOT NULL,
    "GpsLatitude" numeric(10, 6) NOT NULL DEFAULT 17.448600,
    "GpsLongitude" numeric(10, 6) NOT NULL DEFAULT 78.374200,
    "FreeDeliveryRadiusKm" numeric(8, 2) NOT NULL DEFAULT 15.00,
    "MaxServiceRadiusKm" numeric(8, 2) NOT NULL DEFAULT 60.00,
    "BaseDeliveryCharge" numeric(18, 2) NOT NULL DEFAULT 99.00,
    "MinOrderValue" numeric(18, 2) NOT NULL DEFAULT 299.00,
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS "AdminUsers" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "FullName" character varying(150) NOT NULL,
    "Email" character varying(150) NOT NULL,
    "PasswordHash" character varying(500) NOT NULL,
    "Role" character varying(50) NOT NULL DEFAULT 'SuperAdmin',
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLoginAt" timestamp with time zone NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_AdminUsers_Email" ON "AdminUsers" ("Email");

-- Customer Users (Mobile + PIN Authentication) Table
CREATE TABLE IF NOT EXISTS "CustomerUsers" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "FullName" character varying(150) NOT NULL,
    "MobileNumber" character varying(20) NOT NULL,
    "PinHash" character varying(200) NOT NULL,
    "MustChangePin" boolean NOT NULL DEFAULT false,
    "FailedLoginAttempts" integer NOT NULL DEFAULT 0,
    "LockoutEndUtc" timestamp with time zone NULL,
    "IsActive" boolean NOT NULL DEFAULT true,
    "CreatedAtUtc" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "LastLoginAtUtc" timestamp with time zone NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_CustomerUsers_MobileNumber" ON "CustomerUsers" ("MobileNumber");

-- Orders Table
CREATE TABLE IF NOT EXISTS "Orders" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "OrderNumber" character varying(50) NOT NULL,
    "CustomerName" character varying(150) NOT NULL,
    "CustomerPhone" character varying(30) NOT NULL,
    "CustomerEmail" character varying(150) NULL,
    "DeliveryAddress" text NOT NULL,
    "GpsLatitude" numeric(10, 6) NULL,
    "GpsLongitude" numeric(10, 6) NULL,
    "DistanceKm" numeric(8, 2) NULL,
    "TotalAmount" numeric(18, 2) NOT NULL,
    "DeliveryFee" numeric(18, 2) NOT NULL DEFAULT 0.00,
    "PaymentMethod" character varying(50) NOT NULL DEFAULT 'COD',
    "PaymentStatus" character varying(50) NOT NULL DEFAULT 'Pending',
    "Status" character varying(50) NOT NULL DEFAULT 'Pending',
    "OrderNotes" text NULL,
    "CancellationReason" text NULL,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp with time zone NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Orders_OrderNumber" ON "Orders" ("OrderNumber");

-- Order Items Table
CREATE TABLE IF NOT EXISTS "OrderItems" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "OrderId" uuid NOT NULL,
    "ProductId" uuid NOT NULL,
    "ProductColorId" uuid NULL,
    "ProductSizeId" uuid NULL,
    "ProductMaterialId" uuid NULL,
    "Quantity" integer NOT NULL,
    "UnitPrice" numeric(18, 2) NOT NULL,
    "TotalPrice" numeric(18, 2) NOT NULL,
    CONSTRAINT "FK_OrderItems_Orders_OrderId" FOREIGN KEY ("OrderId") 
        REFERENCES "Orders" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_OrderItems_Products_ProductId" FOREIGN KEY ("ProductId") 
        REFERENCES "Products" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_OrderItems_ProductColors_ProductColorId" FOREIGN KEY ("ProductColorId") 
        REFERENCES "ProductColors" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_OrderItems_ProductSizes_ProductSizeId" FOREIGN KEY ("ProductSizeId") 
        REFERENCES "ProductSizes" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_OrderItems_ProductMaterials_ProductMaterialId" FOREIGN KEY ("ProductMaterialId") 
        REFERENCES "ProductMaterials" ("Id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "IX_OrderItems_OrderId" ON "OrderItems" ("OrderId");
CREATE INDEX IF NOT EXISTS "IX_OrderItems_ProductId" ON "OrderItems" ("ProductId");

-- Order Item Customizations (Artwork, composite mockups, canvas json) Table
CREATE TABLE IF NOT EXISTS "OrderItemCustomizations" (
    "Id" uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    "OrderItemId" uuid NOT NULL,
    "PrintAreaId" uuid NULL,
    "Position" character varying(50) NOT NULL,
    "SelectedPrintMethod" character varying(50) NOT NULL,
    "OriginalArtworkUrl" text NULL,
    "CompositeMockupUrl" text NULL,
    "CanvasJson" text NULL,
    CONSTRAINT "FK_OrderItemCustomizations_OrderItems_OrderItemId" FOREIGN KEY ("OrderItemId") 
        REFERENCES "OrderItems" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_OrderItemCustomizations_PrintAreas_PrintAreaId" FOREIGN KEY ("PrintAreaId") 
        REFERENCES "PrintAreas" ("Id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "IX_OrderItemCustomizations_OrderItemId" ON "OrderItemCustomizations" ("OrderItemId");

-- ============================================================================
-- 3. DEFAULT SEED DATA (SuperAdmin & Store Settings)
-- ============================================================================

INSERT INTO "AdminUsers" ("Id", "FullName", "Email", "PasswordHash", "Role", "IsActive", "CreatedAt")
VALUES (
    uuid_generate_v4(),
    'MVP SuperAdmin',
    'admin@manavibeprints.com',
    '$2a$11$q9i8hW4LqT7Vf5Hl6X.bteYgOvxPzGjklWzQ5b/wN/fQ2h2UjO1zG',
    'SuperAdmin',
    true,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO "StoreSettings" (
    "Id", "StoreName", "Phone", "WhatsApp", "Email", "Address", 
    "GpsLatitude", "GpsLongitude", "FreeDeliveryRadiusKm", "MaxServiceRadiusKm", 
    "BaseDeliveryCharge", "MinOrderValue", "UpdatedAt"
)
VALUES (
    uuid_generate_v4(),
    'Mana Vibe Prints',
    '+91 9876543210',
    '+91 9876543210',
    'support@manavibeprints.com',
    'Plot 42, Hitech City Main Road, Hyderabad, Telangana, India - 500081',
    17.448600,
    78.374200,
    15.00,
    60.00,
    99.00,
    299.00,
    CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;
