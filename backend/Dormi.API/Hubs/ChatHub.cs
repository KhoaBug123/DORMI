using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Dormi.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly DormiDbContext _context;

    public ChatHub(DormiDbContext context)
    {
        _context = context;
    }

    public async Task SendMessage(string receiverId, string message)
    {
        var senderIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(senderIdClaim) || !Guid.TryParse(senderIdClaim, out var senderId))
        {
            throw new HubException("Bạn chưa đăng nhập hoặc token không hợp lệ.");
        }

        if (!Guid.TryParse(receiverId, out var targetReceiverId))
        {
            throw new HubException("ID người nhận không hợp lệ.");
        }

        var dbMessage = new Message
        {
            Id = Guid.NewGuid(),
            SenderId = senderId,
            ReceiverId = targetReceiverId,
            Content = message,
            IsRead = false,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(dbMessage);
        await _context.SaveChangesAsync();

        // Gửi tin nhắn đến tất cả các connection của người nhận
        await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId.ToString(), message);
    }
}
