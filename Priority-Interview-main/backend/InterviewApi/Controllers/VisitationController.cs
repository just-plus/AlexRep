using Microsoft.AspNetCore.Mvc;
using InterviewApi.Models;
using InterviewApi.Services;

namespace InterviewApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisitationController : ControllerBase
{
    private readonly DataService _dataService;

    public VisitationController(DataService dataService)
    {
        _dataService = dataService;
    }

    /// <summary>
    /// Get all visitations
    /// </summary>
    [HttpGet]
    public ActionResult<List<Visitation>> GetAllVisitations()
    {
        var visitations = _dataService.ReadVisitations();
        return Ok(visitations);
    }

    /// <summary>
    /// Get visitations by customer ID
    /// </summary>
    [HttpGet("customer/{customerId}")]
    public ActionResult<List<Visitation>> GetVisitationsByCustomer(int customerId)
    {
        var visitations = _dataService.ReadVisitations();
        var customerVisitations = visitations.Where(v => v.CustomerId == customerId).ToList();
        
        return Ok(customerVisitations);
    }

    /// <summary>
    /// Get visitations by hotel ID
    /// </summary>
    [HttpGet("hotel/{hotelId}")]
    public ActionResult<List<Visitation>> GetVisitationsByHotel(int hotelId)
    {
        var visitations = _dataService.ReadVisitations();
        var hotelVisitations = visitations.Where(v => v.HotelId == hotelId).ToList();
        
        return Ok(hotelVisitations);
    }

    /// <summary>
    /// Add a new visitation
    /// </summary>
    [HttpPost]
    public ActionResult<Visitation> AddVisitation([FromBody] Visitation visitation)
    {
        // Validate customer and hotel exist
        var customers = _dataService.ReadCustomers();
        var hotels = _dataService.ReadHotels();
        
        if (!customers.Any(c => c.Id == visitation.CustomerId))
            return BadRequest($"Customer with ID {visitation.CustomerId} not found");
            
        if (!hotels.Any(h => h.Id == visitation.HotelId))
            return BadRequest($"Hotel with ID {visitation.HotelId} not found");

        var visitations = _dataService.ReadVisitations();
        
        // Generate new ID
        visitation.Id = visitations.Any() ? visitations.Max(v => v.Id) + 1 : 1;
        
        // Set visit date if not provided
        if (visitation.VisitDate == default)
            visitation.VisitDate = DateTime.UtcNow;
        
        visitations.Add(visitation);
        _dataService.WriteVisitations(visitations);
        
        return CreatedAtAction(nameof(GetVisitation), new { id = visitation.Id }, visitation);
    }

    /// <summary>
    /// Get a visitation by ID
    /// </summary>
    [HttpGet("{id}")]
    public ActionResult<Visitation> GetVisitation(int id)
    {
        var visitations = _dataService.ReadVisitations();
        var visitation = visitations.FirstOrDefault(v => v.Id == id);
        
        if (visitation == null)
            return NotFound($"Visitation with ID {id} not found");
            
        return Ok(visitation);
    }

    /// <summary>
    /// Update a visitation
    /// </summary>
    [HttpPut("{id}")]
    public ActionResult<Visitation> UpdateVisitation(int id, [FromBody] Visitation updatedVisitation)
    {
        // Validate customer and hotel exist
        var customers = _dataService.ReadCustomers();
        var hotels = _dataService.ReadHotels();
        
        if (!customers.Any(c => c.Id == updatedVisitation.CustomerId))
            return BadRequest($"Customer with ID {updatedVisitation.CustomerId} not found");
            
        if (!hotels.Any(h => h.Id == updatedVisitation.HotelId))
            return BadRequest($"Hotel with ID {updatedVisitation.HotelId} not found");

        var visitations = _dataService.ReadVisitations();
        var existingVisitation = visitations.FirstOrDefault(v => v.Id == id);
        
        if (existingVisitation == null)
            return NotFound($"Visitation with ID {id} not found");

        // Update visitation properties
        existingVisitation.CustomerId = updatedVisitation.CustomerId;
        existingVisitation.HotelId = updatedVisitation.HotelId;
        existingVisitation.VisitDate = updatedVisitation.VisitDate;

        _dataService.WriteVisitations(visitations);
        
        return Ok(existingVisitation);
    }

    /// <summary>
    /// Delete a visitation
    /// </summary>
    [HttpDelete("{id}")]
    public ActionResult DeleteVisitation(int id)
    {
        var visitations = _dataService.ReadVisitations();
        var visitation = visitations.FirstOrDefault(v => v.Id == id);
        
        if (visitation == null)
            return NotFound($"Visitation with ID {id} not found");

        visitations.Remove(visitation);
        _dataService.WriteVisitations(visitations);
        
        return NoContent();
    }
}