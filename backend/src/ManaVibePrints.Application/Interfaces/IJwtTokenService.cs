using ManaVibePrints.Domain.Entities;

namespace ManaVibePrints.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAdminToken(AdminUser user);
    string GenerateCustomerToken(string phoneNumber);
    string GenerateCustomerToken(CustomerUser customer);
}
