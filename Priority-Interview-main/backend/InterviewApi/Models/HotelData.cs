using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class HotelData
{
    [JsonPropertyName("hotels")]
    public List<Hotel> Hotels { get; set; } = new List<Hotel>();
}