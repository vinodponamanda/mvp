namespace ManaVibePrints.Application.DTOs;

public class ProductSummaryDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BaseSku { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsCustomizable { get; set; }
    public bool IsActive { get; set; }
    public string? FeaturedImageUrl { get; set; }
    public List<string> ColorHexCodes { get; set; } = new();
    public int ColorCount { get; set; }
    public int SizeCount { get; set; }
    public int PrintAreaCount { get; set; }
}

public class ProductDetailDto
{
    public Guid Id { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BaseSku { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsCustomizable { get; set; }
    public bool IsActive { get; set; }
    public List<ProductMaterialDto> Materials { get; set; } = new();
    public List<ProductColorDto> Colors { get; set; } = new();
    public List<ProductSizeDto> Sizes { get; set; } = new();
    public List<PrintAreaDto> PrintAreas { get; set; } = new();
    public List<VolumePricingTierDto> VolumeTiers { get; set; } = new();
}

public class ProductMaterialDto
{
    public Guid Id { get; set; }
    public string MaterialName { get; set; } = string.Empty;
    public int? GsmValue { get; set; }
    public decimal PriceAdjustment { get; set; }
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }
}

public class ProductColorDto
{
    public Guid Id { get; set; }
    public string ColorName { get; set; } = string.Empty;
    public string HexCode { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<ProductMockupDto> Mockups { get; set; } = new();
}

public class ProductMockupDto
{
    public Guid Id { get; set; }
    public string Position { get; set; } = "Front";
    public string MockupUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class ProductSizeDto
{
    public Guid Id { get; set; }
    public string SizeLabel { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
    public int DisplayOrder { get; set; }
}

public class PrintAreaDto
{
    public Guid Id { get; set; }
    public string PositionName { get; set; } = "Front";
    public decimal BoxXPercent { get; set; }
    public decimal BoxYPercent { get; set; }
    public decimal BoxWidthPercent { get; set; }
    public decimal BoxHeightPercent { get; set; }
    public decimal PhysicalWidthInches { get; set; }
    public decimal PhysicalHeightInches { get; set; }
    public decimal ExtraCost { get; set; }
    public List<string> SupportedPrintMethods { get; set; } = new();
}

public class VolumePricingTierDto
{
    public Guid Id { get; set; }
    public int MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
}

// Request Models for Admin Product Creation & Update
public class CreateProductRequest
{
    public Guid CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string Description { get; set; } = string.Empty;
    public string BaseSku { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public bool IsCustomizable { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public List<CreateProductMaterialRequest> Materials { get; set; } = new();
    public List<CreateProductColorRequest> Colors { get; set; } = new();
    public List<CreateProductSizeRequest> Sizes { get; set; } = new();
    public List<CreatePrintAreaRequest> PrintAreas { get; set; } = new();
    public List<CreateVolumePricingTierRequest> VolumeTiers { get; set; } = new();
}

public class CreateProductMaterialRequest
{
    public string MaterialName { get; set; } = string.Empty;
    public int? GsmValue { get; set; }
    public decimal PriceAdjustment { get; set; }
    public bool IsDefault { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreateProductColorRequest
{
    public string ColorName { get; set; } = string.Empty;
    public string HexCode { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public List<CreateProductMockupRequest> Mockups { get; set; } = new();
}

public class CreateProductMockupRequest
{
    public string Position { get; set; } = "Front";
    public string MockupUrl { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
}

public class CreateProductSizeRequest
{
    public string SizeLabel { get; set; } = string.Empty;
    public decimal PriceAdjustment { get; set; }
    public int DisplayOrder { get; set; }
}

public class CreatePrintAreaRequest
{
    public string PositionName { get; set; } = "Front";
    public decimal BoxXPercent { get; set; }
    public decimal BoxYPercent { get; set; }
    public decimal BoxWidthPercent { get; set; }
    public decimal BoxHeightPercent { get; set; }
    public decimal PhysicalWidthInches { get; set; }
    public decimal PhysicalHeightInches { get; set; }
    public decimal ExtraCost { get; set; }
    public List<string> SupportedPrintMethods { get; set; } = new();
}

public class CreateVolumePricingTierRequest
{
    public int MinQuantity { get; set; }
    public int? MaxQuantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
}
