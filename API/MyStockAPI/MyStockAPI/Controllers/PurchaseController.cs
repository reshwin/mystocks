using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using MyStockAPI.Helpers;
using MyStockAPI.Models;

namespace MyStockAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseController : ControllerBase
    {
        private readonly DbHelper _db;
        private readonly ActivityLogger _activity;

        public PurchaseController(DbHelper db, ActivityLogger activity)
        {
            _db = db;
            _activity = activity;
        }

        [HttpGet]
        public async Task<IActionResult> GetPurchases(int page = 1, int pageSize = 10, string search = "")
        {
            var result = new List<PurchaseListItem>();
            int offset = (page - 1) * pageSize;

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                string query = @"
                    SELECT
                        p.m_id,
                        p.m_item        AS product_name,
                        s.m_name        AS supplier_name,
                        cnt.item_count  AS qty,
                        p.m_date        AS purchase_date,
                        p.m_date_received AS receive_date,
                        p.m_order_no,
                        p.m_id_supplier
                    FROM tbl_purchase p
                    JOIN tbl_suppliers s ON p.m_id_supplier = s.m_id
                    JOIN (
                        SELECT m_id_supplier, m_order_no, COUNT(*) AS item_count
                        FROM tbl_purchase
                        GROUP BY m_id_supplier, m_order_no
                    ) cnt ON cnt.m_id_supplier = p.m_id_supplier
                         AND cnt.m_order_no    = p.m_order_no";

                if (!string.IsNullOrEmpty(search))
                {
                    query += @"
                    WHERE
                        s.m_name LIKE @search OR
                        p.m_item LIKE @search OR
                        CAST(p.m_order_no AS CHAR) LIKE @search";
                }

                query += @"
                    GROUP BY p.m_id_supplier, p.m_order_no
                    ORDER BY MAX(p.m_date) DESC
                    LIMIT @offset, @pageSize";

                var cmd = new MySqlCommand(query, conn);
                if (!string.IsNullOrEmpty(search))
                    cmd.Parameters.AddWithValue("@search", $"%{search}%");
                cmd.Parameters.AddWithValue("@offset", offset);
                cmd.Parameters.AddWithValue("@pageSize", pageSize);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var colId           = reader.GetOrdinal("m_id");
                    var colOrderNo      = reader.GetOrdinal("m_order_no");
                    var colProductName  = reader.GetOrdinal("product_name");
                    var colSupplierName = reader.GetOrdinal("supplier_name");
                    var colSupplierId   = reader.GetOrdinal("m_id_supplier");
                    var colQty          = reader.GetOrdinal("qty");
                    var colDate         = reader.GetOrdinal("purchase_date");
                    var colDateReceived = reader.GetOrdinal("receive_date");

                    while (await reader.ReadAsync())
                    {
                        result.Add(new PurchaseListItem
                        {
                            Id           = reader.GetInt32(colId),
                            OrderNo      = reader.IsDBNull(colOrderNo)      ? null : reader.GetString(colOrderNo),
                            Product      = reader.IsDBNull(colProductName)  ? null : reader.GetString(colProductName),
                            Supplier     = reader.IsDBNull(colSupplierName) ? null : reader.GetString(colSupplierName),
                            SupplierId   = reader.IsDBNull(colSupplierId)   ? null : reader.GetInt32(colSupplierId),
                            Quantity     = reader.IsDBNull(colQty)          ? 0    : reader.GetInt32(colQty),
                            Date         = reader.IsDBNull(colDate)         ? null : reader.GetDateTime(colDate),
                            DateReceived = reader.IsDBNull(colDateReceived) ? null : reader.GetDateTime(colDateReceived),
                        });
                    }
                }

                string countQuery = @"
                    SELECT COUNT(*)
                    FROM (
                        SELECT 1
                        FROM tbl_purchase p
                        JOIN tbl_suppliers s ON p.m_id_supplier = s.m_id";

                if (!string.IsNullOrEmpty(search))
                {
                    countQuery += @"
                        WHERE
                            s.m_name LIKE @search OR
                            p.m_item LIKE @search OR
                            CAST(p.m_order_no AS CHAR) LIKE @search";
                }

                countQuery += @"
                        GROUP BY p.m_id_supplier, p.m_order_no
                    ) AS grouped";

                var countCmd = new MySqlCommand(countQuery, conn);
                if (!string.IsNullOrEmpty(search))
                    countCmd.Parameters.AddWithValue("@search", $"%{search}%");

                var total = Convert.ToInt32(await countCmd.ExecuteScalarAsync());

                return Ok(new { data = result, total, page, pageSize });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetOrderItems(int supplierId, string orderNo)
        {
            var result = new List<PurchaseOrderItem>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    SELECT p.m_item, p.m_qty, pr.m_rack_location, p.m_description, p.m_buy_link
                    FROM tbl_purchase p
                    LEFT JOIN tbl_products pr ON p.m_item = pr.m_name
                    WHERE p.m_id_supplier = @supplierId AND p.m_order_no = @orderNo",
                    conn);

                cmd.Parameters.AddWithValue("@supplierId", supplierId);
                cmd.Parameters.AddWithValue("@orderNo", orderNo);

                using var reader = await cmd.ExecuteReaderAsync();

                var colItem = reader.GetOrdinal("m_item");
                var colRack = reader.GetOrdinal("m_rack_location");
                var colDesc = reader.GetOrdinal("m_description");
                var colLink = reader.GetOrdinal("m_buy_link");
                var colQty  = reader.GetOrdinal("m_qty");

                while (await reader.ReadAsync())
                {
                    result.Add(new PurchaseOrderItem
                    {
                        Item        = reader.IsDBNull(colItem) ? null : reader.GetString(colItem),
                        Rack        = reader.IsDBNull(colRack) ? null : reader.GetString(colRack),
                        Description = reader.IsDBNull(colDesc) ? null : reader.GetString(colDesc),
                        Link        = reader.IsDBNull(colLink) ? null : reader.GetString(colLink),
                        Qty         = reader.IsDBNull(colQty)  ? 0    : reader.GetDouble(colQty),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] PurchaseCreateRequest request)
        {
            if (request == null || request.items == null || request.items.Count == 0)
                return BadRequest("Invalid data");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                using var tran = await conn.BeginTransactionAsync();

                foreach (var item in request.items)
                {
                    var cmd = new MySqlCommand(@"
                        INSERT INTO tbl_purchase
                            (m_id_supplier, m_order_no, m_slno, m_date, m_date_received, m_item, m_qty, m_rate, m_gst, m_amount)
                        VALUES
                            (@m_id_supplier, @m_order_no, @m_slno, @m_date, @m_date_received, @m_item, @m_qty, @m_rate, @m_gst, @m_amount)",
                        conn, (MySqlTransaction)tran);

                    cmd.Parameters.AddWithValue("@m_id_supplier",   request.m_id_supplier);
                    cmd.Parameters.AddWithValue("@m_order_no",      request.m_order_no ?? "");
                    cmd.Parameters.AddWithValue("@m_slno",          item.m_slno);
                    cmd.Parameters.AddWithValue("@m_date",          request.m_date);
                    cmd.Parameters.AddWithValue("@m_date_received", request.m_date_received);
                    cmd.Parameters.AddWithValue("@m_item",          item.m_item ?? "");
                    cmd.Parameters.AddWithValue("@m_qty",           item.m_qty);
                    cmd.Parameters.AddWithValue("@m_rate",          item.m_rate);
                    cmd.Parameters.AddWithValue("@m_gst",           item.m_gst);
                    cmd.Parameters.AddWithValue("@m_amount",        item.m_amount);

                    await cmd.ExecuteNonQueryAsync();
                }

                await tran.CommitAsync();

                await _activity.LogAsync(User, "purchase_create",
                    $"Order '{request.m_order_no}' supplier #{request.m_id_supplier} ({request.items.Count} items)");
                return Ok(new { success = true, message = "Purchase saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("purchasebyid")]
        public async Task<IActionResult> GetPurchaseById(int m_id)
        {
            if (m_id == 0)
                return BadRequest("Request is empty");

            var obj = new PurchaseCreateRequest();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    SELECT m_id_supplier, m_order_no, m_date, m_date_received
                    FROM tbl_purchase
                    WHERE m_id = @m_id",
                    conn);
                cmd.Parameters.AddWithValue("@m_id", m_id);

                using var reader = await cmd.ExecuteReaderAsync();

                var colSupplierId   = reader.GetOrdinal("m_id_supplier");
                var colOrderNo      = reader.GetOrdinal("m_order_no");
                var colDate         = reader.GetOrdinal("m_date");
                var colDateReceived = reader.GetOrdinal("m_date_received");

                if (await reader.ReadAsync())
                {
                    obj.m_id_supplier   = reader.IsDBNull(colSupplierId)   ? 0    : reader.GetInt32(colSupplierId);
                    obj.m_order_no      = reader.IsDBNull(colOrderNo)      ? ""   : reader.GetString(colOrderNo);
                    obj.m_date          = reader.IsDBNull(colDate)         ? null : reader.GetDateTime(colDate);
                    obj.m_date_received = reader.IsDBNull(colDateReceived) ? null : reader.GetDateTime(colDateReceived);
                }

                await reader.CloseAsync();

                if (obj.m_id_supplier == 0 || string.IsNullOrEmpty(obj.m_order_no))
                    return BadRequest("Invalid request");

                var cmd2 = new MySqlCommand(@"
                    SELECT m_slno, m_item, m_qty, m_rate, m_gst, m_amount
                    FROM tbl_purchase
                    WHERE m_id_supplier = @m_id_supplier AND m_order_no = @m_order_no",
                    conn);
                cmd2.Parameters.AddWithValue("@m_id_supplier", obj.m_id_supplier);
                cmd2.Parameters.AddWithValue("@m_order_no",    obj.m_order_no);

                using var reader2 = await cmd2.ExecuteReaderAsync();

                var colSlno   = reader2.GetOrdinal("m_slno");
                var colItem   = reader2.GetOrdinal("m_item");
                var colQty    = reader2.GetOrdinal("m_qty");
                var colRate   = reader2.GetOrdinal("m_rate");
                var colGst    = reader2.GetOrdinal("m_gst");
                var colAmount = reader2.GetOrdinal("m_amount");

                while (await reader2.ReadAsync())
                {
                    obj.items.Add(new PurchaseItemRequest
                    {
                        m_slno   = reader2.IsDBNull(colSlno)   ? 0    : reader2.GetInt32(colSlno),
                        m_item   = reader2.IsDBNull(colItem)   ? null : reader2.GetString(colItem),
                        m_qty    = reader2.IsDBNull(colQty)    ? 0    : reader2.GetDouble(colQty),
                        m_rate   = reader2.IsDBNull(colRate)   ? 0    : reader2.GetDouble(colRate),
                        m_gst    = reader2.IsDBNull(colGst)    ? 0    : reader2.GetDouble(colGst),
                        m_amount = reader2.IsDBNull(colAmount) ? 0    : reader2.GetDouble(colAmount),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(obj);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(
                    "DELETE FROM tbl_purchase WHERE m_id = @id", conn);
                cmd.Parameters.AddWithValue("@id", id);

                var rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0)
                    return NotFound();

                await _activity.LogAsync(User, "purchase_delete", $"Deleted purchase row #{id}");
                return Ok(new { success = true, message = "Purchase record deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
