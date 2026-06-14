using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyStockAPI.DTOs.Stock;
using MyStockAPI.Helpers;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/stock")]
    public class StockController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly ActivityLogger _activity;

        public StockController(DbHelper db, ActivityLogger activity)
        {
            _db = db;
            _activity = activity;
        }

        // GET /api/stock/movements?page=1&pageSize=20&productId=5
        [HttpGet("movements")]
        public async Task<IActionResult> GetMovements(int page = 1, int pageSize = 20, int? productId = null)
        {
            int offset = (page - 1) * pageSize;

            const string dataSql = @"
                SELECT
                    sm.m_id          AS Id,
                    sm.m_product_id  AS ProductId,
                    p.m_name         AS ProductName,
                    sm.m_type        AS Type,
                    sm.m_direction   AS Direction,
                    sm.m_qty         AS Qty,
                    sm.m_purchase_id AS PurchaseId,
                    sm.m_project     AS Project,
                    sm.m_notes       AS Notes,
                    sm.m_user_id     AS UserId,
                    u.m_name         AS UserName,
                    sm.m_date        AS Date,
                    sm.m_created_at  AS CreatedAt
                FROM tbl_stock_movements sm
                JOIN tbl_products p ON sm.m_product_id = p.m_id
                JOIN tbl_users    u ON sm.m_user_id    = u.m_id
                WHERE (@productId IS NULL OR sm.m_product_id = @productId)
                ORDER BY sm.m_date DESC, sm.m_id DESC
                LIMIT @offset, @pageSize";

            const string countSql = @"
                SELECT COUNT(*) FROM tbl_stock_movements
                WHERE (@productId IS NULL OR m_product_id = @productId)";

            try
            {
                using var conn = _db.GetConnection();
                var rows = await conn.QueryAsync<StockMovementDto>(dataSql, new { offset, pageSize, productId });
                var total = await conn.ExecuteScalarAsync<int>(countSql, new { productId });
                return Ok(new { data = rows, total, page, pageSize });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // POST /api/stock/movements
        [Authorize(Roles = "admin,manager")]
        [HttpPost("movements")]
        public async Task<IActionResult> CreateMovement([FromBody] CreateStockMovementRequest req)
        {
            const string sql = @"
                INSERT INTO tbl_stock_movements
                    (m_product_id, m_type, m_direction, m_qty, m_date,
                     m_purchase_id, m_project, m_notes, m_user_id)
                VALUES
                    (@M_product_id, @M_type, @M_direction, @M_qty, @M_date,
                     @M_purchase_id, @M_project, @M_notes, @M_user_id);
                SELECT LAST_INSERT_ID();";

            try
            {
                using var conn = _db.GetConnection();
                var newId = await conn.ExecuteScalarAsync<int>(sql, req);

                await _activity.LogAsync(User, "stock_movement_create",
                    $"{req.M_direction} {req.M_qty} of product #{req.M_product_id} ({req.M_type})");
                return StatusCode(201, new { id = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET /api/stock/balance
        [HttpGet("balance")]
        public async Task<IActionResult> GetBalance()
        {
            const string sql = @"
                SELECT
                    p.m_id   AS ProductId,
                    p.m_name AS ProductName,
                    p.m_rack_location AS RackLocation,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_type = 'opening'
                    ), 0) AS Opening,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_purchase
                        WHERE m_item = p.m_name
                          AND m_date_received IS NOT NULL
                    ), 0) AS Purchased,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'in'
                          AND m_type = 'return'
                    ), 0) AS Returned,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'out'
                          AND m_type = 'consumption'
                    ), 0) AS Consumed,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'out'
                          AND m_type = 'writeoff'
                    ), 0) AS WriteOff,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_purchase
                        WHERE m_item = p.m_name
                          AND m_date_received IS NULL
                    ), 0) AS Pending

                FROM tbl_products p
                ORDER BY p.m_name ASC";

            try
            {
                using var conn = _db.GetConnection();
                var rows = await conn.QueryAsync<StockBalanceDto>(sql);
                return Ok(rows);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        // GET /api/stock/balance/{id}
        [HttpGet("balance/{id:int}")]
        public async Task<IActionResult> GetBalanceById(int id)
        {
            const string sql = @"
                SELECT
                    p.m_id   AS ProductId,
                    p.m_name AS ProductName,
                    p.m_rack_location AS RackLocation,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_type = 'opening'
                    ), 0) AS Opening,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_purchase
                        WHERE m_item = p.m_name
                          AND m_date_received IS NOT NULL
                    ), 0) AS Purchased,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'in'
                          AND m_type = 'return'
                    ), 0) AS Returned,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'out'
                          AND m_type = 'consumption'
                    ), 0) AS Consumed,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_stock_movements
                        WHERE m_product_id = p.m_id
                          AND m_direction = 'out'
                          AND m_type = 'writeoff'
                    ), 0) AS WriteOff,

                    COALESCE((
                        SELECT SUM(m_qty) FROM tbl_purchase
                        WHERE m_item = p.m_name
                          AND m_date_received IS NULL
                    ), 0) AS Pending

                FROM tbl_products p
                WHERE p.m_id = @id";

            try
            {
                using var conn = _db.GetConnection();
                var row = await conn.QuerySingleOrDefaultAsync<StockBalanceDto>(sql, new { id });
                return row is null ? NotFound() : Ok(row);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
