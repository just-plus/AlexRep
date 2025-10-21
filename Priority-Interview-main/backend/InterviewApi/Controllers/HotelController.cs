using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HotelController : ControllerBase
{
    private readonly DataService _dataService;

    public HotelController(DataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Get all hotels
    /// </summary>
    [HttpGet]
    public ActionResult<List<Hotel>> GetAllHotels()
    {
        var hotels = _dataService.ReadHotels();
        return Ok(hotels);
    }

    /// <summary>
    /// Get a hotel by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<Hotel> GetHotel(int id)
    {
        var hotels = _dataService.ReadHotels();
        var hotel = hotels.FirstOrDefault(h => h.Id == id);
        
        if (hotel == null)
            return NotFound($"Hotel with ID {id} not found");
            
        return Ok(hotel);
    }

    /// <summary>
    /// Add a new hotel
    /// </summary>
    [HttpPost]
    public ActionResult<Hotel> AddHotel([FromBody] Hotel hotel)
    {
        if (string.IsNullOrWhiteSpace(hotel.Name))
            return BadRequest("Hotel name is required");

        var hotels = _dataService.ReadHotels();
        
        // Generate new ID
        hotel.Id = hotels.Any() ? hotels.Max(h => h.Id) + 1 : 1;
        
        hotels.Add(hotel);
        _dataService.WriteHotels(hotels);
        
        return CreatedAtAction(nameof(GetHotel), new { id = hotel.Id }, hotel);
    }

    /// <summary>
    /// Update a hotel
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<Hotel> UpdateHotel(int id, [FromBody] Hotel updatedHotel)
    {
        if (string.IsNullOrWhiteSpace(updatedHotel.Name))
            return BadRequest("Hotel name is required");

        var hotels = _dataService.ReadHotels();
        var existingHotel = hotels.FirstOrDefault(h => h.Id == id);
        
        if (existingHotel == null)
            return NotFound($"Hotel with ID {id} not found");

        // Update hotel properties
        existingHotel.Name = updatedHotel.Name;
        existingHotel.Location = updatedHotel.Location;
        existingHotel.Rating = updatedHotel.Rating;
        existingHotel.Description = updatedHotel.Description;

        _dataService.WriteHotels(hotels);
        
        return Ok(existingHotel);
    }

    /// <summary>
    /// Delete a hotel
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult DeleteHotel(int id)
    {
        var hotels = _dataService.ReadHotels();
        var hotel = hotels.FirstOrDefault(h => h.Id == id);
        
        if (hotel == null)
            return NotFound($"Hotel with ID {id} not found");

        // Check if hotel has visitations
        var visitations = _dataService.ReadVisitations();
        var hotelVisitations = visitations.Where(v => v.HotelId == id).ToList();
        
        if (hotelVisitations.Any())
            return BadRequest($"Cannot delete hotel with ID {id} because it has {hotelVisitations.Count} visitation(s)");

        hotels.Remove(hotel);
        _dataService.WriteHotels(hotels);
        
        return NoContent();
    }
}