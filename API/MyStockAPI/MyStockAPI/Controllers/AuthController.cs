using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MySql.Data.MySqlClient;
using MyStockAPI.Helpers;
using MyStockAPI.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly IConfiguration _configuration;
        private readonly ActivityLogger _activity;

        public AuthController(DbHelper db, IConfiguration configuration, ActivityLogger activity)
        {
            _db = db;
            _configuration = configuration;
            _activity = activity;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and password are required." });

            User? user = null;
            string? passwordHash = null;

            using (var conn = _db.GetConnection())
            {
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    @"SELECT m_id, m_name, m_email, m_mobile, m_role, m_avatar, m_color, m_is_active, m_last_login_at, m_password_hash
                      FROM my_stocks.tbl_users
                      WHERE m_email = @email AND m_is_active = 1",
                    conn);
                cmd.Parameters.AddWithValue("@email", request.Email.Trim());

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    if (await reader.ReadAsync())
                    {
                        var colId          = reader.GetOrdinal("m_id");
                        var colName        = reader.GetOrdinal("m_name");
                        var colEmail       = reader.GetOrdinal("m_email");
                        var colMobile      = reader.GetOrdinal("m_mobile");
                        var colRole        = reader.GetOrdinal("m_role");
                        var colAvatar      = reader.GetOrdinal("m_avatar");
                        var colColor       = reader.GetOrdinal("m_color");
                        var colIsActive    = reader.GetOrdinal("m_is_active");
                        var colLastLoginAt = reader.GetOrdinal("m_last_login_at");
                        var colPassword    = reader.GetOrdinal("m_password_hash");

                        user = new User
                        {
                            Id          = reader.GetInt32(colId),
                            Name        = reader.GetString(colName),
                            Email       = reader.IsDBNull(colEmail) ? null : reader.GetString(colEmail),
                            Mobile      = reader.IsDBNull(colMobile) ? null : reader.GetString(colMobile),
                            Role        = reader.GetString(colRole),
                            Avatar      = reader.IsDBNull(colAvatar) ? null : reader.GetString(colAvatar),
                            Color       = reader.IsDBNull(colColor) ? null : reader.GetString(colColor),
                            IsActive    = reader.GetBoolean(colIsActive),
                            LastLoginAt = reader.IsDBNull(colLastLoginAt) ? null : reader.GetDateTime(colLastLoginAt),
                        };

                        passwordHash = reader.IsDBNull(colPassword) ? null : reader.GetString(colPassword);
                    }
                }
            }

            if (user == null || passwordHash == null || !BCrypt.Net.BCrypt.Verify(request.Password, passwordHash))
            {
                await _activity.LogAsync(request.Email?.Trim(), "login_failed", "Invalid email or password");
                return Unauthorized(new { message = "Invalid email or password." });
            }

            using (var conn = _db.GetConnection())
            {
                await conn.OpenAsync();
                var cmd = new MySqlCommand(
                    "UPDATE my_stocks.tbl_users SET m_last_login_at = NOW() WHERE m_id = @id",
                    conn);
                cmd.Parameters.AddWithValue("@id", user.Id);
                await cmd.ExecuteNonQueryAsync();
                user.LastLoginAt = DateTime.UtcNow;
            }

            await _activity.LogAsync(user.Email, "login_success", $"User {user.Name} logged in");

            var token = GenerateJwtToken(user);
            return Ok(new LoginResponse { Token = token, User = user });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _activity.LogAsync(User, "logout", "User logged out");
            return Ok(new { success = true });
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiresInHours = Convert.ToDouble(_configuration["Jwt:ExpiresInHours"] ?? "8");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiresInHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
