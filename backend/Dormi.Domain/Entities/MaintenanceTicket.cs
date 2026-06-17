using System;

namespace Dormi.Domain.Entities;

public class MaintenanceTicket
{
    public Guid Id { get; set; }
    
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;
    
    public Guid CustomerId { get; set; }
    public CustomerProfile Customer { get; set; } = null!;

    public string IssueType { get; set; } = string.Empty; // Điện nước, Đồ gia dụng, Khóa cửa, Khác
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Fixing, Completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
