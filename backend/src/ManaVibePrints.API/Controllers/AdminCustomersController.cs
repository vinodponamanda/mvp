using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin,Admin")]
[Route("api/admin/customers")]
public class AdminCustomersController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AdminCustomersController> _logger;

    public AdminCustomersController(
        IApplicationDbContext context,
        ILogger<AdminCustomersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminCustomerDto>>> GetCustomers([FromQuery] string? search = null)
    {
        var query = _context.CustomerUsers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            string term = search.Trim().ToLower();
            query = query.Where(c => 
                c.FullName.ToLower().Contains(term) || 
                c.MobileNumber.Contains(term));
        }

        var customers = await query
            .OrderByDescending(c => c.CreatedAtUtc)
            .ToListAsync();

        // Get order counts grouped by customer phone
        var orderCounts = await _context.Orders
            .GroupBy(o => o.CustomerPhone)
            .Select(g => new { Phone = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Phone, x => x.Count);

        var response = customers.Select(c =>
        {
            orderCounts.TryGetValue(c.MobileNumber, out int count);
            bool isLocked = c.LockoutEndUtc.HasValue && c.LockoutEndUtc.Value > DateTime.UtcNow;

            return new AdminCustomerDto
            {
                Id = c.Id,
                FullName = c.FullName,
                MobileNumber = c.MobileNumber,
                FailedLoginAttempts = c.FailedLoginAttempts,
                LockoutEndUtc = c.LockoutEndUtc,
                IsLocked = isLocked,
                MustChangePin = c.MustChangePin,
                IsActive = c.IsActive,
                CreatedAtUtc = c.CreatedAtUtc,
                LastLoginAtUtc = c.LastLoginAtUtc,
                TotalOrders = count
            };
        }).ToList();

        return Ok(response);
    }

    [HttpPost("{id:guid}/reset-pin")]
    public async Task<ActionResult> ResetCustomerPin(Guid id, [FromBody] AdminResetPinRequest request)
    {
        string newPin = request.NewPin?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(newPin) || newPin.Length < 4 || newPin.Length > 6 || !newPin.All(char.IsDigit))
        {
            return BadRequest(new { message = "New PIN must be 4 to 6 numeric digits." });
        }

        var customer = await _context.CustomerUsers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found." });
        }

        // Salt and Hash the temporary PIN with BCrypt, and mark MustChangePin = true
        customer.PinHash = BCrypt.Net.BCrypt.HashPassword(newPin, 11);
        customer.MustChangePin = true;
        customer.FailedLoginAttempts = 0;
        customer.LockoutEndUtc = null;

        await _context.SaveChangesAsync();

        _logger.LogInformation("🔐 Admin {AdminUser} securely set temporary PIN for customer {Customer} (+91 {Mobile})",
            User.Identity?.Name ?? "Admin", customer.FullName, customer.MobileNumber);

        return Ok(new
        {
            success = true,
            message = $"PIN for {customer.FullName} (+91 {customer.MobileNumber}) was reset successfully. Customer can now log in with the new PIN."
        });
    }

    [HttpPost("{id:guid}/unlock")]
    public async Task<ActionResult> UnlockCustomer(Guid id)
    {
        var customer = await _context.CustomerUsers.FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null)
        {
            return NotFound(new { message = "Customer not found." });
        }

        customer.FailedLoginAttempts = 0;
        customer.LockoutEndUtc = null;

        await _context.SaveChangesAsync();

        _logger.LogInformation("🔓 Admin unlocked account for customer {Customer} (+91 {Mobile})",
            customer.FullName, customer.MobileNumber);

        return Ok(new
        {
            success = true,
            message = $"Account for {customer.FullName} has been unlocked."
        });
    }
}
