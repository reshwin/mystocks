using MySql.Data.MySqlClient;
using System.Security.Claims;

namespace MyStockAPI.Helpers
{
    public class ActivityLogger
    {
        private readonly DbHelper _db;
        private readonly ILogger<ActivityLogger> _logger;

        public ActivityLogger(DbHelper db, ILogger<ActivityLogger> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task LogAsync(string? email, string action, string? message = null)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "INSERT INTO tbl_users_activity (m_time, m_email, m_action, m_message) " +
                    "VALUES (NOW(), @email, @action, @message)",
                    conn);
                cmd.Parameters.AddWithValue("@email",   (object?)Truncate(email,   45) ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@action",  (object?)Truncate(action,  45) ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@message", (object?)Truncate(message, 100) ?? DBNull.Value);

                await cmd.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to write activity log: {Action}", action);
            }
        }

        public Task LogAsync(ClaimsPrincipal? user, string action, string? message = null)
            => LogAsync(GetEmail(user), action, message);

        private static string? GetEmail(ClaimsPrincipal? user)
        {
            if (user == null) return null;
            return user.FindFirst(ClaimTypes.Email)?.Value
                ?? user.FindFirst("email")?.Value;
        }

        private static string? Truncate(string? value, int max)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length <= max ? value : value.Substring(0, max);
        }
    }
}
