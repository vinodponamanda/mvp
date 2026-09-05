using ManaVibePrints.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(ApplicationDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        bool dbHealthy = false;
        string dbMessage = "Connected";

        try
        {
            dbHealthy = await _context.Database.CanConnectAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Database health check probe failed.");
            dbMessage = ex.Message;
        }

        var healthData = new
        {
            status = dbHealthy ? "Healthy" : "Degraded",
            timestamp = DateTime.UtcNow,
            service = "ManaVibePrints.API",
            version = "1.0.0",
            database = new
            {
                healthy = dbHealthy,
                details = dbMessage
            }
        };

        return dbHealthy ? Ok(healthData) : StatusCode(503, healthData);
    }
}
