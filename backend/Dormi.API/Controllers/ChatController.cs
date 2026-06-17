using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Dormi.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly DormiDbContext _context;

    public ChatController(DormiDbContext context)
    {
        _context = context;
    }

    [HttpGet("contacts")]
    public async Task<IActionResult> GetContacts()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        // Tìm danh sách ID người đã nhắn tin qua lại
        var sentUserIds = await _context.Messages
            .Where(m => m.SenderId == userId)
            .Select(m => m.ReceiverId)
            .Distinct()
            .ToListAsync();

        var receivedUserIds = await _context.Messages
            .Where(m => m.ReceiverId == userId)
            .Select(m => m.SenderId)
            .Distinct()
            .ToListAsync();

        var contactIds = sentUserIds.Union(receivedUserIds).Distinct().ToList();

        // Nếu danh sách rỗng, ta có thể tự động thêm một số contact mẫu (các chủ nhà) để dễ trải nghiệm
        if (contactIds.Count == 0)
        {
            var landlords = await _context.LandlordProfiles
                .Take(5)
                .Select(l => l.UserId)
                .ToListAsync();
            contactIds.AddRange(landlords);
            contactIds = contactIds.Distinct().ToList();
        }

        var users = await _context.Users
            .Where(u => contactIds.Contains(u.Id) && u.Id != userId)
            .ToListAsync();

        var result = new List<object>();

        foreach (var u in users)
        {
            var lastMessage = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == u.Id) || (m.SenderId == u.Id && m.ReceiverId == userId))
                .OrderByDescending(m => m.SentAt)
                .Select(m => m.Content)
                .FirstOrDefaultAsync();

            result.Add(new
            {
                id = u.Id.ToString(),
                name = u.FullName,
                avatar = u.AvatarUrl ?? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
                lastMessage = lastMessage ?? "Bắt đầu cuộc hội thoại...",
                role = u.Role.ToString().ToLower() == "landlord" ? "landlord" : "roommate"
            });
        }

        return Ok(result);
    }

    [HttpGet("messages/{contactId}")]
    public async Task<IActionResult> GetChatHistory(Guid contactId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var messages = await _context.Messages
            .Include(m => m.Sender)
            .Where(m => (m.SenderId == userId && m.ReceiverId == contactId) || (m.SenderId == contactId && m.ReceiverId == userId))
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        var result = messages.Select(m => new
        {
            id = m.Id.ToString(),
            senderId = m.SenderId.ToString(),
            senderName = m.Sender.FullName,
            content = m.Content,
            timestamp = m.SentAt.ToLocalTime().ToString("HH:mm")
        });

        return Ok(result);
    }
}
