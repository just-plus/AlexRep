using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class Customer
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("registrationDate")]
    public DateTime RegistrationDate { get; set; }

    [JsonPropertyName("totalPurchases")]
    public int TotalPurchases { get; set; }
}