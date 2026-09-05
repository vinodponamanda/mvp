namespace ManaVibePrints.Application.DTOs;

public class AdminLoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class AdminLoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

public class CustomerOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
}

public class CustomerOtpVerifyRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class CustomerAuthResponse
{
    public bool IsVerified { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Token { get; set; }
    public string Message { get; set; } = string.Empty;
}

// Customer Mobile + PIN Auth DTOs
public class CustomerRegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
}

public class CustomerLoginRequest
{
    public string MobileNumber { get; set; } = string.Empty;
    public string Pin { get; set; } = string.Empty;
}

public class CustomerUserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public bool MustChangePin { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastLoginAtUtc { get; set; }
}

public class CustomerAuthResultDto
{
    public string Token { get; set; } = string.Empty;
    public CustomerUserDto Customer { get; set; } = new();
    public bool MustChangePin { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class CustomerChangePinRequest
{
    public string? CurrentPin { get; set; }
    public string NewPin { get; set; } = string.Empty;
}

// Admin Customer Management DTOs
public class AdminCustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public int FailedLoginAttempts { get; set; }
    public DateTime? LockoutEndUtc { get; set; }
    public bool IsLocked { get; set; }
    public bool MustChangePin { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? LastLoginAtUtc { get; set; }
    public int TotalOrders { get; set; }
}

public class AdminResetPinRequest
{
    public string NewPin { get; set; } = string.Empty;
}
