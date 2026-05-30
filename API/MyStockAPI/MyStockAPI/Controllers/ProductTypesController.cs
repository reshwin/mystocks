using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Models;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductTypesController : ControllerBase
    {
        private readonly DbHelper _db;

        public ProductTypesController(DbHelper db)
        {
            _db = db;
        }

        // All rows — used for admin/management of the lookup table
        [HttpGet("items")]
        public async Task<IActionResult> GetAll()
        {
            var list = new List<ProductType>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_type, m_type_sub FROM tbl_product_types ORDER BY m_type ASC, m_type_sub ASC",
                    conn);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId      = reader.GetOrdinal("m_id");
                var colType    = reader.GetOrdinal("m_type");
                var colTypeSub = reader.GetOrdinal("m_type_sub");

                while (await reader.ReadAsync())
                {
                    list.Add(new ProductType
                    {
                        Id      = reader.GetInt32(colId),
                        Type    = reader.IsDBNull(colType)    ? null : reader.GetString(colType),
                        TypeSub = reader.IsDBNull(colTypeSub) ? null : reader.GetString(colTypeSub),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(list);
        }

        // Distinct type names only — populates the first (Type) dropdown
        [HttpGet("types")]
        public async Task<IActionResult> GetTypes()
        {
            var types = new List<string>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT DISTINCT m_type FROM tbl_product_types ORDER BY m_type ASC",
                    conn);

                using var reader = await cmd.ExecuteReaderAsync();

                var colType = reader.GetOrdinal("m_type");

                while (await reader.ReadAsync())
                {
                    if (!reader.IsDBNull(colType))
                        types.Add(reader.GetString(colType));
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(types);
        }

        // Subtypes for a given type — populates the second (SubType) dropdown
        [HttpGet("subtypes/{type}")]
        public async Task<IActionResult> GetSubTypes(string type)
        {
            var list = new List<ProductType>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_type, m_type_sub FROM tbl_product_types WHERE m_type = @type AND m_type_sub IS NOT NULL ORDER BY m_type_sub ASC",
                    conn);
                cmd.Parameters.AddWithValue("@type", type);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId      = reader.GetOrdinal("m_id");
                var colType    = reader.GetOrdinal("m_type");
                var colTypeSub = reader.GetOrdinal("m_type_sub");

                while (await reader.ReadAsync())
                {
                    list.Add(new ProductType
                    {
                        Id      = reader.GetInt32(colId),
                        Type    = reader.GetString(colType),
                        TypeSub = reader.GetString(colTypeSub),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(list);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] ProductTypeRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_type))
                return BadRequest("Type is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "INSERT INTO tbl_product_types (m_type, m_type_sub) VALUES (@type, @type_sub)",
                    conn);
                cmd.Parameters.AddWithValue("@type",     request.m_type);
                cmd.Parameters.AddWithValue("@type_sub", (object?)request.m_type_sub ?? DBNull.Value);

                await cmd.ExecuteNonQueryAsync();

                return Ok(new { success = true, message = "Type created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductTypeRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_type))
                return BadRequest("Type is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "UPDATE tbl_product_types SET m_type = @type, m_type_sub = @type_sub WHERE m_id = @id",
                    conn);
                cmd.Parameters.AddWithValue("@type",     request.m_type);
                cmd.Parameters.AddWithValue("@type_sub", (object?)request.m_type_sub ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@id",       id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                return Ok(new { success = true, message = "Type updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "DELETE FROM tbl_product_types WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                return Ok(new { success = true, message = "Type deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
