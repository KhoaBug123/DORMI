using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DormiDbContext _context;

    public DashboardController(DormiDbContext context)
    {
        _context = context;
    }

    public class CreateAppointmentRequest
    {
        public Guid RoomId { get; set; }
        public DateTime AppointmentDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class CreateTicketRequest
    {
        public Guid RoomId { get; set; }
        public string IssueType { get; set; } = string.Empty; // Điện nước, Đồ gia dụng, Khóa cửa, Khác
        public string Description { get; set; } = string.Empty;
    }

    // ==========================================
    // Viewing Appointments
    // ==========================================

    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (user.Role == UserRole.Landlord)
        {
            var apps = await _context.ViewingAppointments
                .Include(a => a.Room)
                .Include(a => a.Customer)
                .ThenInclude(c => c.User)
                .Where(a => a.Room.LandlordId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    id = a.Id.ToString(),
                    roomId = a.RoomId.ToString(),
                    roomTitle = a.Room.Title,
                    date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    time = a.AppointmentDate.ToString("HH:mm"),
                    status = a.Status.ToLower(), // pending, accepted, declined
                    tenantName = a.Customer.User.FullName,
                    tenantPhone = a.Customer.User.Email // mapping email as contact placeholder
                })
                .ToListAsync();

            return Ok(apps);
        }
        else
        {
            var apps = await _context.ViewingAppointments
                .Include(a => a.Room)
                .Where(a => a.CustomerId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    id = a.Id.ToString(),
                    roomId = a.RoomId.ToString(),
                    roomTitle = a.Room.Title,
                    date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    time = a.AppointmentDate.ToString("HH:mm"),
                    status = a.Status.ToLower() // pending, accepted, declined
                })
                .ToListAsync();

            return Ok(apps);
        }
    }

    [HttpPost("appointments")]
    public async Task<IActionResult> CreateAppointment([FromBody] CreateAppointmentRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var customer = await _context.CustomerProfiles.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
        {
            return BadRequest(new { message = "Chỉ Người thuê mới có quyền đặt lịch hẹn." });
        }

        var roomExists = await _context.Rooms.AnyAsync(r => r.Id == request.RoomId);
        if (!roomExists) return NotFound(new { message = "Không tìm thấy phòng trọ tương ứng." });

        var appointment = new ViewingAppointment
        {
            Id = Guid.NewGuid(),
            CustomerId = userId,
            RoomId = request.RoomId,
            AppointmentDate = request.AppointmentDate.ToUniversalTime(),
            Notes = request.Notes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.ViewingAppointments.Add(appointment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tạo lịch hẹn xem phòng thành công!" });
    }

    [HttpPut("appointments/{id}/status")]
    public async Task<IActionResult> UpdateAppointmentStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var app = await _context.ViewingAppointments
            .Include(a => a.Room)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (app == null) return NotFound();

        // Chỉ chủ trọ của phòng này mới được duyệt status
        if (app.Room.LandlordId != userId)
        {
            return Forbid();
        }

        // Map status (accepted, declined)
        var normalizedStatus = request.Status.ToLower();
        if (normalizedStatus == "accepted" || normalizedStatus == "approved")
        {
            app.Status = "Accepted";
        }
        else if (normalizedStatus == "declined" || normalizedStatus == "rejected")
        {
            app.Status = "Declined";
        }
        else
        {
            app.Status = request.Status;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật trạng thái lịch hẹn thành công!" });
    }

    // ==========================================
    // Maintenance Tickets
    // ==========================================

    [HttpGet("tickets")]
    public async Task<IActionResult> GetTickets()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null) return NotFound();

        if (user.Role == UserRole.Landlord)
        {
            var tickets = await _context.MaintenanceTickets
                .Include(t => t.Room)
                .Include(t => t.Customer)
                .ThenInclude(c => c.User)
                .Where(t => t.Room.LandlordId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    id = t.Id.ToString(),
                    roomTitle = t.Room.Title,
                    issueType = t.IssueType,
                    description = t.Description,
                    status = t.Status.ToLower(), // pending, fixing, completed
                    createdAt = t.CreatedAt.ToString("yyyy-MM-dd"),
                    tenantName = t.Customer.User.FullName
                })
                .ToListAsync();

            return Ok(tickets);
        }
        else
        {
            var tickets = await _context.MaintenanceTickets
                .Include(t => t.Room)
                .Where(t => t.CustomerId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    id = t.Id.ToString(),
                    roomTitle = t.Room.Title,
                    issueType = t.IssueType,
                    description = t.Description,
                    status = t.Status.ToLower(), // pending, fixing, completed
                    createdAt = t.CreatedAt.ToString("yyyy-MM-dd")
                })
                .ToListAsync();

            return Ok(tickets);
        }
    }

    [HttpPost("tickets")]
    public async Task<IActionResult> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var customer = await _context.CustomerProfiles.FirstOrDefaultAsync(c => c.UserId == userId);
        if (customer == null)
        {
            return BadRequest(new { message = "Chỉ Người thuê mới có quyền gửi báo lỗi sửa chữa." });
        }

        var roomExists = await _context.Rooms.AnyAsync(r => r.Id == request.RoomId);
        if (!roomExists) return NotFound(new { message = "Không tìm thấy phòng trọ tương ứng." });

        var ticket = new MaintenanceTicket
        {
            Id = Guid.NewGuid(),
            CustomerId = userId,
            RoomId = request.RoomId,
            IssueType = request.IssueType,
            Description = request.Description,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.MaintenanceTickets.Add(ticket);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Gửi phiếu báo hỏng thành công!" });
    }

    [HttpPut("tickets/{id}/status")]
    public async Task<IActionResult> UpdateTicketStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var ticket = await _context.MaintenanceTickets
            .Include(t => t.Room)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null) return NotFound();

        // Chỉ chủ trọ của phòng này mới được sửa trạng thái sửa chữa
        if (ticket.Room.LandlordId != userId)
        {
            return Forbid();
        }

        var normalizedStatus = request.Status.ToLower();
        if (normalizedStatus == "fixing")
        {
            ticket.Status = "Fixing";
        }
        else if (normalizedStatus == "completed")
        {
            ticket.Status = "Completed";
        }
        else
        {
            ticket.Status = request.Status;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Cập nhật trạng thái sự cố thành công!" });
    }

    [HttpGet("saved")]
    public async Task<IActionResult> GetSavedRooms()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var saved = await _context.FavoriteRooms
            .Include(f => f.Room)
            .ThenInclude(r => r.Images)
            .Where(f => f.CustomerId == userId)
            .Select(f => new
            {
                id = f.Room.Id.ToString(),
                title = f.Room.Title,
                price = f.Room.Price,
                address = f.Room.Address,
                image = f.Room.Images.FirstOrDefault()?.ImageUrl ?? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80"
            })
            .ToListAsync();

        return Ok(saved);
    }

    [HttpDelete("saved/{roomId}")]
    public async Task<IActionResult> RemoveSavedRoom(Guid roomId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var fav = await _context.FavoriteRooms
            .FirstOrDefaultAsync(f => f.CustomerId == userId && f.RoomId == roomId);

        if (fav != null)
        {
            _context.FavoriteRooms.Remove(fav);
            await _context.SaveChangesAsync();
        }

        return Ok();
    }
}
