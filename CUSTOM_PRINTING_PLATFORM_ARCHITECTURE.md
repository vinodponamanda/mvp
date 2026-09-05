# 🎨 Custom Printing E-Commerce Platform Architecture
## *(T-Shirts, Mugs, Shirts, DTF Prints, Hoodies & Corporate Merchandise)*

---

## 📌 1. Project Overview & Business Requirements

A full-stack, enterprise-grade e-commerce and on-demand custom printing platform where **100% of product customization options, print placements, pricing matrices, mockup templates, bulk order tiers, and store settings are dynamically managed via the Admin Portal**.

### Key Differentiators vs Standard E-Commerce:
1. **Multi-Attribute Blank Products**: Products vary by Color, Size (S, M, L, XL, XXL, 3XL), and Material/GSM (e.g. 180 GSM Bio-Washed Cotton, Poly-blend, Ceramic, etc.).
2. **Dynamic Print Placement & Print Methods**: Front Chest, Full Back, Pocket, Left/Right Sleeves, 360° Mug Wrap with print methods (**DTF - Direct to Film, Screen Printing, Sublimation, Embroidery**). Each print area specifies which methods it supports.
3. **Interactive Customer Canvas Visualizer**: Customers upload artwork or enter custom text and see a live, interactive 2D preview on the chosen blank product color with real-time DPI checking.
4. **High-Resolution Production File Export**: The Admin/Operator can download print-ready raster/vector files at 300 DPI directly from the Admin Portal.
5. **Tiered Bulk / Volume Pricing**: Automatic dynamic discounts for single piece vs bulk orders (e.g. 1–5 pcs: ₹499, 6–20 pcs: ₹399, 50+ pcs: ₹249).
6. **100% Admin Portal Controlled**: Adding new blanks, setting print areas, adjusting bulk pricing rules, and managing order files happens in the Admin Portal without writing code.

---

## 🏗️ 2. High-Level Architecture

```
[ Customer Storefront (Vite React + Fabric.js Canvas Designer) ]
                             │
                             ▼
[ .NET 10 Web API Gateway (Clean Architecture + Controllers + JWT) ]
       │                      │                               │
       ▼                      ▼                               ▼
[ PostgreSQL DB ]     [ Cloudinary CDN ]           [ WhatsApp Business API ]
(JSONB Canvas Tree)   (High-Res Artworks & Mockups) (Meta Cloud API — Status & Proofs)
```

---

## 💾 3. Database Schema Blueprint (PostgreSQL)

### Table: `Categories`
- `Id` (UUID, PK)
- `Name` (VARCHAR — e.g. "T-Shirts", "Shirts", "Ceramic Mugs", "Caps", "Keychains", "DTF Printing")
- `Slug` (VARCHAR — URL-friendly identifier)
- `IconUrl` (VARCHAR — optional category icon)
- `DisplayOrder` (INT)
- `IsActive` (BOOLEAN)

---

### Table: `Products`
- `Id` (UUID, PK)
- `CategoryId` (UUID, FK → `Categories`)
- `Name` (VARCHAR)
- `Slug` (VARCHAR)
- `Description` (TEXT)
- `BaseSku` (VARCHAR)
- `BasePrice` (DECIMAL)
- `IsCustomizable` (BOOLEAN)
- `IsActive` (BOOLEAN)
- `CreatedAt` (TIMESTAMPTZ)

---

### Table: `ProductMaterials`
- `Id` (UUID, PK)
- `ProductId` (UUID, FK → `Products`)
- `MaterialName` (VARCHAR — e.g. "180 GSM Bio-Washed Cotton", "Poly-blend 65/35", "Ceramic Gloss")
- `GsmValue` (INT — e.g. 180; NULL for non-fabric products like mugs)
- `PriceAdjustment` (DECIMAL — e.g. +₹50 for premium GSM)
- `IsDefault` (BOOLEAN)
- `DisplayOrder` (INT)

---

### Table: `ProductColors`
- `Id` (UUID, PK)
- `ProductId` (UUID, FK → `Products`)
- `ColorName` (VARCHAR — e.g. "Jet Black", "Classic White", "Navy Blue")
- `HexCode` (VARCHAR — e.g. "#000000")
- `DisplayOrder` (INT)

> **Note**: Mockup images are stored in `ProductMockups` (see below), not inline here.
> This allows unlimited positions per color without schema changes.

---

### Table: `ProductMockups`
- `Id` (UUID, PK)
- `ProductColorId` (UUID, FK → `ProductColors`)
- `Position` (VARCHAR — "Front", "Back", "Left Sleeve", "Right Sleeve", "Mug Wrap", "Hood")
- `MockupUrl` (VARCHAR — Cloudinary URL of the blank product mockup image)
- `DisplayOrder` (INT)

> Replaces hardcoded `MockupFrontUrl / MockupBackUrl / MockupSleeveUrl` columns.
> Adding a new position (e.g. "Hood") requires only a new row — no schema migration.

---

### Table: `ProductSizes`
- `Id` (UUID, PK)
- `ProductId` (UUID, FK → `Products`)
- `SizeLabel` (VARCHAR — e.g. "S", "M", "L", "XL", "2XL", "3XL")
- `PriceAdjustment` (DECIMAL — e.g. +₹50 for 2XL/3XL)
- `DisplayOrder` (INT)

---

### Table: `PrintAreas`
- `Id` (UUID, PK)
- `ProductId` (UUID, FK → `Products`)
- `PositionName` (VARCHAR — "Front", "Back", "Left Sleeve", "Mug-Wrap")
- `BoxXPercent` (DECIMAL — Bounding box left offset %)
- `BoxYPercent` (DECIMAL — Bounding box top offset %)
- `BoxWidthPercent` (DECIMAL — Printable area width %)
- `BoxHeightPercent` (DECIMAL — Printable area height %)
- `PhysicalWidthInches` (DECIMAL — e.g. 10.0 inches)
- `PhysicalHeightInches` (DECIMAL — e.g. 12.0 inches)
- `SupportedPrintMethods` (JSONB — e.g. `["DTF", "Screen Printing", "Sublimation"]`)
- `ExtraCost` (DECIMAL — e.g. ₹0 for front, +₹100 for additional back print)

---

### Table: `VolumePricingTiers`
- `Id` (UUID, PK)
- `ProductId` (UUID, FK → `Products`)
- `MinQuantity` (INT — e.g. 10)
- `MaxQuantity` (INT — e.g. 49; NULL = unlimited)
- `UnitPrice` (DECIMAL — e.g. 349.00)
- `DiscountPercentage` (DECIMAL — e.g. 20.00)

---

### Table: `Orders`
- `Id` (UUID, PK)
- `OrderNumber` (VARCHAR — e.g. "#PRNT-84920")
- `CustomerName` (VARCHAR)
- `CustomerPhone` (VARCHAR)
- `CustomerEmail` (VARCHAR)
- `DeliveryAddress` (TEXT)
- `GpsLatitude` (DECIMAL — Customer delivery GPS, used for radius validation)
- `GpsLongitude` (DECIMAL)
- `TotalAmount` (DECIMAL)
- `DeliveryFee` (DECIMAL — 0 if within free delivery radius)
- `PaymentMethod` (VARCHAR — "COD" | "UPI_Manual" | "Online")
- `PaymentStatus` (VARCHAR — "Pending" | "Paid" | "Refunded")
- `Status` (VARCHAR — "Pending" | "Artwork_Approved" | "In_Production" | "Dispatched" | "Delivered" | "Cancelled")
- `CancellationReason` (TEXT — populated when Status = "Cancelled")
- `Notes` (TEXT — admin/operator internal notes)
- `CreatedAt` (TIMESTAMPTZ)
- `UpdatedAt` (TIMESTAMPTZ)

---

### Table: `OrderItems`
- `Id` (UUID, PK)
- `OrderId` (UUID, FK → `Orders`)
- `ProductId` (UUID, FK → `Products`)
- `ProductColorId` (UUID, FK → `ProductColors`)
- `ProductSizeId` (UUID, FK → `ProductSizes`)
- `ProductMaterialId` (UUID, FK → `ProductMaterials`; NULL for products without material variants)
- `Quantity` (INT)
- `UnitPrice` (DECIMAL — Price at time of order, includes size/material adjustments)
- `TotalPrice` (DECIMAL — UnitPrice × Quantity)

---

### Table: `OrderItemCustomizations`
- `Id` (UUID, PK)
- `OrderItemId` (UUID, FK → `OrderItems`)
- `PrintAreaId` (UUID, FK → `PrintAreas`)
- `Position` (VARCHAR — "Front", "Back", etc. — denormalized for quick reads)
- `SelectedPrintMethod` (VARCHAR — "DTF" | "Screen Printing" | "Sublimation" | "Embroidery")
- `OriginalArtworkUrl` (VARCHAR — High-Res original file on Cloudinary, uncompressed)
- `CompositeMockupUrl` (VARCHAR — Customer preview snapshot with design overlaid on blank)
- `CanvasJson` (JSONB — Fabric.js objects tree: positions, scale, rotation, custom text, font family, color)
- `EstimatedDpi` (INT — Quality indicator calculated at upload)

---

### Table: `StoreSettings`
- `Id` (UUID, PK)
- `StoreName` (VARCHAR)
- `Phone` (VARCHAR)
- `WhatsApp` (VARCHAR)
- `Email` (VARCHAR)
- `Address` (TEXT)
- `GpsLatitude` (DECIMAL — Store GPS coordinates for delivery radius calculation)
- `GpsLongitude` (DECIMAL)
- `FreeDeliveryRadiusKm` (DECIMAL — Orders within this radius get free delivery)
- `MaxServiceRadiusKm` (DECIMAL — Orders outside this radius are rejected)
- `BaseDeliveryCharge` (DECIMAL — Applied when outside free delivery radius)
- `MinOrderValue` (DECIMAL)

---

### Table: `AdminUsers`
- `Id` (UUID, PK)
- `Email` (VARCHAR, UNIQUE)
- `PasswordHash` (VARCHAR — BCrypt hashed)
- `Role` (VARCHAR — "SuperAdmin" | "Operator")
- `IsActive` (BOOLEAN)
- `CreatedAt` (TIMESTAMPTZ)

---

## 🔐 4. Authentication Strategy

### Admin Portal
- **JWT Bearer Token** issued by `/api/auth/admin/login`
- Email + Password login against `AdminUsers` table (BCrypt hashed)
- Roles: `SuperAdmin` (full access), `Operator` (order management only)
- Token expiry: 8 hours; refresh token stored in HttpOnly cookie

### Customer Storefront
- **Phone OTP Authentication** (OTP delivered via Fast2SMS / Twilio)
- Flow: Enter phone → Receive 6-digit OTP → Verify → Order placed
- Browsing and canvas customization require no login
- OTP verification only required at checkout
- Order history accessible via phone number lookup

---

## 🏧 5. Payment Strategy (Phased)

| Method | Phase | Notes |
|--------|-------|-------|
| **COD (Cash on Delivery)** | ✅ Phase 1 | Primary method; confirmed via WhatsApp |
| **Manual UPI** | ✅ Phase 1 | Admin shares UPI QR; manual confirmation |
| **Razorpay Online Payments** | 🔄 Phase 2 | Full gateway integration post-MVP |

---

## 📍 6. Delivery Radius Enforcement

Delivery eligibility is validated **at checkout** using the Haversine formula:

```
distance_km = haversine(StoreSettings.GpsLat, StoreSettings.GpsLng, Customer.GpsLat, Customer.GpsLng)

if distance_km > MaxServiceRadiusKm    → Reject order ("Outside our delivery area")
if distance_km <= FreeDeliveryRadiusKm → DeliveryFee = 0
else                                   → DeliveryFee = StoreSettings.BaseDeliveryCharge
```

- Customer GPS obtained via browser `navigator.geolocation` at checkout
- Manual address fallback if GPS is denied
- No Google Maps API dependency for Phase 1

---

## 📄 7. PDF Proof — Scope Decision

| Feature | Status |
|---------|--------|
| **Composite Mockup PNG** (Fabric.js canvas snapshot via `canvas.toDataURL()`) | ✅ Phase 1 — stored as `CompositeMockupUrl` |
| **Downloadable PDF Proof** (formatted proof sheet for customer) | 🔄 Phase 2 — using `jspdf` + `html2canvas` |

---

## 🎛️ 8. Admin Portal Blueprint (100% Shop-Owner Controlled)

1. **Login**: Email + Password → JWT issued.
2. **Category Manager**: Create / Edit / Reorder product categories.
3. **Visual Mockup & Print Zone Studio**:
   - Upload blank mockup images per color **per position** (stored in `ProductMockups`).
   - Draw printable bounding box via interactive drag-to-resize rectangle ($X\%, Y\%, W\%, H\%$).
   - Select which print methods are supported per print area.
4. **Material & GSM Manager**: Add material variants with optional price adjustments.
5. **Pricing & Volume Discount Matrix**:
   - Set single piece price + bulk quantity discount tiers.
   - Set additional side charges (e.g. Front only: ₹0, Front+Back: +₹120).
6. **Production File Inspector**:
   - **1-Click Download High-Res Original Artwork** (uncompressed Cloudinary file).
   - Displays placement coordinates, physical dimensions, and selected print method for the operator.
7. **Order Status Pipeline**:
   - One-click workflow: `Pending` → `Artwork_Approved` → `In_Production` → `Dispatched` → `Delivered`.
   - WhatsApp notification trigger to customer on each milestone (Meta Cloud API).
8. **Dynamic Store Settings**: Shop address, GPS coords, WhatsApp, delivery radiuses, pricing rules.

---

## 📱 9. Customer Visualizer & Ordering Journey

1. **Product & Color Selection**: Select category → product → material/GSM → blank color → size.
2. **Visual Customizer (Fabric.js)**:
   - Upload PNG / JPEG / SVG / PDF.
   - Add custom text with font selection, curved text, color picker.
   - Drag, scale, center, and rotate inside the Admin-defined printable bounding box.
   - Select print method from Admin-allowed methods for that position.
   - Live DPI quality badge:
     - 🟢 **300+ DPI**: Excellent print quality
     - 🟡 **150–299 DPI**: Good quality
     - 🔴 **< 150 DPI**: Low quality warning
3. **Bulk Quantity Calculator**: Live total update applying volume discount tiers.
4. **Checkout**:
   - Enter delivery address + GPS location for radius validation.
   - Phone OTP verification.
   - COD / Manual UPI payment selection.
   - Automated WhatsApp order confirmation with order summary.
5. **My Orders Hub**: Order history by phone, status tracking, composite mockup proof download.

---

## 🛠️ 10. Technology Stack Summary

| Component | Framework / Library |
| :--- | :--- |
| **Storefront Customizer** | React 18 + Vite + Fabric.js (Canvas Engine) + Tailwind CSS + Lucide Icons |
| **Admin Portal** | React 18 + Vite + Tailwind CSS + React Query + Lucide Icons |
| **Backend API** | .NET 10 Web API (C#) Clean Architecture |
| **Database** | PostgreSQL with JSONB |
| **File / Artwork Storage** | Cloudinary (Secure 300 DPI permanent storage) |
| **Notifications** | WhatsApp Business API (Meta Cloud API) |
| **SMS / OTP** | Fast2SMS (primary) / Twilio (fallback) |
| **Delivery Radius** | Haversine formula (no external Maps API for Phase 1) |
| **PDF Proofs** | `jspdf` + `html2canvas` (Phase 2) |
| **Solution File** | `.slnx` (requires .NET 10 SDK / VS 2022 v17.10+) |

---

## 🚀 11. Step-by-Step Implementation Roadmap

- [ ] **Phase 1 — Backend Foundation**: Setup .NET 10 Web API, PostgreSQL DbContext with all finalized entities, Cloudinary integration, JWT auth for Admin, Phone OTP for customers, and clean DTOs.
- [ ] **Phase 2 — Admin Portal**: Login UI, Category Manager, Product CRUD, Visual Mockup uploader + Bounding Box Drawer, Material/GSM manager, Volume pricing, Order pipeline + 1-click artwork download.
- [ ] **Phase 3 — Customer Storefront**: Homepage + Category Showcase, Fabric.js interactive customizer (upload, text tools, DPI badge, print method selector), Bulk quantity calculator, Phone-OTP checkout, My Orders Hub.
- [ ] **Phase 4 — Notifications & Polish**: WhatsApp Business API (Meta Cloud) milestone triggers, delivery radius enforcement at checkout, COD/UPI confirmation flow.
- [ ] **Phase 5 — Phase 2 Features**: Razorpay online payments, PDF proof generation (`jspdf`), advanced multi-asset designer tools.
