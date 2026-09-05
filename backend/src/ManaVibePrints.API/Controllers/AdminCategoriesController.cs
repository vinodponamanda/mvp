using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/admin/categories")]
[Authorize(Roles = "SuperAdmin,Operator")]
public class AdminCategoriesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AdminCategoriesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CategoryDto>>> GetAllAdminCategories()
    {
        var categories = await _context.Categories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Slug = c.Slug,
                IconUrl = c.IconUrl,
                DisplayOrder = c.DisplayOrder,
                IsActive = c.IsActive,
                ProductCount = c.Products.Count
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return BadRequest(new { message = "Category name is required." });
        }

        string slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.ToLower().Trim().Replace(" ", "-").Replace("&", "and")
            : request.Slug.ToLower().Trim();

        if (await _context.Categories.AnyAsync(c => c.Slug == slug))
        {
            return BadRequest(new { message = $"Category with slug '{slug}' already exists." });
        }

        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = slug,
            IconUrl = request.IconUrl,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAllAdminCategories), new { id = category.Id }, new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            IconUrl = category.IconUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive,
            ProductCount = 0
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CategoryDto>> UpdateCategory(Guid id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return NotFound(new { message = "Category not found." });

        string slug = string.IsNullOrWhiteSpace(request.Slug)
            ? request.Name.ToLower().Trim().Replace(" ", "-")
            : request.Slug.ToLower().Trim();

        if (await _context.Categories.AnyAsync(c => c.Slug == slug && c.Id != id))
        {
            return BadRequest(new { message = $"Another category with slug '{slug}' already exists." });
        }

        category.Name = request.Name.Trim();
        category.Slug = slug;
        category.IconUrl = request.IconUrl;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;

        await _context.SaveChangesAsync();

        return Ok(new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Slug = category.Slug,
            IconUrl = category.IconUrl,
            DisplayOrder = category.DisplayOrder,
            IsActive = category.IsActive
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(Guid id)
    {
        var category = await _context.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
        if (category == null) return NotFound(new { message = "Category not found." });

        if (category.Products.Count > 0)
        {
            return BadRequest(new { message = $"Cannot delete category containing {category.Products.Count} products. Deactivate it instead." });
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Category deleted successfully." });
    }
}
