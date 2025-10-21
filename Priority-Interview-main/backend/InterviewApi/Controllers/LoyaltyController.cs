using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;
using System.Globalization;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LoyaltyController : ControllerBase
{
    private readonly DataService _dataService;

    public LoyaltyController(DataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Get loyal customers for a specific month and year
    /// Loyal customers are those who visit the same hotel on the same day of the week for an entire month
    /// </summary>
    /// <param name="month">Month (1-12)</param>
    /// <param name="year">Year (e.g., 2024)</param>
    /// <returns>List of loyal customers with their loyalty patterns</returns>
    [HttpGet("monthly")]
    public ActionResult<LoyaltyAnalyticsResponse> GetMonthlyLoyalCustomers([FromQuery] int? month, [FromQuery] int? year)
    {
        // Default to current month/year if not provided
        var targetDate = DateTime.UtcNow;
        var targetMonth = month ?? targetDate.Month;
        var targetYear = year ?? targetDate.Year;

        // Validate month
        if (targetMonth < 1 || targetMonth > 12)
        {
            return BadRequest("Month must be between 1 and 12");
        }

        // Validate year
        if (targetYear < 2020 || targetYear > 2030)
        {
            return BadRequest("Year must be between 2020 and 2030");
        }

        try
        {
            var loyalCustomers = AnalyzeLoyaltyForMonth(targetMonth, targetYear);
            
            var response = new LoyaltyAnalyticsResponse
            {
                LoyalCustomers = loyalCustomers,
                Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(targetMonth),
                Year = targetYear,
                TotalLoyalCustomers = loyalCustomers.Count,
                AnalysisDate = DateTime.UtcNow
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while analyzing loyalty data", details = ex.Message });
        }
    }

    /// <summary>
    /// Get all loyal customers across all available months
    /// </summary>
    /// <returns>List of all loyal customers</returns>
    [HttpGet("all")]
    public ActionResult<List<CustomerLoyalty>> GetAllLoyalCustomers()
    {
        try
        {
            var visitations = _dataService.ReadVisitations();
            var customers = _dataService.ReadCustomers();
            var hotels = _dataService.ReadHotels();

            // Get all unique month/year combinations from visitations
            var monthYearCombos = visitations
                .Select(v => new { Month = v.VisitDate.Month, Year = v.VisitDate.Year })
                .Distinct()
                .ToList();

            var allLoyalCustomers = new List<CustomerLoyalty>();

            // Analyze loyalty for each month/year combination
            foreach (var combo in monthYearCombos)
            {
                var monthlyLoyal = AnalyzeLoyaltyForMonth(combo.Month, combo.Year);
                allLoyalCustomers.AddRange(monthlyLoyal);
            }

            return Ok(allLoyalCustomers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "An error occurred while analyzing loyalty data", details = ex.Message });
        }
    }

    /// <summary>
    /// Analyze loyalty patterns for a specific month and year
    /// </summary>
    private List<CustomerLoyalty> AnalyzeLoyaltyForMonth(int month, int year)
    {
        var visitations = _dataService.ReadVisitations();
        var customers = _dataService.ReadCustomers();
        var hotels = _dataService.ReadHotels();

        // Filter visitations for the target month and year
        var monthVisitations = visitations
            .Where(v => v.VisitDate.Month == month && v.VisitDate.Year == year)
            .ToList();

        // Group visitations by customer, hotel, and day of week
        var loyaltyGroups = monthVisitations
            .GroupBy(v => new { 
                CustomerId = v.CustomerId, 
                HotelId = v.HotelId, 
                DayOfWeek = v.VisitDate.DayOfWeek 
            })
            .Select(g => new {
                CustomerId = g.Key.CustomerId,
                HotelId = g.Key.HotelId,
                DayOfWeek = g.Key.DayOfWeek,
                VisitDates = g.Select(v => v.VisitDate).OrderBy(d => d).ToList(),
                VisitCount = g.Count()
            })
            .ToList();

        var loyalCustomers = new List<CustomerLoyalty>();

        foreach (var group in loyaltyGroups)
        {
            // Check if customer visited on the same day of week throughout the month
            var isLoyal = IsLoyalPattern(group.VisitDates, group.DayOfWeek, month, year);

            if (isLoyal)
            {
                var customer = customers.FirstOrDefault(c => c.Id == group.CustomerId);
                var hotel = hotels.FirstOrDefault(h => h.Id == group.HotelId);

                var loyaltyData = new CustomerLoyalty
                {
                    CustomerId = group.CustomerId,
                    CustomerName = customer?.Name ?? $"Customer #{group.CustomerId}",
                    HotelId = group.HotelId,
                    HotelName = hotel?.Name ?? $"Hotel #{group.HotelId}",
                    DayOfWeek = group.DayOfWeek.ToString(),
                    Month = CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(month),
                    Year = year,
                    VisitDates = group.VisitDates,
                    VisitCount = group.VisitCount,
                    IsLoyal = true
                };

                loyalCustomers.Add(loyaltyData);
            }
        }

        return loyalCustomers;
    }

    /// <summary>
    /// Determine if a customer's visit pattern constitutes loyalty
    /// Loyalty = visiting the same hotel on the same day of week for at least 3 weeks in a month
    /// </summary>
    private bool IsLoyalPattern(List<DateTime> visitDates, DayOfWeek dayOfWeek, int month, int year)
    {
        if (visitDates.Count < 3) // Need at least 3 visits to be considered loyal
            return false;

        // Get all possible dates for this day of week in the target month
        var possibleDates = GetAllDaysOfWeekInMonth(dayOfWeek, month, year);
        
        // Count how many of the possible dates were actually visited
        var visitedDates = visitDates.Where(vd => possibleDates.Contains(vd.Date)).Count();
        
        // Consider loyal if visited at least 75% of the possible days (minimum 3 visits)
        var loyaltyThreshold = Math.Max(3, (int)Math.Ceiling(possibleDates.Count * 0.75));
        
        return visitedDates >= loyaltyThreshold;
    }

    /// <summary>
    /// Get all dates for a specific day of week in a given month/year
    /// </summary>
    private List<DateTime> GetAllDaysOfWeekInMonth(DayOfWeek dayOfWeek, int month, int year)
    {
        var dates = new List<DateTime>();
        var firstDayOfMonth = new DateTime(year, month, 1);
        var lastDayOfMonth = firstDayOfMonth.AddMonths(1).AddDays(-1);

        // Find the first occurrence of the target day of week in the month
        var currentDate = firstDayOfMonth;
        while (currentDate.DayOfWeek != dayOfWeek && currentDate <= lastDayOfMonth)
        {
            currentDate = currentDate.AddDays(1);
        }

        // Add all occurrences of this day of week in the month
        while (currentDate <= lastDayOfMonth)
        {
            dates.Add(currentDate);
            currentDate = currentDate.AddDays(7); // Move to next week
        }

        return dates;
    }
}