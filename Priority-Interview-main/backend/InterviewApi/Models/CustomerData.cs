using System.Text.Json.Serialization;

namespace InterviewApi.Models;

public class CustomerData
{
    [JsonPropertyName("customers")]
    public List<Customer> Customers { get; set; } = new List<Customer>();
}