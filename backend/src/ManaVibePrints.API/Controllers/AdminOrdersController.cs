using ManaVibePrints.Application.DTOs;
using ManaVibePrints.Application.Interfaces;
using ManaVibePrints.Domain.Entities;
using ManaVibePrints.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ManaVibePrints.API.Controllers;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "SuperAdmin,Operator")]
public class AdminOrdersController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly ILogger<AdminOrdersController> _logger;

    public AdminOrdersController(IApplicationDbContext context, ILogger<AdminOrdersController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<OrderSummaryDto>>> GetAllAdminOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Customizations)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(o => o.Status == status.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower().Trim();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(term) ||
                o.CustomerName.ToLower().Contains(term) ||
                o.CustomerPhone.Contains(term) ||
                (o.CustomerEmail != null && o.CustomerEmail.ToLower().Contains(term)));
        }

        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

    [HttpGet("{id}")]
    public async Task<ActionResult<OrderDetailDto>> GetAdminOrderById(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Items).ThenInclude(i => i.ProductColor)
            .Include(o => o.Items).ThenInclude(i => i.ProductSize)
            .Include(o => o.Items).ThenInclude(i => i.ProductMaterial)
            .Include(o => o.Items).ThenInclude(i => i.Customizations).ThenInclude(c => c.PrintArea)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Order not found." });

        return Ok(MapToOrderDetailDto(order));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<OrderDetailDto>> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Items).ThenInclude(i => i.ProductColor)
            .Include(o => o.Items).ThenInclude(i => i.ProductSize)
            .Include(o => o.Items).ThenInclude(i => i.ProductMaterial)
            .Include(o => o.Items).ThenInclude(i => i.Customizations).ThenInclude(c => c.PrintArea)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Order not found." });

        var previousStatus = order.Status;
        order.Status = request.Status;
        order.UpdatedAt = DateTime.UtcNow;

        if (request.Status == OrderStatus.Cancelled)
        {
            order.CancellationReason = request.CancellationReason;
        }
        else if (previousStatus == OrderStatus.Cancelled && request.Status != OrderStatus.Cancelled)
        {
            order.CancellationReason = null; // Clear cancellation reason if order reopened
        }

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            order.Notes = request.Notes;
        }

        // If marked delivered, update payment status for COD
        if (request.Status == OrderStatus.Delivered && order.PaymentMethod == PaymentMethod.COD)
        {
            order.PaymentStatus = PaymentStatus.Paid;
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Order {OrderNumber} status changed from {OldStatus} to {NewStatus}",
            order.OrderNumber, previousStatus, order.Status);

        return Ok(MapToOrderDetailDto(order));
    }

    [HttpGet("{id}/production-files")]
    public async Task<ActionResult> GetProductionFiles(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.Items).ThenInclude(i => i.ProductColor)
            .Include(o => o.Items).ThenInclude(i => i.ProductSize)
            .Include(o => o.Items).ThenInclude(i => i.Customizations).ThenInclude(c => c.PrintArea)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null) return NotFound(new { message = "Order not found." });

        var files = order.Items.SelectMany((item, itemIdx) =>
            item.Customizations.Select((cust, custIdx) => new
            {
                ItemIndex = itemIdx + 1,
                ProductName = item.Product?.Name,
                Color = item.ProductColor?.ColorName,
                Size = item.ProductSize?.SizeLabel,
                Quantity = item.Quantity,
                Position = cust.Position,
                PrintMethod = cust.SelectedPrintMethod,
                OriginalArtworkUrl = cust.OriginalArtworkUrl,
                CompositeMockupUrl = cust.CompositeMockupUrl,
                EstimatedDpi = cust.EstimatedDpi,
                PrintAreaWidthInches = cust.PrintArea?.PhysicalWidthInches,
                PrintAreaHeightInches = cust.PrintArea?.PhysicalHeightInches
            })
        ).ToList();

        return Ok(new
        {
            order.OrderNumber,
            Customer = order.CustomerName,
            TotalQuantity = order.Items.Sum(i => i.Quantity),
            Files = files
        });
    }

    [HttpGet("download-file")]
    public async Task<IActionResult> DownloadFile([FromQuery] string url, [FromQuery] string? fileName)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return BadRequest(new { message = "Image URL is required." });
        }

        string safeFileName = !string.IsNullOrWhiteSpace(fileName) ? fileName.Trim() : "artwork.png";
        if (!safeFileName.EndsWith(".png", StringComparison.OrdinalIgnoreCase) && 
            !safeFileName.EndsWith(".jpg", StringComparison.OrdinalIgnoreCase) && 
            !safeFileName.EndsWith(".jpeg", StringComparison.OrdinalIgnoreCase))
        {
            safeFileName += ".png";
        }

        // 1. Handle Base64 Data URI
        if (url.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
        {
            var commaIdx = url.IndexOf(',');
            if (commaIdx > 0)
            {
                var base64Part = url[(commaIdx + 1)..];
                var bytes = Convert.FromBase64String(base64Part);
                return File(bytes, "image/png", safeFileName);
            }
        }

        // 2. Handle Cloudinary or Remote URL
        try
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { message = "Failed to fetch image file." });
            }

            var stream = await response.Content.ReadAsStreamAsync();
            var contentType = response.Content.Headers.ContentType?.MediaType ?? "image/png";
            return File(stream, contentType, safeFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to proxy download file: {Url}", url);
            return StatusCode(500, new { message = "Failed to download image file." });
        }
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
