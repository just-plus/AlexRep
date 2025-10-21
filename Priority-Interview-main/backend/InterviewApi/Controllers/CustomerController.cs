using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly DataService _dataService;

    public CustomerController(DataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Welcome endpoint - returns a welcome message
    /// </summary>
    [HttpGet("welcome")]
    public ActionResult<object> Welcome()
    {
        var customers = _dataService.ReadCustomers();
        var hotels = _dataService.ReadHotels();
        var visitations = _dataService.ReadVisitations();
        
        return Ok(new
        {
            message = "Welcome to Priority Customer Management API!",
            version = "1.0.0",
            dataSource = "JSON files in Data folder",
            dataStatus = new
            {
                customersCount = customers.Count,
                hotelsCount = hotels.Count,
                visitationsCount = visitations.Count
            },
            endpoints = new[]
            {
                "GET /api/customer/welcome - This endpoint",
                "GET /api/customer - Get all customers",
                "GET /api/customer/{id} - Get customer by ID",
                "POST /api/customer - Add new customer",
                "PUT /api/customer/{id} - Update customer",
                "DELETE /api/customer/{id} - Delete customer",
                "GET /api/customer/loyal - Find loyal customers at date (simple)",
                "GET /api/customer/loyalty-analytics - Advanced loyalty analytics by month/year",
                "POST /api/customer/register - Register customer at date",
                "GET /api/hotel - Get all hotels",
                "GET /api/hotel/{id} - Get hotel by ID",
                "POST /api/hotel - Add new hotel",
                "PUT /api/hotel/{id} - Update hotel",
                "DELETE /api/hotel/{id} - Delete hotel",
                "GET /api/visitation - Get all visitations",
                "GET /api/visitation/{id} - Get visitation by ID",
                "GET /api/visitation/customer/{id} - Get visitations by customer",
                "GET /api/visitation/hotel/{id} - Get visitations by hotel",
                "POST /api/visitation - Add new visitation",
                "PUT /api/visitation/{id} - Update visitation",
                "DELETE /api/visitation/{id} - Delete visitation",
                "GET /api/loyalty/monthly - Monthly loyalty analysis",
                "GET /api/loyalty/all - All loyal customers across all months"
            },
            note = "All data is read from JSON files in the Data folder using the DataService"
        });
    }

    /// <summary>
    /// Get all customers
    /// </summary>
    [HttpGet]
    public ActionResult<List<Customer>> GetAllCustomers()
    {
        var customers = ReadCustomersFromJson();
        return Ok(customers);
    }

    /// <summary>
    /// Helper method to read customers from JSON file
    /// </summary>
    private List<Customer> ReadCustomersFromJson()
    {
        return _dataService.ReadCustomers();
    }

    /// <summary>
    /// Helper method to write customers to JSON file
    /// </summary>
    private void WriteCustomersToJson(List<Customer> customers)
    {
        _dataService.WriteCustomers(customers);
    }

    /// <summary>
    /// Add a new customer
    /// </summary>
    [HttpPost]
    public ActionResult<Customer> AddCustomer([FromBody] Customer customer)
    {
        // Validate the customer data
        if (string.IsNullOrWhiteSpace(customer.Name))
            return BadRequest("Customer name is required");
            
        if (string.IsNullOrWhiteSpace(customer.Email))
            return BadRequest("Customer email is required");

        var customers = ReadCustomersFromJson();
        
        // Generate new ID
        customer.Id = customers.Any() ? customers.Max(c => c.Id) + 1 : 1;
        
        // Set registration date
        customer.RegistrationDate = DateTime.UtcNow;
        
        // Initialize total purchases
        customer.TotalPurchases = 0;
        
        customers.Add(customer);
        WriteCustomersToJson(customers);
        
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    /// <summary>
    /// Get a customer by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<Customer> GetCustomer(int id)
    {
        var customers = ReadCustomersFromJson();
        var customer = customers.FirstOrDefault(c => c.Id == id);
        
        if (customer == null)
            return NotFound($"Customer with ID {id} not found");
            
        return Ok(customer);
    }

    /// <summary>
    /// Find loyal customers at a specific date
    /// </summary>
    [HttpGet("loyal")]
    public ActionResult<List<Customer>> GetLoyalCustomers([FromQuery] DateTime? date)
    {
        var targetDate = date ?? DateTime.UtcNow;
        var customers = ReadCustomersFromJson();
        
        // Define criteria for "loyal customer" (TotalPurchases > 10)
        var loyalCustomers = customers
            .Where(c => c.RegistrationDate <= targetDate && c.TotalPurchases > 10)
            .ToList();
        
        return Ok(loyalCustomers);
    }

    /// <summary>
    /// Register a customer at a specific date
    /// </summary>
    [HttpPost("register")]
    public ActionResult<Customer> RegisterCustomer([FromBody] Customer customer)
    {
        // Validate customer data
        if (string.IsNullOrWhiteSpace(customer.Name))
            return BadRequest("Customer name is required");
            
        if (string.IsNullOrWhiteSpace(customer.Email))
            return BadRequest("Customer email is required");

        var customers = ReadCustomersFromJson();
        
        // Generate new ID
        customer.Id = customers.Any() ? customers.Max(c => c.Id) + 1 : 1;
        
        // Use RegistrationDate from request (or default to DateTime.UtcNow if not provided)
        if (customer.RegistrationDate == default)
            customer.RegistrationDate = DateTime.UtcNow;
        
        // Set TotalPurchases to 0 for new customer
        customer.TotalPurchases = 0;
        
        customers.Add(customer);
        WriteCustomersToJson(customers);
        
        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
    }

    /// <summary>
    /// Update a customer
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<Customer> UpdateCustomer(int id, [FromBody] Customer updatedCustomer)
    {
        // Validate the customer data
        if (string.IsNullOrWhiteSpace(updatedCustomer.Name))
            return BadRequest("Customer name is required");
            
        if (string.IsNullOrWhiteSpace(updatedCustomer.Email))
            return BadRequest("Customer email is required");

        var customers = ReadCustomersFromJson();
        var existingCustomer = customers.FirstOrDefault(c => c.Id == id);
        
        if (existingCustomer == null)
            return NotFound($"Customer with ID {id} not found");

        // Update customer properties
        existingCustomer.Name = updatedCustomer.Name;
        existingCustomer.Email = updatedCustomer.Email;
        existingCustomer.TotalPurchases = updatedCustomer.TotalPurchases;
        
        // Keep the original registration date and ID
        // existingCustomer.Id remains the same
        // existingCustomer.RegistrationDate remains the same

        WriteCustomersToJson(customers);
        
        return Ok(existingCustomer);
    }

    /// <summary>
    /// Delete a customer
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult DeleteCustomer(int id)
    {
        var customers = ReadCustomersFromJson();
        var customer = customers.FirstOrDefault(c => c.Id == id);
        
        if (customer == null)
            return NotFound($"Customer with ID {id} not found");

        customers.Remove(customer);
        WriteCustomersToJson(customers);
        
        return NoContent();
    }

    /// <summary>
    /// Get loyal customers based on advanced loyalty analytics
    /// Loyal customers visit the same hotel on the same day of week for an entire month
    /// </summary>
    [HttpGet("loyalty-analytics")]
    public ActionResult<object> GetLoyaltyAnalytics([FromQuery] int? month, [FromQuery] int? year)
    {
        // Default to current month/year if not provided
        var targetDate = DateTime.UtcNow;
        var targetMonth = month ?? targetDate.Month;
        var targetYear = year ?? targetDate.Year;

        // Validate parameters
        if (targetMonth < 1 || targetMonth > 12)
        {
            return BadRequest("Month must be between 1 and 12");
        }

        try
        {
            var visitations = _dataService.ReadVisitations();
            var customers = ReadCustomersFromJson();
            var hotels = _dataService.ReadHotels();

            // Filter visitations for the target month and year
            var monthVisitations = visitations
                .Where(v => v.VisitDate.Month == targetMonth && v.VisitDate.Year == targetYear)
                .ToList();

            // Group by customer, hotel, and day of week
            var loyaltyPatterns = monthVisitations
                .GroupBy(v => new { 
                    CustomerId = v.CustomerId, 
                    HotelId = v.HotelId, 
                    DayOfWeek = v.VisitDate.DayOfWeek 
                })
                .Where(g => g.Count() >= 3) // At least 3 visits
                .Select(g => {
                    var customer = customers.FirstOrDefault(c => c.Id == g.Key.CustomerId);
                    var hotel = hotels.FirstOrDefault(h => h.Id == g.Key.HotelId);
                    var visitDates = g.Select(v => v.VisitDate).OrderBy(d => d).ToList();
                    
                    return new {
                        customerId = g.Key.CustomerId,
                        customerName = customer?.Name ?? $"Customer #{g.Key.CustomerId}",
                        customerEmail = customer?.Email ?? "",
                        hotelId = g.Key.HotelId,
                        hotelName = hotel?.Name ?? $"Hotel #{g.Key.HotelId}",
                        hotelLocation = hotel?.Location ?? "",
                        dayOfWeek = g.Key.DayOfWeek.ToString(),
                        visitCount = g.Count(),
                        visitDates = visitDates.Select(d => d.ToString("yyyy-MM-dd")).ToList(),
                        firstVisit = visitDates.First().ToString("yyyy-MM-dd"),
                        lastVisit = visitDates.Last().ToString("yyyy-MM-dd"),
                        isConsistentPattern = IsConsistentWeeklyPattern(visitDates, g.Key.DayOfWeek, targetMonth, targetYear)
                    };
                })
                .Where(p => p.isConsistentPattern)
                .ToList();

            var response = new {
                month = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(targetMonth),
                year = targetYear,
                totalLoyalCustomers = loyaltyPatterns.Count,
                loyaltyPatterns = loyaltyPatterns,
                analysisDate = DateTime.UtcNow,
                criteria = "Customers who visit the same hotel on the same day of week for at least 75% of possible days in the month (minimum 3 visits)"
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while analyzing loyalty data", details = ex.Message });
        }
    }

    /// <summary>
    /// Check if visit dates represent a consistent weekly pattern
    /// </summary>
    private bool IsConsistentWeeklyPattern(List<DateTime> visitDates, DayOfWeek dayOfWeek, int month, int year)
    {
        if (visitDates.Count < 3) return false;

        // Get all possible dates for this day of week in the target month
        var possibleDates = new List<DateTime>();
        var firstDayOfMonth = new DateTime(year, month, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        var currentDate = firstDayOfMonth;
        while (currentDate.DayOfWeek != dayOfWeek && currentDate <= lastDayOfMonth)
        {
            currentDate = currentDate.AddDays(1);
        }

        while (currentDate <= lastDayOfMonth)
        {
            possibleDates.Add(currentDate);
            currentDate = currentDate.AddDays(7);
        }

        // Count how many of the possible dates were actually visited
        var visitedCount = visitDates.Count(vd => possibleDates.Any(pd => pd.Date == vd.Date));
        
        // Consider loyal if visited at least 75% of possible days (minimum 3)
        var threshold = Math.Max(3, (int)Math.Ceiling(possibleDates.Count * 0.75));
        
        return visitedCount >= threshold;
    }
}

