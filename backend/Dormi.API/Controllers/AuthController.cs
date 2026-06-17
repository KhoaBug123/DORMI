using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Dormi.Domain.Entities;
using Dormi.Domain.Enums;
using Dormi.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Dormi.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly DormiDbContext _context;
    private readonly IConfiguration _config;
    private readonly PasswordHasher<User> _passwordHasher;

    public AuthController(DormiDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
        _passwordHasher = new PasswordHasher<User>();
    }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "tenant"; // tenant, landlord
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
        {
            return BadRequest(new { message = "Email đã tồn tại trong hệ thống." });
        }

        var normalizedRole = request.Role.ToLower();
        UserRole dbRole = UserRole.Customer;
        if (normalizedRole == "landlord") dbRole = UserRole.Landlord;
        else if (normalizedRole == "admin") dbRole = UserRole.Admin;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            Role = dbRole,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        if (dbRole == UserRole.Customer)
        {
            user.CustomerProfile = new CustomerProfile
            {
                UserId = user.Id
            };
        }
        else if (dbRole == UserRole.Landlord)
        {
            user.LandlordProfile = new LandlordProfile
            {
                UserId = user.Id,
                IsVerified = false
            };
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = GenerateJwtToken(user);
        var frontendRole = MapRoleToFrontend(user.Role);

        return Ok(new
        {
            token,
            role = frontendRole,
            user = new
            {
                id = user.Id.ToString(),
                name = user.FullName,
                email = user.Email,
                isVerified = user.LandlordProfile?.IsVerified
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.LandlordProfile)
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Email hoặc mật khẩu không chính xác." });
        }

        var token = GenerateJwtToken(user);
        var frontendRole = MapRoleToFrontend(user.Role);

        return Ok(new
        {
            token,
            role = frontendRole,
            user = new
            {
                id = user.Id.ToString(),
                name = user.FullName,
                email = user.Email,
                isVerified = user.LandlordProfile?.IsVerified
            }
        });
    }

    [Authorize]
    [HttpPost("kyc")]
    public async Task<IActionResult> SubmitKyc(IFormFile cccdFront, IFormFile cccdBack, IFormFile selfie)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Vui lòng đăng nhập để thực hiện KYC." });
        }

        var landlordProfile = await _context.LandlordProfiles
            .FirstOrDefaultAsync(l => l.UserId == userId);

        if (landlordProfile == null)
        {
            return BadRequest(new { message = "Hồ sơ của bạn không thuộc vai trò Chủ trọ." });
        }

        // Mock OCR processing
        landlordProfile.IsVerified = true;
        landlordProfile.IdentificationDocumentsUrl = "https://mock-storage.dormi.vn/kyc/" + Guid.NewGuid() + ".jpg";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Xác thực eKYC thành công!",
            isVerified = true
        });
    }

    private string GenerateJwtToken(User user)
    {
        var secretKey = _config["Jwt:Key"] ?? "SuperSecretSecureDormiKey1234567890!!";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var issuer = _config["Jwt:Issuer"] ?? "DormiServer";
        var audience = _config["Jwt:Audience"] ?? "DormiClient";

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string MapRoleToFrontend(UserRole role)
    {
        return role switch
        {
            UserRole.Customer => "tenant",
            UserRole.Landlord => "landlord",
            UserRole.Admin => "admin",
            _ => "tenant"
        };
    }
}
