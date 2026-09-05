using System.Security.Claims;
using System.Text.RegularExpressions;
using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IJwtTokenService _jwtService;
    private readonly IOtpService _otpService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IApplicationDbContext context,
        IJwtTokenService jwtService,
        IOtpService otpService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _otpService = otpService;
        _logger = logger;
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<AdminLoginResponse>> AdminLogin([FromBody] AdminLoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var admin = await _context.AdminUsers
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.Trim().ToLower() && u.IsActive);

        if (admin == null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        admin.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateAdminToken(admin);

        return Ok(new AdminLoginResponse
        {
            Token = token,
            FullName = admin.FullName,
            Email = admin.Email,
            Role = admin.Role.ToString(),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        });
    }

    // ==========================================
    // CUSTOMER MOBILE + PIN AUTHENTICATION
    // ==========================================

    [HttpPost("customer/register")]
    public async Task<ActionResult<CustomerAuthResultDto>> CustomerRegister([FromBody] CustomerRegisterRequest request)
    {
        string rawPhone = request.MobileNumber?.Trim() ?? string.Empty;
        string cleanPhone = CleanMobileNumber(rawPhone);
        string name = request.FullName?.Trim() ?? string.Empty;
        string pin = request.Pin?.Trim() ?? string.Empty;

        // Validation
        if (string.IsNullOrWhiteSpace(name) || name.Length < 2)
        {
            return BadRequest(new { message = "Please enter your full name (minimum 2 characters)." });
        }

        if (string.IsNullOrWhiteSpace(cleanPhone) || cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
        {
            return BadRequest(new { message = "Please enter a valid 10-digit mobile number." });
        }

        if (string.IsNullOrWhiteSpace(pin) || pin.Length < 4 || pin.Length > 6 || !pin.All(char.IsDigit))
        {
            return BadRequest(new { message = "Security PIN must be 4 to 6 numeric digits." });
        }

        // Check if phone number already registered
        var existingCustomer = await _context.CustomerUsers
            .FirstOrDefaultAsync(c => c.MobileNumber == cleanPhone);

        if (existingCustomer != null)
        {
            return Conflict(new { message = "An account with this mobile number already exists. Please sign in with your PIN." });
        }

        // Salt and Hash PIN using BCrypt (cost 11)
        string pinHash = BCrypt.Net.BCrypt.HashPassword(pin, 11);

        var newCustomer = new CustomerUser
        {
            Id = Guid.NewGuid(),
            FullName = name,
            MobileNumber = cleanPhone,
            PinHash = pinHash,
            FailedLoginAttempts = 0,
            LockoutEndUtc = null,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            LastLoginAtUtc = DateTime.UtcNow
        };

        _context.CustomerUsers.Add(newCustomer);
        await _context.SaveChangesAsync();

        _logger.LogInformation("✅ Customer account created successfully for {Name} (+91 {Mobile})", name, cleanPhone);

        var token = _jwtService.GenerateCustomerToken(newCustomer);

        return Ok(new CustomerAuthResultDto
        {
            Token = token,
            Customer = new CustomerUserDto
            {
                Id = newCustomer.Id,
                FullName = newCustomer.FullName,
                MobileNumber = newCustomer.MobileNumber,
                CreatedAtUtc = newCustomer.CreatedAtUtc,
                LastLoginAtUtc = newCustomer.LastLoginAtUtc
            },
            Message = "Account created successfully! Welcome to Mana Vibe Prints."
        });
    }

    [HttpPost("customer/login")]
    public async Task<ActionResult<CustomerAuthResultDto>> CustomerLogin([FromBody] CustomerLoginRequest request)
    {
        string rawPhone = request.MobileNumber?.Trim() ?? string.Empty;
        string cleanPhone = CleanMobileNumber(rawPhone);
        string pin = request.Pin?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(cleanPhone) || cleanPhone.Length != 10 || !cleanPhone.All(char.IsDigit))
        {
            return BadRequest(new { message = "Please enter a valid 10-digit mobile number." });
        }

        if (string.IsNullOrWhiteSpace(pin) || pin.Length < 4 || pin.Length > 6 || !pin.All(char.IsDigit))
        {
            return BadRequest(new { message = "Please enter your 4 to 6-digit numeric PIN." });
        }

        var customer = await _context.CustomerUsers
            .FirstOrDefaultAsync(c => c.MobileNumber == cleanPhone);

        if (customer == null)
        {
            return NotFound(new { message = "No account found with this mobile number. Please create an account first." });
        }

        if (!customer.IsActive)
        {
            return StatusCode(403, new { message = "This account has been deactivated. Please contact store support." });
        }

        // Check if account is temporarily locked
        if (customer.LockoutEndUtc.HasValue && customer.LockoutEndUtc.Value > DateTime.UtcNow)
        {
            var remainingMinutes = Math.Ceiling((customer.LockoutEndUtc.Value - DateTime.UtcNow).TotalMinutes);
            return StatusCode(429, new
            {
                message = $"Account temporarily locked due to repeated incorrect PIN attempts. Please wait {remainingMinutes} minute(s) or contact store support to reset your PIN.",
                isLocked = true,
                remainingMinutes
            });
        }

        // Verify PIN Hash
        bool isPinValid = BCrypt.Net.BCrypt.Verify(pin, customer.PinHash);

        if (!isPinValid)
        {
            customer.FailedLoginAttempts++;
            if (customer.FailedLoginAttempts >= 5)
            {
                customer.LockoutEndUtc = DateTime.UtcNow.AddMinutes(15);
                await _context.SaveChangesAsync();

                _logger.LogWarning("⚠️ Customer {Mobile} locked out for 15 minutes after 5 failed PIN attempts", cleanPhone);

                return StatusCode(429, new
                {
                    message = "Account locked for 15 minutes due to 5 incorrect PIN attempts. Please contact store support to reset your PIN immediately.",
                    isLocked = true,
                    remainingMinutes = 15
                });
            }

            await _context.SaveChangesAsync();
            int remainingAttempts = 5 - customer.FailedLoginAttempts;

            return Unauthorized(new
            {
                message = $"Incorrect PIN. {remainingAttempts} attempt(s) remaining before temporary lockout.",
                attemptsRemaining = remainingAttempts
            });
        }

        // Successful Login - Reset Lockout & Failed Counter
        customer.FailedLoginAttempts = 0;
        customer.LockoutEndUtc = null;
        customer.LastLoginAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateCustomerToken(customer);

        return Ok(new CustomerAuthResultDto
        {
            Token = token,
            Customer = new CustomerUserDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                MobileNumber = customer.MobileNumber,
                MustChangePin = customer.MustChangePin,
                CreatedAtUtc = customer.CreatedAtUtc,
                LastLoginAtUtc = customer.LastLoginAtUtc
            },
            MustChangePin = customer.MustChangePin,
            Message = customer.MustChangePin
                ? "Temporary PIN verified. Please choose your permanent PIN."
                : "Signed in successfully."
        });
    }

    [HttpPost("customer/change-pin")]
    public async Task<ActionResult<CustomerAuthResultDto>> ChangePin([FromBody] CustomerChangePinRequest request)
    {
        string? phone = User.FindFirstValue(ClaimTypes.MobilePhone);
        if (string.IsNullOrWhiteSpace(phone))
        {
            return Unauthorized(new { message = "Session expired or invalid. Please sign in again." });
        }

        string newPin = request.NewPin?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(newPin) || newPin.Length < 4 || newPin.Length > 6 || !newPin.All(char.IsDigit))
        {
            return BadRequest(new { message = "New PIN must be 4 to 6 numeric digits." });
        }

        var customer = await _context.CustomerUsers.FirstOrDefaultAsync(c => c.MobileNumber == phone);
        if (customer == null)
        {
            return NotFound(new { message = "Customer account not found." });
        }

        // Update PIN Hash with BCrypt and clear MustChangePin flag
        customer.PinHash = BCrypt.Net.BCrypt.HashPassword(newPin, 11);
        customer.MustChangePin = false;
        customer.FailedLoginAttempts = 0;
        customer.LockoutEndUtc = null;

        await _context.SaveChangesAsync();

        _logger.LogInformation("✅ Customer {Mobile} successfully updated their permanent PIN", phone);

        var token = _jwtService.GenerateCustomerToken(customer);

        return Ok(new CustomerAuthResultDto
        {
            Token = token,
            Customer = new CustomerUserDto
            {
                Id = customer.Id,
                FullName = customer.FullName,
                MobileNumber = customer.MobileNumber,
                MustChangePin = false,
                CreatedAtUtc = customer.CreatedAtUtc,
                LastLoginAtUtc = customer.LastLoginAtUtc
            },
            MustChangePin = false,
            Message = "Your permanent PIN has been set successfully!"
        });
    }

    [HttpGet("customer/me")]
    public async Task<ActionResult<CustomerUserDto>> GetCurrentCustomer()
    {
        string? phone = User.FindFirstValue(ClaimTypes.MobilePhone);
        if (string.IsNullOrWhiteSpace(phone))
        {
            return Unauthorized(new { message = "Authentication token is missing or invalid." });
        }

        var customer = await _context.CustomerUsers
            .FirstOrDefaultAsync(c => c.MobileNumber == phone);

        if (customer == null)
        {
            return Ok(new CustomerUserDto
            {
                Id = Guid.Empty,
                FullName = User.FindFirstValue(ClaimTypes.Name) ?? "Valued Customer",
                MobileNumber = phone,
                MustChangePin = false
            });
        }

        return Ok(new CustomerUserDto
        {
            Id = customer.Id,
            FullName = customer.FullName,
            MobileNumber = customer.MobileNumber,
            MustChangePin = customer.MustChangePin,
            CreatedAtUtc = customer.CreatedAtUtc,
            LastLoginAtUtc = customer.LastLoginAtUtc
        });
    }

    // Helper: Normalize mobile number to clean 10 digits
    private static string CleanMobileNumber(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        string digits = Regex.Replace(input, @"\D", "");
        if (digits.Length > 10 && digits.StartsWith("91"))
        {
            digits = digits.Substring(2);
        }
        if (digits.Length > 10)
        {
            digits = digits.Substring(digits.Length - 10);
        }
        return digits;
    }
}
