using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.Geometries;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly DormiDbContext _context;

    public RoomsController(DormiDbContext context)
    {
        _context = context;
    }

    public class CreateRoomRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public double Area { get; set; }
        public string RoomType { get; set; } = "single"; // single, shared, apartment
        public string Utilities { get; set; } = string.Empty; // e.g. wifi,ac,parking,privateBath
        public string Description { get; set; } = string.Empty;
        public string? Virtual3DUrl { get; set; }
        public string? PrimaryImageUrl { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string University { get; set; } = "all";
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateRoom([FromBody] CreateRoomRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập để thực hiện chức năng này." });
        }

        var landlordProfile = await _context.LandlordProfiles
            .Include(l => l.User)
            .FirstOrDefaultAsync(l => l.UserId == userId);

        if (landlordProfile == null)
        {
            return BadRequest(new { message = "Chỉ có Chủ trọ mới có quyền đăng tin phòng." });
        }

        // Tự động sinh tọa độ khu vực Làng Đại học Thủ Đức nếu thiếu
        double lat = request.Latitude ?? (21.0062 + (Random.Shared.NextDouble() - 0.5) * 0.02); // default Hanoi/Bach Khoa if landlord not specified, or around user region
        double lng = request.Longitude ?? (105.8431 + (Random.Shared.NextDouble() - 0.5) * 0.02);

        var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
        var location = geometryFactory.CreatePoint(new Coordinate(lng, lat)); // Note: X = Longitude, Y = Latitude

        var room = new Room
        {
            Id = Guid.NewGuid(),
            LandlordId = landlordProfile.UserId,
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            Area = request.Area,
            Utilities = request.Utilities,
            RoomType = request.RoomType,
            Address = request.Address,
            Location = location,
            Virtual3DUrl = request.Virtual3DUrl,
            Status = RoomStatus.Available,
            CreatedAt = DateTime.UtcNow
        };

        // Thêm hình ảnh chính diện
        var primaryImage = new RoomImage
        {
            Id = Guid.NewGuid(),
            RoomId = room.Id,
            ImageUrl = string.IsNullOrEmpty(request.PrimaryImageUrl) 
                ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" 
                : request.PrimaryImageUrl,
            IsPrimary = true
        };
        room.Images.Add(primaryImage);

        _context.Rooms.Add(room);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Đăng tin phòng trọ thành công!",
            roomId = room.Id
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRoomDetails(Guid id)
    {
        var room = await _context.Rooms
            .Include(r => r.Images)
            .Include(r => r.Landlord)
            .ThenInclude(l => l.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (room == null)
        {
            return NotFound(new { message = "Không tìm thấy phòng trọ yêu cầu." });
        }

        var primaryImage = room.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
            ?? room.Images.FirstOrDefault()?.ImageUrl 
            ?? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80";

        var utilList = room.Utilities.Split(',', StringSplitOptions.RemoveEmptyEntries);

        return Ok(new
        {
            id = room.Id.ToString(),
            title = room.Title,
            description = room.Description,
            price = room.Price,
            area = room.Area,
            roomType = room.RoomType,
            address = room.Address,
            virtual3DUrl = room.Virtual3DUrl,
            status = room.Status.ToString(),
            createdAt = room.CreatedAt,
            image = primaryImage,
            lat = room.Location?.Y, // Y is Latitude
            lng = room.Location?.X, // X is Longitude
            amenities = new
            {
                wifi = utilList.Contains("wifi") || utilList.Contains("free wifi") || utilList.Contains("Wi-Fi Free"),
                ac = utilList.Contains("ac") || utilList.Contains("điều hòa") || utilList.Contains("Điều hòa (AC)"),
                parking = utilList.Contains("parking") || utilList.Contains("bãi đỗ xe") || utilList.Contains("Bãi đỗ xe"),
                privateBathroom = utilList.Contains("privateBath") || utilList.Contains("wc khép kín") || utilList.Contains("WC khép kín")
            },
            landlord = new
            {
                id = room.LandlordId.ToString(),
                name = room.Landlord.User.FullName,
                avatar = room.Landlord.User.AvatarUrl ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                isVerified = room.Landlord.IsVerified,
                phone = room.Landlord.PhoneNumber ?? "N/A"
            }
        });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchRooms(
        [FromQuery] double? lat, 
        [FromQuery] double? lng, 
        [FromQuery] double radius = 1000)
    {
        IQueryable<Room> query = _context.Rooms
            .Include(r => r.Images)
            .Include(r => r.Landlord)
            .ThenInclude(l => l.User);

        if (lat.HasValue && lng.HasValue)
        {
            var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
            var searchPoint = geometryFactory.CreatePoint(new Coordinate(lng.Value, lat.Value));

            // Query using PostGIS ST_DWithin (EF.Functions.IsWithinDistance calculates in meters with useSpheroid = true)
            query = query.Where(r => r.Location != null && EF.Functions.IsWithinDistance(r.Location, searchPoint, radius, true));
        }

        var rooms = await query.ToListAsync();

        var result = rooms.Select(room =>
        {
            var primaryImage = room.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl 
                ?? room.Images.FirstOrDefault()?.ImageUrl 
                ?? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80";

            var utilList = room.Utilities.Split(',', StringSplitOptions.RemoveEmptyEntries);

            // Calculate exact distance in meters if center point is provided
            double distanceMeters = 0;
            if (lat.HasValue && lng.HasValue && room.Location != null)
            {
                var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                var searchPoint = geometryFactory.CreatePoint(new Coordinate(lng.Value, lat.Value));
                distanceMeters = room.Location.Distance(searchPoint) * 111320; // Approximation of degrees to meters
            }

            return new
            {
                id = room.Id.ToString(),
                title = room.Title,
                address = room.Address,
                lat = room.Location?.Y, // Latitude
                lng = room.Location?.X, // Longitude
                price = room.Price,
                type = room.RoomType,
                distance = Math.Round(distanceMeters),
                isVerified = room.Landlord.IsVerified,
                image = primaryImage,
                amenities = new
                {
                    wifi = utilList.Contains("wifi") || utilList.Contains("free wifi") || utilList.Contains("Wi-Fi Free"),
                    ac = utilList.Contains("ac") || utilList.Contains("điều hòa") || utilList.Contains("Điều hòa (AC)"),
                    parking = utilList.Contains("parking") || utilList.Contains("bãi đỗ xe") || utilList.Contains("Bãi đỗ xe"),
                    privateBathroom = utilList.Contains("privateBath") || utilList.Contains("wc khép kín") || utilList.Contains("WC khép kín")
                },
                landlord = new
                {
                    name = room.Landlord.User.FullName
                }
            };
        });

        return Ok(result);
    }
}
