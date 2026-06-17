using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Helpers;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly DbHelper _db;

        public ProjectsController(DbHelper db)
        {
            _db = db;
        }

        // GET /api/projects/items — predefined projects for dropdowns
        [HttpGet("items")]
        public async Task<IActionResult> GetAll()
        {
            var list = new List<object>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "SELECT m_id, m_name FROM tbl_projects ORDER BY m_name ASC", conn);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId   = reader.GetOrdinal("m_id");
                var colName = reader.GetOrdinal("m_name");

                while (await reader.ReadAsync())
                {
                    list.Add(new
                    {
                        id   = reader.GetInt32(colId),
                        name = reader.IsDBNull(colName) ? null : reader.GetString(colName),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(list);
        }
    }
}
