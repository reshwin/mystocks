using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Helpers;
using MyStockAPI.Models;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SuppliersController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly ActivityLogger _activity;

        public SuppliersController(DbHelper db, ActivityLogger activity)
        {
            _db = db;
            _activity = activity;
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetSuppliers()
        {
            var suppliers = new List<Supplier>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_name, m_web FROM tbl_suppliers ORDER BY m_name ASC", conn);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId   = reader.GetOrdinal("m_id");
                var colName = reader.GetOrdinal("m_name");
                var colWeb  = reader.GetOrdinal("m_web");

                while (await reader.ReadAsync())
                {
                    suppliers.Add(new Supplier
                    {
                        Id   = reader.GetInt32(colId),
                        Name = reader.IsDBNull(colName) ? null : reader.GetString(colName),
                        Web  = reader.IsDBNull(colWeb)  ? null : reader.GetString(colWeb),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(suppliers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSupplier(int id)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_name, m_web FROM tbl_suppliers WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId   = reader.GetOrdinal("m_id");
                var colName = reader.GetOrdinal("m_name");
                var colWeb  = reader.GetOrdinal("m_web");

                if (!await reader.ReadAsync())
                    return NotFound();

                return Ok(new Supplier
                {
                    Id   = reader.GetInt32(colId),
                    Name = reader.IsDBNull(colName) ? null : reader.GetString(colName),
                    Web  = reader.IsDBNull(colWeb)  ? null : reader.GetString(colWeb),
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] SupplierRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_name))
                return BadRequest("Name is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "INSERT INTO tbl_suppliers (m_name, m_web) VALUES (@name, @web)", conn);
                cmd.Parameters.AddWithValue("@name", request.m_name);
                cmd.Parameters.AddWithValue("@web", (object?)request.m_web ?? DBNull.Value);

                await cmd.ExecuteNonQueryAsync();

                await _activity.LogAsync(User, "supplier_create", $"Created supplier '{request.m_name}'");
                return Ok(new { success = true, message = "Supplier created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_name))
                return BadRequest("Name is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "UPDATE tbl_suppliers SET m_name = @name, m_web = @web WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@name", request.m_name);
                cmd.Parameters.AddWithValue("@web", (object?)request.m_web ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "supplier_update", $"Updated supplier #{id} '{request.m_name}'");
                return Ok(new { success = true, message = "Supplier updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "DELETE FROM tbl_suppliers WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "supplier_delete", $"Deleted supplier #{id}");
                return Ok(new { success = true, message = "Supplier deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
