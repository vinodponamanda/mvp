using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ProductsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductSummaryDto>>> GetProducts(
        [FromQuery] Guid? categoryId,
        [FromQuery] string? categorySlug,
        [FromQuery] string? search,
        [FromQuery] bool? customizableOnly)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Where(p => p.IsActive);

        if (categoryId.HasValue)
        {
            query = query.Where(p => p.CategoryId == categoryId.Value);
        }

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(p => p.Category != null && p.Category.Slug.ToLower() == categorySlug.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower().Trim();
            query = query.Where(p => p.Name.ToLower().Contains(term) || p.Description.ToLower().Contains(term) || p.BaseSku.ToLower().Contains(term));
        }

        if (customizableOnly.HasValue && customizableOnly.Value)
        {
            query = query.Where(p => p.IsCustomizable);
        }

        var products = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new ProductSummaryDto
            {
                Id = p.Id,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : string.Empty,
                Name = p.Name,
                Slug = p.Slug,
                Description = p.Description,
                BaseSku = p.BaseSku,
                BasePrice = p.BasePrice,
                IsCustomizable = p.IsCustomizable,
                IsActive = p.IsActive,
                FeaturedImageUrl = p.Colors
                    .OrderBy(c => c.DisplayOrder)
                    .SelectMany(c => c.Mockups.OrderBy(m => m.DisplayOrder))
                    .Select(m => m.MockupUrl)
                    .FirstOrDefault(),
                ColorHexCodes = p.Colors
                    .OrderBy(c => c.DisplayOrder)
                    .Select(c => c.HexCode)
                    .ToList(),
                ColorCount = p.Colors.Count,
                SizeCount = p.Sizes.Count,
                PrintAreaCount = p.PrintAreas.Count
            })
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDetailDto>> GetProductById(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        if (product == null) return NotFound(new { message = "Product not found." });

        return Ok(MapToDetailDto(product));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ProductDetailDto>> GetProductBySlug(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstOrDefaultAsync(p => p.Slug.ToLower() == slug.ToLower() && p.IsActive);

        if (product == null) return NotFound(new { message = "Product not found." });

        return Ok(MapToDetailDto(product));
    }

    private static ProductDetailDto MapToDetailDto(Domain.Entities.Product p)
    {
        return new ProductDetailDto
        {
            Id = p.Id,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? string.Empty,
            Name = p.Name,
            Slug = p.Slug,
            Description = p.Description,
            BaseSku = p.BaseSku,
            BasePrice = p.BasePrice,
            IsCustomizable = p.IsCustomizable,
            IsActive = p.IsActive,
            Materials = p.Materials.OrderBy(m => m.DisplayOrder).Select(m => new ProductMaterialDto
            {
                Id = m.Id,
                MaterialName = m.MaterialName,
                GsmValue = m.GsmValue,
                PriceAdjustment = m.PriceAdjustment,
                IsDefault = m.IsDefault,
                DisplayOrder = m.DisplayOrder
            }).ToList(),
            Colors = p.Colors.OrderBy(c => c.DisplayOrder).Select(c => new ProductColorDto
            {
                Id = c.Id,
                ColorName = c.ColorName,
                HexCode = c.HexCode,
                DisplayOrder = c.DisplayOrder,
                Mockups = c.Mockups.OrderBy(m => m.DisplayOrder).Select(m => new ProductMockupDto
                {
                    Id = m.Id,
                    Position = m.Position,
                    MockupUrl = m.MockupUrl,
                    DisplayOrder = m.DisplayOrder
                }).ToList()
            }).ToList(),
            Sizes = p.Sizes.OrderBy(s => s.DisplayOrder).Select(s => new ProductSizeDto
            {
                Id = s.Id,
                SizeLabel = s.SizeLabel,
                PriceAdjustment = s.PriceAdjustment,
                DisplayOrder = s.DisplayOrder
            }).ToList(),
            PrintAreas = p.PrintAreas.Select(pa => new PrintAreaDto
            {
                Id = pa.Id,
                PositionName = pa.PositionName,
                BoxXPercent = pa.BoxXPercent,
                BoxYPercent = pa.BoxYPercent,
                BoxWidthPercent = pa.BoxWidthPercent,
                BoxHeightPercent = pa.BoxHeightPercent,
                PhysicalWidthInches = pa.PhysicalWidthInches,
                PhysicalHeightInches = pa.PhysicalHeightInches,
                ExtraCost = pa.ExtraCost,
                SupportedPrintMethods = pa.SupportedPrintMethods
            }).ToList(),
            VolumeTiers = p.VolumeTiers.OrderBy(v => v.MinQuantity).Select(v => new VolumePricingTierDto
            {
                Id = v.Id,
                MinQuantity = v.MinQuantity,
                MaxQuantity = v.MaxQuantity,
                UnitPrice = v.UnitPrice,
                DiscountPercentage = v.DiscountPercentage
            }).ToList()
        };
    }
}
