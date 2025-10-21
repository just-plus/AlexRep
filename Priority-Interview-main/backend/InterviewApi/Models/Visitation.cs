using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class Visitation
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("customerId")]
    public int CustomerId { get; set; }

    [JsonPropertyName("hotelId")]
    public int HotelId { get; set; }

    [JsonPropertyName("visitDate")]
    public DateTime VisitDate { get; set; }
}