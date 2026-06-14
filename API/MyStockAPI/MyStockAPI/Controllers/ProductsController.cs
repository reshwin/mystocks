using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Helpers;
using MyStockAPI.Models;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly ActivityLogger _activity;

        public ProductsController(DbHelper db, ActivityLogger activity)
        {
            _db = db;
            _activity = activity;
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetProducts()
        {
            var products = new List<Product>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    SELECT p.m_id, p.m_name, p.m_id_type, pt.m_type, pt.m_type_sub,
                           p.m_pins, p.m_rack_location, p.m_link, p.m_description,
                           SUM(pur.m_qty) AS m_stock_Purchased,
                           COALESCE((
                               SELECT SUM(m_qty) FROM tbl_stock_movements
                               WHERE m_product_id = p.m_id AND m_direction = 'in'
                           ), 0) as s_stock_in, 
                           COALESCE((
                               SELECT SUM(m_qty) FROM tbl_stock_movements
                               WHERE m_product_id = p.m_id AND m_direction = 'out'
                           ), 0) AS s_stock_out
                    FROM tbl_products p
                    LEFT JOIN tbl_product_types pt  ON p.m_id_type = pt.m_id
                    LEFT JOIN tbl_purchase      pur ON pur.m_item   = p.m_name
                                                   AND pur.m_date_received IS NOT NULL
                    GROUP BY p.m_id, p.m_name, p.m_id_type, pt.m_type, pt.m_type_sub,
                             p.m_pins, p.m_rack_location, p.m_link, p.m_description
                    ORDER BY p.m_name ASC",
                    conn);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId = reader.GetOrdinal("m_id");
                var colName = reader.GetOrdinal("m_name");
                var colTypeId = reader.GetOrdinal("m_id_type");
                var colType = reader.GetOrdinal("m_type");
                var colTypeSub = reader.GetOrdinal("m_type_sub");
                var colPins = reader.GetOrdinal("m_pins");
                var colRackLocation = reader.GetOrdinal("m_rack_location");
                var colLink = reader.GetOrdinal("m_link");
                var colDescription = reader.GetOrdinal("m_description");
                var colstock_Purchased = reader.GetOrdinal("m_stock_Purchased");
                var colstock_in = reader.GetOrdinal("s_stock_in");
                var colstock_out = reader.GetOrdinal("s_stock_out");

                while (await reader.ReadAsync())
                {
                    products.Add(new Product
                    {
                        Id = reader.GetInt32(colId),
                        Name = reader.IsDBNull(colName) ? null : reader.GetString(colName),
                        TypeId = reader.IsDBNull(colTypeId) ? null : reader.GetInt32(colTypeId),
                        Type = reader.IsDBNull(colType) ? null : reader.GetString(colType),
                        TypeSub = reader.IsDBNull(colTypeSub) ? null : reader.GetString(colTypeSub),
                        Pins = reader.IsDBNull(colPins) ? null : reader.GetInt32(colPins),
                        RackLocation = reader.IsDBNull(colRackLocation) ? null : reader.GetString(colRackLocation),
                        Link = reader.IsDBNull(colLink) ? null : reader.GetString(colLink),
                        Description = reader.IsDBNull(colDescription) ? null : reader.GetString(colDescription),
                        StockPurchased = reader.IsDBNull(colstock_Purchased) ? null : reader.GetDouble(colstock_Purchased),
                        StockIn = reader.IsDBNull(colstock_in) ? null : reader.GetDouble(colstock_in),
                        StockOut = reader.IsDBNull(colstock_out) ? null : reader.GetDouble(colstock_out)

                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    SELECT p.m_id, p.m_name, p.m_id_type, pt.m_type, pt.m_type_sub,
                           p.m_pins, p.m_rack_location, p.m_link, p.m_description
                    FROM tbl_products p
                    LEFT JOIN tbl_product_types pt ON p.m_id_type = pt.m_id
                    WHERE p.m_id = @id",
                    conn);
                cmd.Parameters.AddWithValue("@id", id);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId = reader.GetOrdinal("m_id");
                var colName = reader.GetOrdinal("m_name");
                var colTypeId = reader.GetOrdinal("m_id_type");
                var colType = reader.GetOrdinal("m_type");
                var colTypeSub = reader.GetOrdinal("m_type_sub");
                var colPins = reader.GetOrdinal("m_pins");
                var colRackLocation = reader.GetOrdinal("m_rack_location");
                var colLink = reader.GetOrdinal("m_link");
                var colDescription = reader.GetOrdinal("m_description");

                if (!await reader.ReadAsync())
                    return NotFound();

                return Ok(new Product
                {
                    Id = reader.GetInt32(colId),
                    Name = reader.IsDBNull(colName) ? null : reader.GetString(colName),
                    TypeId = reader.IsDBNull(colTypeId) ? null : reader.GetInt32(colTypeId),
                    Type = reader.IsDBNull(colType) ? null : reader.GetString(colType),
                    TypeSub = reader.IsDBNull(colTypeSub) ? null : reader.GetString(colTypeSub),
                    Pins = reader.IsDBNull(colPins) ? null : reader.GetInt32(colPins),
                    RackLocation = reader.IsDBNull(colRackLocation) ? null : reader.GetString(colRackLocation),
                    Link = reader.IsDBNull(colLink) ? null : reader.GetString(colLink),
                    Description = reader.IsDBNull(colDescription) ? null : reader.GetString(colDescription),
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] ProductRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_name))
                return BadRequest("Name is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    INSERT INTO tbl_products (m_name, m_id_type, m_pins, m_rack_location, m_link, m_description)
                    VALUES (@name, @id_type, @pins, @rack_location, @link, @description)",
                    conn);

                cmd.Parameters.AddWithValue("@name", request.m_name);
                cmd.Parameters.AddWithValue("@id_type", (object?)request.m_id_type ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pins", (object?)request.m_pins ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@rack_location", (object?)request.m_rack_location ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@link", (object?)request.m_link ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@description", (object?)request.m_description ?? DBNull.Value);

                await cmd.ExecuteNonQueryAsync();

                await _activity.LogAsync(User, "product_create", $"Created product '{request.m_name}'");
                return Ok(new { success = true, message = "Product created successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ProductRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.m_name))
                return BadRequest("Name is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    UPDATE tbl_products
                    SET m_name = @name, m_id_type = @id_type, m_pins = @pins,
                        m_rack_location = @rack_location, m_link = @link, m_description = @description
                    WHERE m_id = @id",
                    conn);

                cmd.Parameters.AddWithValue("@name", request.m_name);
                cmd.Parameters.AddWithValue("@id_type", (object?)request.m_id_type ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@pins", (object?)request.m_pins ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@rack_location", (object?)request.m_rack_location ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@link", (object?)request.m_link ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@description", (object?)request.m_description ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "product_update", $"Updated product #{id} '{request.m_name}'");
                return Ok(new { success = true, message = "Product updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPatch("{id}/rack")]
        public async Task<IActionResult> UpdateRackLocation(int id, [FromBody] RackLocationRequest request)
        {
            if (request == null)
                return BadRequest("Request body is required");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "UPDATE tbl_products SET m_rack_location = @rack_location WHERE m_id = @id",
                    conn);
                cmd.Parameters.AddWithValue("@rack_location", (object?)request.RackLocation ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "product_rack_update", $"Product #{id} rack set to '{request.RackLocation}'");
                return Ok(new { success = true, message = "Rack location updated successfully" });
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
                    "DELETE FROM tbl_products WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "product_delete", $"Deleted product #{id}");
                return Ok(new { success = true, message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
