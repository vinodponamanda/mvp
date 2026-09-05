using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "SuperAdmin,Operator")]
public class AdminProductsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminProductsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<ProductDetailDto>>> GetAllAdminProducts()
    {
        var products = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(products.Select(MapToDetailDto).ToList());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDetailDto>> GetAdminProductById(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
        {
            return NotFound(new { message = "Product not found." });
        }

        return Ok(MapToDetailDto(product));
    }

    [HttpPost]
    public async Task<ActionResult<ProductDetailDto>> CreateProduct([FromBody] CreateProductRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Product name is required." });
        }

        string slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.ToLower().Trim().Replace(" ", "-")
            : request.Slug.ToLower().Trim();

        if (await _context.Products.AnyAsync(p => p.Slug == slug))
        {
            slug = $"{slug}-{Guid.NewGuid().ToString("N")[..6]}";
        }

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description,
            BaseSku = request.BaseSku,
            BasePrice = request.BasePrice,
            IsCustomizable = request.IsCustomizable,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        // Add Materials
        foreach (var mat in request.Materials)
        {
            product.Materials.Add(new ProductMaterial
            {
                MaterialName = mat.MaterialName,
                GsmValue = mat.GsmValue,
                PriceAdjustment = mat.PriceAdjustment,
                IsDefault = mat.IsDefault,
                DisplayOrder = mat.DisplayOrder
            });
        }

        // Add Colors & Mockups
        foreach (var col in request.Colors)
        {
            var colorEntity = new ProductColor
            {
                ColorName = col.ColorName,
                HexCode = col.HexCode,
                DisplayOrder = col.DisplayOrder
            };

            foreach (var mock in col.Mockups)
            {
                colorEntity.Mockups.Add(new ProductMockup
                {
                    Position = mock.Position,
                    MockupUrl = mock.MockupUrl,
                    DisplayOrder = mock.DisplayOrder
                });
            }

            product.Colors.Add(colorEntity);
        }

        // Add Sizes
        foreach (var size in request.Sizes)
        {
            product.Sizes.Add(new ProductSize
            {
                SizeLabel = size.SizeLabel,
                PriceAdjustment = size.PriceAdjustment,
                DisplayOrder = size.DisplayOrder
            });
        }

        // Add Print Areas
        foreach (var pa in request.PrintAreas)
        {
            product.PrintAreas.Add(new PrintArea
            {
                PositionName = pa.PositionName,
                BoxXPercent = pa.BoxXPercent,
                BoxYPercent = pa.BoxYPercent,
                BoxWidthPercent = pa.BoxWidthPercent,
                BoxHeightPercent = pa.BoxHeightPercent,
                PhysicalWidthInches = pa.PhysicalWidthInches,
                PhysicalHeightInches = pa.PhysicalHeightInches,
                ExtraCost = pa.ExtraCost,
                SupportedPrintMethods = pa.SupportedPrintMethods.Count > 0 ? pa.SupportedPrintMethods : new List<string> { "DTF" }
            });
        }

        // Add Volume Pricing Tiers
        foreach (var vt in request.VolumeTiers)
        {
            product.VolumeTiers.Add(new VolumePricingTier
            {
                MinQuantity = vt.MinQuantity,
                MaxQuantity = vt.MaxQuantity,
                UnitPrice = vt.UnitPrice,
                DiscountPercentage = vt.DiscountPercentage
            });
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAllAdminProducts), new { id = product.Id }, MapToDetailDto(product));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDetailDto>> UpdateProduct(Guid id, [FromBody] CreateProductRequest request)
    {
        var product = await _context.Products
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null) return NotFound(new { message = "Product not found." });

        product.CategoryId = request.CategoryId;
        product.Name = request.Name.Trim();
        product.Description = request.Description;
        product.BaseSku = request.BaseSku;
        product.BasePrice = request.BasePrice;
        product.IsCustomizable = request.IsCustomizable;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // Delete old child entities cleanly
        if (product.Materials.Count > 0) _context.ProductMaterials.RemoveRange(product.Materials);
        if (product.Colors.Count > 0) _context.ProductColors.RemoveRange(product.Colors);
        if (product.Sizes.Count > 0) _context.ProductSizes.RemoveRange(product.Sizes);
        if (product.PrintAreas.Count > 0) _context.PrintAreas.RemoveRange(product.PrintAreas);
        if (product.VolumeTiers.Count > 0) _context.VolumePricingTiers.RemoveRange(product.VolumeTiers);
        
        await _context.SaveChangesAsync();

        // Add new Materials
        foreach (var mat in request.Materials)
        {
            _context.ProductMaterials.Add(new ProductMaterial
            {
                ProductId = id,
                MaterialName = mat.MaterialName,
                GsmValue = mat.GsmValue,
                PriceAdjustment = mat.PriceAdjustment,
                IsDefault = mat.IsDefault,
                DisplayOrder = mat.DisplayOrder
            });
        }

        // Add new Colors & Mockups
        foreach (var col in request.Colors)
        {
            var colorEntity = new ProductColor
            {
                ProductId = id,
                ColorName = col.ColorName,
                HexCode = col.HexCode,
                DisplayOrder = col.DisplayOrder
            };

            foreach (var mock in col.Mockups)
            {
                colorEntity.Mockups.Add(new ProductMockup
                {
                    Position = mock.Position,
                    MockupUrl = mock.MockupUrl,
                    DisplayOrder = mock.DisplayOrder
                });
            }

            _context.ProductColors.Add(colorEntity);
        }

        // Add new Sizes
        foreach (var size in request.Sizes)
        {
            _context.ProductSizes.Add(new ProductSize
            {
                ProductId = id,
                SizeLabel = size.SizeLabel,
                PriceAdjustment = size.PriceAdjustment,
                DisplayOrder = size.DisplayOrder
            });
        }

        // Add new Print Areas
        foreach (var pa in request.PrintAreas)
        {
            _context.PrintAreas.Add(new PrintArea
            {
                ProductId = id,
                PositionName = pa.PositionName,
                BoxXPercent = pa.BoxXPercent,
                BoxYPercent = pa.BoxYPercent,
                BoxWidthPercent = pa.BoxWidthPercent,
                BoxHeightPercent = pa.BoxHeightPercent,
                PhysicalWidthInches = pa.PhysicalWidthInches,
                PhysicalHeightInches = pa.PhysicalHeightInches,
                ExtraCost = pa.ExtraCost,
                SupportedPrintMethods = pa.SupportedPrintMethods
            });
        }

        // Add new Volume Tiers
        foreach (var vt in request.VolumeTiers)
        {
            _context.VolumePricingTiers.Add(new VolumePricingTier
            {
                ProductId = id,
                MinQuantity = vt.MinQuantity,
                MaxQuantity = vt.MaxQuantity,
                UnitPrice = vt.UnitPrice,
                DiscountPercentage = vt.DiscountPercentage
            });
        }

        await _context.SaveChangesAsync();

        // Reload complete product
        var updatedProduct = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Materials)
            .Include(p => p.Colors).ThenInclude(c => c.Mockups)
            .Include(p => p.Sizes)
            .Include(p => p.PrintAreas)
            .Include(p => p.VolumeTiers)
            .FirstAsync(p => p.Id == id);

        return Ok(MapToDetailDto(updatedProduct));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null) return NotFound(new { message = "Product not found." });

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Product deleted successfully." });
    }

    private static ProductDetailDto MapToDetailDto(Product p)
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
