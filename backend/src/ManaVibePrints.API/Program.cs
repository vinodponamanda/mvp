using System.Text;
using System.Text.Json.Serialization;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Application.Services;
using ManaVibePrints.Infrastructure.Persistence;
using ManaVibePrints.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context (PostgreSQL with Render MVP database)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=dpg-dae5j85bedkc73bdulog-a.oregon-postgres.render.com;Port=5432;Database=mvp_dev_dj9s;Username=mvp_dev_dj9s_user;Password=Uxng57xk48rlMLW66TJHATqTtkXx9aqU;SSL Mode=Require;Trust Server Certificate=true";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddScoped<IApplicationDbContext>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());

// 2. Business & Infrastructure Services
builder.Services.AddScoped<IPricingCalculatorService, PricingCalculatorService>();
builder.Services.AddScoped<IDeliveryService, DeliveryService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddSingleton<IOtpService, OtpService>();

// 3. Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 4. JWT Authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"] ?? "ManaVibePrints_Super_Secret_Key_For_JWT_Authentication_2026_Enterprise_Print_Platform";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ManaVibePrintsAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ManaVibePrintsClients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

builder.Services.AddAuthorization();

// 5. CORS Configuration (Allows Storefront & Admin Vite dev servers)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllLocalOrigins", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://localhost:5173",
                "http://localhost:5174")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 6. Modern Native .NET 10 OpenAPI
builder.Services.AddOpenApi();

var app = builder.Build();

// 7. Auto-migration & Database Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        await DbInitializer.InitializeAsync(dbContext, logger);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to initialize or migrate database on application startup.");
    }
}

// 8. HTTP Request Pipeline & Interactive Scalar API Documentation
if (app.Environment.IsDevelopment())
{
    // Native OpenAPI document endpoint -> /openapi/v1.json
    app.MapOpenApi();

    // Scalar Interactive API Reference -> /scalar/v1
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Mana Vibe Prints (MVP) API Reference")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Fetch);
    });

    // Auto-redirect root "/" directly to Scalar API Reference
    app.MapGet("/", () => Results.Redirect("/scalar/v1"));
}

app.UseCors("AllowAllLocalOrigins");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
