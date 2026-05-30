using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Models;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DbHelper _db;

        public UsersController(DbHelper db)
        {
            _db = db;
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetUsers()
        {
            var users = new List<User>();

            using (var conn = _db.GetConnection())
            {
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_name, m_email, m_mobile, m_role, m_avatar, m_color, m_is_active, m_last_login_at FROM my_stocks.tbl_users ORDER BY m_name ASC",
                    conn);

                using (var reader = await cmd.ExecuteReaderAsync())
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

                    while (await reader.ReadAsync())
                    {
                        users.Add(new User
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
                        });
                    }
                }
            }

            return Ok(users);
        }
    }
}
