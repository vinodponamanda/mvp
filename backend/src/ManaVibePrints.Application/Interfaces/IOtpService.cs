namespace ManaVibePrints.Application.Interfaces;

public interface IOtpService
{
    Task<string> GenerateAndSendOtpAsync(string phoneNumber, CancellationToken cancellationToken = default);
    Task<bool> VerifyOtpAsync(string phoneNumber, string otpCode, CancellationToken cancellationToken = default);
}
