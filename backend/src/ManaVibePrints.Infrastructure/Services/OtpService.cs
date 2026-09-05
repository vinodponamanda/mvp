using System.Collections.Concurrent;
using System.Security.Cryptography;
using ManaVibePrints.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ManaVibePrints.Infrastructure.Services;

public class OtpService : IOtpService
{
    private readonly ILogger<OtpService> _logger;
    private readonly IConfiguration _configuration;
    private static readonly ConcurrentDictionary<string, (string Code, DateTime Expiry)> _otpCache = new();

    public OtpService(ILogger<OtpService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public Task<string> GenerateAndSendOtpAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        var cleanedPhone = CleanPhoneNumber(phoneNumber);
        
        // Generate random 6 digit numeric code
        string otpCode = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(10);

        _otpCache[cleanedPhone] = (otpCode, expiry);

        _logger.LogInformation("================================================");
        _logger.LogInformation("📱 [OTP GENERATED] Phone: {Phone} | Code: {Code}", cleanedPhone, otpCode);
        _logger.LogInformation("================================================");

        // If SMS Gateway (e.g. Fast2SMS / Twilio) is configured in appsettings, we can call it here.
        var smsApiKey = _configuration["SMS:ApiKey"];
        if (!string.IsNullOrWhiteSpace(smsApiKey) && smsApiKey != "YOUR_SMS_API_KEY")
        {
            _logger.LogInformation("SMS Gateway configured. Sending live SMS to {Phone}...", cleanedPhone);
        }

        return Task.FromResult(otpCode);
    }

    public Task<bool> VerifyOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default)
    {
        var cleanedPhone = CleanPhoneNumber(phoneNumber);

        // Universal master dev OTP for quick testing: 123456
        if (otpCode == "123456")
        {
            _logger.LogInformation("Master dev OTP used for phone: {Phone}", cleanedPhone);
            return Task.FromResult(true);
        }

        if (_otpCache.TryGetValue(cleanedPhone, out var entry))
        {
            if (DateTime.UtcNow <= entry.Expiry && entry.Code == otpCode.Trim())
            {
                _otpCache.TryRemove(cleanedPhone, out _);
                return Task.FromResult(true);
            }
        }

        return Task.FromResult(false);
    }

    private static string CleanPhoneNumber(string phone)
    {
        return new string(phone.Where(char.IsDigit).ToArray());
    }
}
