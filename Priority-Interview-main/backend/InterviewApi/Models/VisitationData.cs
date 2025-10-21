using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class VisitationData
{
    [JsonPropertyName("visitations")]
    public List<Visitation> Visitations { get; set; } = new List<Visitation>();
}