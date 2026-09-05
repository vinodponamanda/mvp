# 🎨 Mana Vibe Prints (MVP Prints) — Custom On-Demand Printing Platform

Mana Vibe Prints is an enterprise-grade on-demand custom printing e-commerce platform where 100% of product customization options, printable bounding boxes, pricing matrices, mockup templates, bulk order tiers, and store settings are dynamically managed via the Admin Portal.

---

## 🏗️ Architecture Overview

```
c:\Users\Satya\Self Projects\ManaVibePrints\
├── CUSTOM_PRINTING_PLATFORM_ARCHITECTURE.md
├── README.md
├── backend/
│   ├── ManaVibePrints.slnx
│   ├── src/
│   │   ├── ManaVibePrints.Domain/           # Entities (Products, Colors, Mockups, PrintAreas, VolumeTiers, Orders, Customizations)
│   │   ├── ManaVibePrints.Application/      # DTOs, Interfaces, PricingCalculator, DeliveryService
│   │   ├── ManaVibePrints.Infrastructure/   # PostgreSQL EF Core, DbInitializer, CloudinaryService, JwtTokenService, OtpService
│   │   └── ManaVibePrints.API/              # Controllers, JWT Auth, Scalar API Reference, Global Pipeline
│   └── tests/
│       └── ManaVibePrints.Tests/            # xUnit Test Suite (Pricing, Haversine Delivery, DPI Validation)
└── frontend/
    └── admin-portal/                       # Shop Owner Studio (Vite React + Bounding Box Drawer + Order Print Downloader)
```

---

## 🚀 Quick Start Guide

### 1. Database Configuration
PostgreSQL connection in `backend/src/ManaVibePrints.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=MVP;Username=postgres;Password=3182"
}
```

### 2. Start Backend API (.NET 10 + PostgreSQL + Scalar)
```powershell
dotnet run --project backend/src/ManaVibePrints.API
```
- **Scalar Interactive API Reference**: `http://localhost:5000/scalar/v1` (with automatic root `/` redirect)
- **OpenAPI Document**: `http://localhost:5000/openapi/v1.json`

### 3. Start Admin Portal (Vite React)
```powershell
cd frontend/admin-portal
npm run dev
```
- **Admin Portal URL**: `http://localhost:3003`
- **Default SuperAdmin Credentials**:
  - **Email**: `admin@manavibeprints.com`
  - **Password**: `Admin@12345` (or click "Quick Fill Demo Admin Credentials" on login page)

---

## 🧪 Automated Tests & Build Verification

```powershell
# Backend Solution Build & Unit Tests
dotnet build backend/ManaVibePrints.slnx
dotnet test backend/ManaVibePrints.slnx

# Admin Portal Production Build
cd frontend/admin-portal
npm run build
```

---

## 🎛️ Key Admin Portal Features

1. **Interactive Visual Bounding Box Studio (`BoundingBoxDrawer.jsx`)**:
   - Drag & resize printable bounding box rectangles directly on product mockups (with 8-direction resize handles).
   - Live synchronization of $X\%, Y\%, W\%, H\%$ coordinates, physical dimensions in inches, supported print methods (DTF, Screen, Sublimation), and extra side surcharges.
2. **Order Production Hub & 1-Click Artwork Download**:
   - High-res uncompressed 300 DPI original customer artwork downloader for heat-press and DTF operators.
   - Stage progression pipeline: `Placed` &rarr; `Proof Approved` &rarr; `In Production` &rarr; `Dispatched` &rarr; `Delivered`.
   - 1-Click WhatsApp customer update and cancellation modal with structured reasons.
3. **Multi-Tab Blank Product Builder**:
   - Materials & GSM variants (180 GSM, 240 GSM French Terry).
   - Multi-color hex codes & per-position mockup photos (Front, Back, Sleeve, Mug Wrap).
   - Garment sizing matrix with plus-size surcharges.
   - Volume pricing discount tiers (Min Qty, Max Qty, Unit Price, Discount %).
4. **Store Settings & Delivery Radius**:
   - GPS coordinate detector, Haversine delivery rules (free shipping radius & max service boundary).
