using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ManaVibePrints.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAdminToken(AdminUser user)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "ManaVibePrints_Super_Secret_Key_For_JWT_Authentication_2026";
        var issuer = _configuration["Jwt:Issuer"] ?? "ManaVibePrintsAPI";
        var audience = _configuration["Jwt:Audience"] ?? "ManaVibePrintsClients";
        var expiryHours = int.TryParse(_configuration["Jwt:ExpiryHours"], out var hours) ? hours : 24;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(expiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateCustomerToken(string phoneNumber)
    {
        return GenerateCustomerTokenInternal(Guid.Empty, "Valued Customer", phoneNumber);
    }

    public string GenerateCustomerToken(CustomerUser customer)
    {
        return GenerateCustomerTokenInternal(customer.Id, customer.FullName, customer.MobileNumber);
    }

    private string GenerateCustomerTokenInternal(Guid customerId, string fullName, string phoneNumber)
    {
        var secretKey = _configuration["Jwt:SecretKey"] ?? "ManaVibePrints_Super_Secret_Key_For_JWT_Authentication_2026";
        var issuer = _configuration["Jwt:Issuer"] ?? "ManaVibePrintsAPI";
        var audience = _configuration["Jwt:Audience"] ?? "ManaVibePrintsClients";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, customerId != Guid.Empty ? customerId.ToString() : phoneNumber),
            new(ClaimTypes.Name, fullName),
            new(ClaimTypes.MobilePhone, phoneNumber),
            new(ClaimTypes.Role, "Customer")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
