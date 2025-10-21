using System.Text.Json;
using InterviewApi.Models;

namespace InterviewApi.Services;

public class DataService
{
    private readonly string _dataFolder;

    public DataService()
    {
        _dataFolder = Path.Combine(Directory.GetCurrentDirectory(), "Data");
    }

    /// <summary>
    /// Read customers from JSON file
    /// </summary>
    public List<Customer> ReadCustomers()
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "customers.json");
            if (!File.Exists(filePath))
                return new List<Customer>();

            var json = File.ReadAllText(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var data = JsonSerializer.Deserialize<CustomerData>(json, options);
            return data?.Customers ?? new List<Customer>();
        }
        catch
        {
            return new List<Customer>();
        }
    }

    /// <summary>
    /// Write customers to JSON file
    /// </summary>
    public void WriteCustomers(List<Customer> customers)
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "customers.json");
            var data = new CustomerData { Customers = customers };
            var options = new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var json = JsonSerializer.Serialize(data, options);
            File.WriteAllText(filePath, json);
        }
        catch
        {
            // Handle error as needed
        }
    }

    /// <summary>
    /// Read hotels from JSON file
    /// </summary>
    public List<Hotel> ReadHotels()
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "hotels.json");
            if (!File.Exists(filePath))
                return new List<Hotel>();

            var json = File.ReadAllText(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var data = JsonSerializer.Deserialize<HotelData>(json, options);
            return data?.Hotels ?? new List<Hotel>();
        }
        catch
        {
            return new List<Hotel>();
        }
    }

    /// <summary>
    /// Write hotels to JSON file
    /// </summary>
    public void WriteHotels(List<Hotel> hotels)
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "hotels.json");
            var data = new HotelData { Hotels = hotels };
            var options = new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var json = JsonSerializer.Serialize(data, options);
            File.WriteAllText(filePath, json);
        }
        catch
        {
            // Handle error as needed
        }
    }

    /// <summary>
    /// Read visitations from JSON file
    /// </summary>
    public List<Visitation> ReadVisitations()
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "visitations.json");
            if (!File.Exists(filePath))
                return new List<Visitation>();

            var json = File.ReadAllText(filePath);
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var data = JsonSerializer.Deserialize<VisitationData>(json, options);
            return data?.Visitations ?? new List<Visitation>();
        }
        catch
        {
            return new List<Visitation>();
        }
    }

    /// <summary>
    /// Write visitations to JSON file
    /// </summary>
    public void WriteVisitations(List<Visitation> visitations)
    {
        try
        {
            var filePath = Path.Combine(_dataFolder, "visitations.json");
            var data = new VisitationData { Visitations = visitations };
            var options = new JsonSerializerOptions 
            { 
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            var json = JsonSerializer.Serialize(data, options);
            File.WriteAllText(filePath, json);
        }
        catch
        {
            // Handle error as needed
        }
    }
}