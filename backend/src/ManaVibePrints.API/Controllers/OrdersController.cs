using System.Security.Cryptography;
using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using ManaVibePrints.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly IPricingCalculatorService _pricingCalculator;
    private readonly IDeliveryService _deliveryService;
    private readonly ICloudinaryService _cloudinaryService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IApplicationDbContext context,
        IPricingCalculatorService pricingCalculator,
        IDeliveryService deliveryService,
        ICloudinaryService cloudinaryService,
        ILogger<OrdersController> logger)
    {
        _context = context;
        _pricingCalculator = pricingCalculator;
        _deliveryService = deliveryService;
        _cloudinaryService = cloudinaryService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetailDto>> PlaceOrder([FromBody] CreateOrderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CustomerName) || string.IsNullOrWhiteSpace(request.CustomerPhone))
        {
            return BadRequest(new { message = "Customer name and phone number are required." });
        }

        if (request.Items == null || request.Items.Count == 0)
        {
            return BadRequest(new { message = "At least one item is required in the order." });
        }

        // Generate unique Order Number e.g. #MVP-49204
        string orderNumber = $"#MVP-{RandomNumberGenerator.GetInt32(10000, 99999)}";
        while (await _context.Orders.AnyAsync(o => o.OrderNumber == orderNumber))
        {
            orderNumber = $"#MVP-{RandomNumberGenerator.GetInt32(10000, 99999)}";
        }

        // Parse payment method
        PaymentMethod parsedPaymentMethod = PaymentMethod.COD;
        if (!string.IsNullOrWhiteSpace(request.PaymentMethod))
        {
            var pm = request.PaymentMethod.Trim().ToUpperInvariant();
            if (pm.Contains("UPI") || pm.Contains("QR"))
            {
                parsedPaymentMethod = PaymentMethod.UPI_Manual;
            }
            else if (pm.Contains("ONLINE") || pm.Contains("CARD") || pm.Contains("NET"))
            {
                parsedPaymentMethod = PaymentMethod.Online;
            }
            else
            {
                parsedPaymentMethod = PaymentMethod.COD;
            }
        }

        decimal? lat = request.GpsLatitude ?? request.CustomerLatitude;
        decimal? lng = request.GpsLongitude ?? request.CustomerLongitude;

        var order = new Order
        {
            OrderNumber = orderNumber,
            CustomerName = request.CustomerName.Trim(),
            CustomerPhone = request.CustomerPhone.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            DeliveryAddress = request.DeliveryAddress.Trim(),
            GpsLatitude = lat,
            GpsLongitude = lng,
            PaymentMethod = parsedPaymentMethod,
            PaymentStatus = PaymentStatus.Pending,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        decimal itemsSubtotal = 0m;

        foreach (var itemReq in request.Items)
        {
            var product = await _context.Products
                .Include(p => p.Colors)
                .Include(p => p.Materials)
                .Include(p => p.Sizes)
                .Include(p => p.PrintAreas)
                .Include(p => p.VolumeTiers)
                .FirstOrDefaultAsync(p => p.Id == itemReq.ProductId);

            if (product == null)
            {
                return BadRequest(new { message = $"Product '{itemReq.ProductId}' was not found." });
            }

            // Resolve Child IDs by Name if not directly supplied
            var colorId = itemReq.ProductColorId ?? 
                          product.Colors.FirstOrDefault(c => string.Equals(c.ColorName, itemReq.ColorName, StringComparison.OrdinalIgnoreCase))?.Id ??
                          product.Colors.FirstOrDefault()?.Id;

            var sizeId = itemReq.ProductSizeId ?? 
                         product.Sizes.FirstOrDefault(s => string.Equals(s.SizeLabel, itemReq.SizeLabel, StringComparison.OrdinalIgnoreCase))?.Id ??
                         product.Sizes.FirstOrDefault()?.Id;

            var materialId = itemReq.ProductMaterialId ?? 
                             product.Materials.FirstOrDefault(m => string.Equals(m.MaterialName, itemReq.MaterialName, StringComparison.OrdinalIgnoreCase))?.Id ??
                             product.Materials.FirstOrDefault()?.Id;

            var activePrintAreaIds = new List<Guid>();
            foreach (var c in itemReq.Customizations)
            {
                var pId = c.PrintAreaId ?? 
                          product.PrintAreas.FirstOrDefault(p => string.Equals(p.PositionName, c.Position, StringComparison.OrdinalIgnoreCase))?.Id;
                if (pId.HasValue) activePrintAreaIds.Add(pId.Value);
            }

            var priceCalc = await _pricingCalculator.CalculatePriceAsync(new CalculatePriceRequest
            {
                ProductId = itemReq.ProductId,
                MaterialId = materialId,
                SizeId = sizeId,
                Quantity = itemReq.Quantity,
                ActivePrintAreaIds = activePrintAreaIds
            });

            var unitPrice = itemReq.UnitPrice ?? priceCalc.UnitPrice;
            var totalPrice = itemReq.TotalPrice ?? (unitPrice * itemReq.Quantity);

            var orderItem = new OrderItem
            {
                ProductId = itemReq.ProductId,
                ProductColorId = colorId,
                ProductSizeId = sizeId,
                ProductMaterialId = materialId,
                Quantity = itemReq.Quantity,
                UnitPrice = unitPrice,
                TotalPrice = totalPrice
            };

            foreach (var customReq in itemReq.Customizations)
            {
                var paId = customReq.PrintAreaId ?? 
                           product.PrintAreas.FirstOrDefault(p => string.Equals(p.PositionName, customReq.Position, StringComparison.OrdinalIgnoreCase))?.Id;

                string rawArtwork = customReq.OriginalArtworkUrl ?? string.Empty;
                string rawMockup = customReq.CompositeMockupUrl ?? string.Empty;
                string orderFolder = $"orders/{DateTime.UtcNow:yyyy-MM-dd}/{orderNumber.TrimStart('#')}";

                // Upload Raw Customer Artwork if in Base64
                if (!string.IsNullOrWhiteSpace(rawArtwork) && rawArtwork.StartsWith("data:"))
                {
                    try
                    {
                        var upRes = await _cloudinaryService.UploadBase64ImageAsync(
                            rawArtwork, 
                            $"{customReq.Position}_artwork.png", 
                            orderFolder
                        );
                        if (!string.IsNullOrWhiteSpace(upRes.Url)) rawArtwork = upRes.Url;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("Cloudinary artwork upload error: {Message}", ex.Message);
                    }
                }

                // Upload 300 DPI Composite Mockup Proof if in Base64
                if (!string.IsNullOrWhiteSpace(rawMockup) && rawMockup.StartsWith("data:"))
                {
                    try
                    {
                        var upRes = await _cloudinaryService.UploadBase64ImageAsync(
                            rawMockup, 
                            $"{customReq.Position}_composite_proof.png", 
                            orderFolder
                        );
                        if (!string.IsNullOrWhiteSpace(upRes.Url)) rawMockup = upRes.Url;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning("Cloudinary proof upload error: {Message}", ex.Message);
                    }
                }

                orderItem.Customizations.Add(new OrderItemCustomization
                {
                    PrintAreaId = paId,
                    Position = customReq.Position,
                    SelectedPrintMethod = !string.IsNullOrWhiteSpace(customReq.SelectedPrintMethod) ? customReq.SelectedPrintMethod : "DTF",
                    OriginalArtworkUrl = rawArtwork,
                    CompositeMockupUrl = rawMockup,
                    CanvasJson = !string.IsNullOrWhiteSpace(customReq.CanvasJson) ? customReq.CanvasJson : (customReq.DesignJson ?? "{}"),
                    EstimatedDpi = customReq.EstimatedDpi > 0 ? customReq.EstimatedDpi : 300
                });
            }

            order.Items.Add(orderItem);
            itemsSubtotal += totalPrice;
        }

        // Delivery calculation
        decimal deliveryFee = 0m;
        if (lat.HasValue && lng.HasValue)
        {
            var deliveryCheck = await _deliveryService.CheckDeliveryEligibilityAsync(new CheckDeliveryRequest
            {
                CustomerLatitude = lat.Value,
                CustomerLongitude = lng.Value,
                OrderSubtotal = itemsSubtotal
            });

            if (!deliveryCheck.IsDeliverable)
            {
                return BadRequest(new { message = deliveryCheck.Message });
            }

            deliveryFee = deliveryCheck.DeliveryFee;
        }

        order.DeliveryFee = deliveryFee;
        order.TotalAmount = itemsSubtotal + deliveryFee;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("✅ Order {OrderNumber} placed successfully for {Customer} with Total ₹{Total}",
            order.OrderNumber, order.CustomerName, order.TotalAmount);

        return CreatedAtAction(nameof(GetOrderByNumber), new { orderNumber = order.OrderNumber }, MapToOrderDetailDto(order));
    }

    [HttpGet("lookup")]
    [HttpGet("track")]
    public async Task<ActionResult<OrderDetailDto>> LookupOrder([FromQuery] string orderNumber)
    {
        if (string.IsNullOrWhiteSpace(orderNumber))
        {
            return BadRequest(new { message = "Order number is required." });
        }
        return await GetOrderByNumber(orderNumber);
    }

    [HttpGet("{orderNumber}")]
    public async Task<ActionResult<OrderDetailDto>> GetOrderByNumber(string orderNumber)
    {
        var clean = Uri.UnescapeDataString(orderNumber).Trim().TrimStart('#');
        var hashFormatted = $"#{clean}";

        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Items).ThenInclude(i => i.ProductColor)
            .Include(o => o.Items).ThenInclude(i => i.ProductSize)
            .Include(o => o.Items).ThenInclude(i => i.ProductMaterial)
            .Include(o => o.Items).ThenInclude(i => i.Customizations).ThenInclude(c => c.PrintArea)
            .FirstOrDefaultAsync(o => o.OrderNumber.ToLower() == hashFormatted.ToLower() || o.OrderNumber.ToLower() == clean.ToLower());

        if (order == null) return NotFound(new { message = $"Order '{orderNumber}' was not found." });

        return Ok(MapToOrderDetailDto(order));
    }

    [HttpGet("phone/{phoneNumber}")]
    [HttpGet("my-orders")]
    public async Task<ActionResult<List<OrderSummaryDto>>> GetOrdersByPhone(
        string? phoneNumber = null,
        [FromQuery] string? phone = null)
    {
        var targetPhone = !string.IsNullOrWhiteSpace(phoneNumber) ? phoneNumber : phone;
        if (string.IsNullOrWhiteSpace(targetPhone))
        {
            return BadRequest(new { message = "Phone number is required." });
        }

        var cleaned = new string(targetPhone.Where(char.IsDigit).ToArray());
        var last10 = cleaned.Length >= 10 ? cleaned[^10..] : cleaned;

        var orders = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Customizations)
            .Where(o => o.CustomerPhone.Contains(cleaned) || o.CustomerPhone.Contains(last10))
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                OrderNumber = o.OrderNumber,
                CustomerName = o.CustomerName,
                CustomerPhone = o.CustomerPhone,
                CustomerEmail = o.CustomerEmail,
                DeliveryAddress = o.DeliveryAddress,
                TotalAmount = o.TotalAmount,
                DeliveryFee = o.DeliveryFee,
                PaymentMethod = o.PaymentMethod,
                PaymentStatus = o.PaymentStatus,
                Status = o.Status,
                CancellationReason = o.CancellationReason,
                ItemCount = o.Items.Count,
                FirstItemPreviewUrl = o.Items
                    .SelectMany(i => i.Customizations)
                    .Select(c => c.CompositeMockupUrl)
                    .FirstOrDefault(),
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            })
            .ToListAsync();

        return Ok(orders);
    }

    private static OrderDetailDto MapToOrderDetailDto(Order order)
    {
        return new OrderDetailDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            CustomerName = order.CustomerName,
            CustomerPhone = order.CustomerPhone,
            CustomerEmail = order.CustomerEmail,
            DeliveryAddress = order.DeliveryAddress,
            GpsLatitude = order.GpsLatitude,
            GpsLongitude = order.GpsLongitude,
            TotalAmount = order.TotalAmount,
            DeliveryFee = order.DeliveryFee,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            Status = order.Status,
            CancellationReason = order.CancellationReason,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            Items = order.Items.Select(i => new OrderItemDetailDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "Custom Product",
                ColorName = i.ProductColor?.ColorName,
                HexCode = i.ProductColor?.HexCode,
                SizeLabel = i.ProductSize?.SizeLabel,
                MaterialName = i.ProductMaterial?.MaterialName,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                TotalPrice = i.TotalPrice,
                Customizations = i.Customizations.Select(c => new OrderItemCustomizationDetailDto
                {
                    Id = c.Id,
                    PrintAreaId = c.PrintAreaId,
                    Position = c.Position,
                    SelectedPrintMethod = c.SelectedPrintMethod,
                    OriginalArtworkUrl = c.OriginalArtworkUrl,
                    CompositeMockupUrl = c.CompositeMockupUrl,
                    CanvasJson = c.CanvasJson,
                    EstimatedDpi = c.EstimatedDpi,
                    PhysicalWidthInches = c.PrintArea?.PhysicalWidthInches,
                    PhysicalHeightInches = c.PrintArea?.PhysicalHeightInches
                }).ToList()
            }).ToList()
        };
    }
}
