// COMMENTED OUT - Analytics features are currently hidden in the frontend
// Uncomment when analytics features are re-enabled

/*
using API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : BaseApiController
    {
        private readonly StoreContext _context;

        public AnalyticsController(StoreContext context)
        {
            _context = context;
        }

        [HttpGet("sales/data")]
        public async Task<ActionResult<object>> GetSalesData([FromQuery] int days = 30)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            var salesData = await _context.Orders!
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .GroupBy(o => o.OrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(o => o.Subtotal + o.ShippingCost),
                    Orders = g.Count(),
                    Customers = g.Select(o => o.UserId).Distinct().Count(),
                    AverageOrderValue = g.Average(o => o.Subtotal + o.ShippingCost)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(salesData);
        }

        [HttpGet("sales/categories")]
        public async Task<ActionResult<object>> GetCategorySales([FromQuery] int days = 30)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            var categorySales = await _context.OrderItems!
                .Include(oi => oi.Order)
                .Include(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                        .ThenInclude(p => p!.Category)
                .Where(oi => oi.Order!.OrderDate >= startDate && oi.Order.OrderDate <= endDate)
                .GroupBy(oi => oi.ProductVariant!.Product!.Category!.Name)
                .Select(g => new
                {
                    Name = g.Key,
                    Value = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                    Orders = g.Select(oi => oi.OrderId).Distinct().Count(),
                    Items = g.Sum(oi => oi.Quantity)
                })
                .OrderByDescending(x => x.Value)
                .ToListAsync();

            var totalValue = categorySales.Sum(c => c.Value);
            var result = categorySales.Select(c => new
            {
                c.Name,
                c.Value,
                c.Orders,
                c.Items,
                Percentage = totalValue > 0 ? Math.Round((double)(c.Value / totalValue) * 100, 1) : 0
            }).ToList();

            return Ok(result);
        }

        [HttpGet("sales/metrics")]
        public async Task<ActionResult<object>> GetSalesMetrics([FromQuery] int days = 30)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);
            var previousStartDate = startDate.AddDays(-days);

            // Current period metrics
            var currentOrders = await _context.Orders!
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .ToListAsync();

            // Previous period metrics for comparison
            var previousOrders = await _context.Orders!
                .Where(o => o.OrderDate >= previousStartDate && o.OrderDate < startDate)
                .ToListAsync();

            var currentRevenue = currentOrders.Sum(o => o.Subtotal + o.ShippingCost);
            var previousRevenue = previousOrders.Sum(o => o.Subtotal + o.ShippingCost);

            var currentOrderCount = currentOrders.Count;
            var previousOrderCount = previousOrders.Count;

            var currentCustomers = currentOrders.Select(o => o.UserId).Distinct().Count();
            var previousCustomers = previousOrders.Select(o => o.UserId).Distinct().Count();

            var currentAOV = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
            var previousAOV = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

            var metrics = new
            {
                TotalRevenue = currentRevenue,
                TotalOrders = currentOrderCount,
                TotalCustomers = currentCustomers,
                AverageOrderValue = currentAOV,
                RevenueGrowth = previousRevenue > 0 ? Math.Round(((currentRevenue - previousRevenue) / previousRevenue) * 100, 1) : 0,
                OrdersGrowth = previousOrderCount > 0 ? Math.Round(((double)(currentOrderCount - previousOrderCount) / previousOrderCount) * 100, 1) : 0,
                CustomersGrowth = previousCustomers > 0 ? Math.Round(((double)(currentCustomers - previousCustomers) / previousCustomers) * 100, 1) : 0,
                AOVGrowth = previousAOV > 0 ? Math.Round(((currentAOV - previousAOV) / previousAOV) * 100, 1) : 0
            };

            return Ok(metrics);
        }

        [HttpGet("products/top")]
        public async Task<ActionResult<object>> GetTopProducts([FromQuery] int days = 30, [FromQuery] string metric = "revenue")
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            var query = _context.OrderItems!
                .Include(oi => oi.Order)
                .Include(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                .Where(oi => oi.Order!.OrderDate >= startDate && oi.Order.OrderDate <= endDate)
                .GroupBy(oi => new {
                    ProductId = oi.ProductVariant!.Product!.ProductId,
                    ProductName = oi.ProductVariant.Product.Name,
                    ProductImage = oi.ProductVariant.Product.PictureUrl
                });

            var topProducts = metric.ToLower() switch
            {
                "quantity" => await query
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.Quantity)
                    .Take(10)
                    .ToListAsync(),

                "orders" => await query
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.Orders)
                    .Take(10)
                    .ToListAsync(),

                _ => await query // Default to revenue
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.Revenue)
                    .Take(10)
                    .ToListAsync()
            };

            return Ok(topProducts);
        }

        [HttpGet("products/worst")]
        public async Task<ActionResult<object>> GetWorstProducts([FromQuery] int days = 30, [FromQuery] string metric = "revenue")
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            var query = _context.OrderItems!
                .Include(oi => oi.Order)
                .Include(oi => oi.ProductVariant)
                    .ThenInclude(pv => pv!.Product)
                .Where(oi => oi.Order!.OrderDate >= startDate && oi.Order.OrderDate <= endDate)
                .GroupBy(oi => new {
                    ProductId = oi.ProductVariant!.Product!.ProductId,
                    ProductName = oi.ProductVariant.Product.Name,
                    ProductImage = oi.ProductVariant.Product.PictureUrl
                });

            var worstProducts = metric.ToLower() switch
            {
                "quantity" => await query
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderBy(x => x.Quantity)
                    .Take(10)
                    .ToListAsync(),

                "orders" => await query
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderBy(x => x.Orders)
                    .Take(10)
                    .ToListAsync(),

                _ => await query // Default to revenue
                    .Select(g => new
                    {
                        g.Key.ProductId,
                        g.Key.ProductName,
                        g.Key.ProductImage,
                        Revenue = g.Sum(oi => oi.UnitPrice * oi.Quantity),
                        Quantity = g.Sum(oi => oi.Quantity),
                        Orders = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderBy(x => x.Revenue)
                    .Take(10)
                    .ToListAsync()
            };

            return Ok(worstProducts);
        }

        [HttpGet("customers/segments")]
        public async Task<ActionResult<object>> GetCustomerSegments([FromQuery] int days = 30)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            var customerStats = await _context.Orders!
                .Where(o => o.OrderDate >= startDate && o.OrderDate <= endDate)
                .GroupBy(o => o.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    OrderCount = g.Count(),
                    TotalSpent = g.Sum(o => o.Subtotal + o.ShippingCost)
                })
                .ToListAsync();

            var segments = new
            {
                NewCustomers = customerStats.Count(c => c.OrderCount == 1),
                ReturningCustomers = customerStats.Count(c => c.OrderCount > 1 && c.OrderCount <= 5),
                LoyalCustomers = customerStats.Count(c => c.OrderCount > 5),
                HighValueCustomers = customerStats.Count(c => c.TotalSpent >= 1000),
                TotalCustomers = customerStats.Count
            };

            return Ok(segments);
        }

        [HttpGet("customers/acquisition")]
        public async Task<ActionResult<object>> GetCustomerAcquisition([FromQuery] int days = 30)
        {
            var endDate = DateTime.UtcNow.Date;
            var startDate = endDate.AddDays(-days);

            // Get first order date for each customer to determine acquisition
            var acquisitionData = await _context.Orders!
                .GroupBy(o => o.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    FirstOrderDate = g.Min(o => o.OrderDate)
                })
                .Where(x => x.FirstOrderDate >= startDate && x.FirstOrderDate <= endDate)
                .GroupBy(x => x.FirstOrderDate.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    NewCustomers = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            return Ok(acquisitionData);
        }

        [HttpGet("customers/ltv")]
        public async Task<ActionResult<object>> GetCustomerLifetimeValue([FromQuery] int days = 30)
        {
            var customerLTV = await _context.Orders!
                .GroupBy(o => o.UserId)
                .Select(g => new
                {
                    UserId = g.Key,
                    TotalSpent = g.Sum(o => o.Subtotal + o.ShippingCost),
                    OrderCount = g.Count(),
                    FirstOrder = g.Min(o => o.OrderDate),
                    LastOrder = g.Max(o => o.OrderDate)
                })
                .Where(c => c.TotalSpent > 0)
                .ToListAsync();

            var averageLTV = customerLTV.Any() ? customerLTV.Average(c => c.TotalSpent) : 0;
            var medianLTV = customerLTV.Any() ?
                customerLTV.OrderBy(c => c.TotalSpent).Skip(customerLTV.Count / 2).First().TotalSpent : 0;

            var ltvDistribution = new
            {
                AverageLifetimeValue = Math.Round(averageLTV, 2),
                MedianLifetimeValue = Math.Round(medianLTV, 2),
                HighValueCustomers = customerLTV.Count(c => c.TotalSpent >= 1000),
                TotalCustomers = customerLTV.Count,
                Segments = new
                {
                    Low = customerLTV.Count(c => c.TotalSpent < 100),
                    Medium = customerLTV.Count(c => c.TotalSpent >= 100 && c.TotalSpent < 500),
                    High = customerLTV.Count(c => c.TotalSpent >= 500 && c.TotalSpent < 1000),
                    Premium = customerLTV.Count(c => c.TotalSpent >= 1000)
                }
            };

            return Ok(ltvDistribution);
        }
    }
}
*/