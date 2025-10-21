using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class CustomerLoyalty
{
    [JsonPropertyName("customerId")]
    public int CustomerId { get; set; }

    [JsonPropertyName("customerName")]
    public string CustomerName { get; set; } = string.Empty;

    [JsonPropertyName("hotelId")]
    public int HotelId { get; set; }

    [JsonPropertyName("hotelName")]
    public string HotelName { get; set; } = string.Empty;

    [JsonPropertyName("dayOfWeek")]
    public string DayOfWeek { get; set; } = string.Empty;

    [JsonPropertyName("month")]
    public string Month { get; set; } = string.Empty;

    [JsonPropertyName("year")]
    public int Year { get; set; }

    [JsonPropertyName("visitDates")]
    public List<DateTime> VisitDates { get; set; } = new List<DateTime>();

    [JsonPropertyName("visitCount")]
    public int VisitCount { get; set; }

    [JsonPropertyName("isLoyal")]
    public bool IsLoyal { get; set; }
}

public class LoyaltyAnalyticsResponse
{
    [JsonPropertyName("loyalCustomers")]
    public List<CustomerLoyalty> LoyalCustomers { get; set; } = new List<CustomerLoyalty>();

    [JsonPropertyName("month")]
    public string Month { get; set; } = string.Empty;

    [JsonPropertyName("year")]
    public int Year { get; set; }

    [JsonPropertyName("totalLoyalCustomers")]
    public int TotalLoyalCustomers { get; set; }

    [JsonPropertyName("analysisDate")]
    public DateTime AnalysisDate { get; set; }
}