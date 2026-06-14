using Microsoft.AspNetCore.Authorization;
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
                    LEFT JOIN tbl_suppliers s ON p.m_id_supplier = s.m_id
                    JOIN (
                        SELECT m_id_supplier, m_order_no, COUNT(*) AS item_count
                        FROM tbl_purchase
                        GROUP BY m_id_supplier, m_order_no
                    ) cnt ON cnt.m_id_supplier <=> p.m_id_supplier
                         AND cnt.m_order_no    <=> p.m_order_no";

                if (!string.IsNullOrEmpty(search))
                {
                    query += @"
                    LEFT JOIN tbl_products      pr ON p.m_item     = pr.m_name
                    LEFT JOIN tbl_product_types pt ON pr.m_id_type = pt.m_id
                    WHERE
                        s.m_name LIKE @search OR
                        p.m_item LIKE @search OR
                        pr.m_name LIKE @search OR
                        pt.m_type LIKE @search OR
                        pt.m_type_sub LIKE @search OR
                        p.m_description LIKE @search OR
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
                //Console.WriteLine(query);
                System.Diagnostics.Debug.WriteLine(query);
                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    var colId = reader.GetOrdinal("m_id");
                    var colOrderNo = reader.GetOrdinal("m_order_no");
                    var colProductName = reader.GetOrdinal("product_name");
                    var colSupplierName = reader.GetOrdinal("supplier_name");
                    var colSupplierId = reader.GetOrdinal("m_id_supplier");
                    var colQty = reader.GetOrdinal("qty");
                    var colDate = reader.GetOrdinal("purchase_date");
                    var colDateReceived = reader.GetOrdinal("receive_date");

                    while (await reader.ReadAsync())
                    {
                        result.Add(new PurchaseListItem
                        {
                            Id = reader.GetInt32(colId),
                            OrderNo = reader.IsDBNull(colOrderNo) ? null : reader.GetString(colOrderNo),
                            Product = reader.IsDBNull(colProductName) ? null : reader.GetString(colProductName),
                            Supplier = reader.IsDBNull(colSupplierName) ? null : reader.GetString(colSupplierName),
                            SupplierId = reader.IsDBNull(colSupplierId) ? null : reader.GetInt32(colSupplierId),
                            Quantity = reader.IsDBNull(colQty) ? 0 : reader.GetInt32(colQty),
                            Date = reader.IsDBNull(colDate) ? null : reader.GetDateTime(colDate),
                            DateReceived = reader.IsDBNull(colDateReceived) ? null : reader.GetDateTime(colDateReceived),
                        });
                    }
                }

                string countQuery = @"
                    SELECT COUNT(*)
                    FROM (
                        SELECT 1
                        FROM tbl_purchase p
                        LEFT JOIN tbl_suppliers s ON p.m_id_supplier = s.m_id";

                if (!string.IsNullOrEmpty(search))
                {
                    countQuery += @"
                        LEFT JOIN tbl_products      pr ON p.m_item     = pr.m_name
                        LEFT JOIN tbl_product_types pt ON pr.m_id_type = pt.m_id
                        WHERE
                            s.m_name LIKE @search OR
                            p.m_item LIKE @search OR
                            pr.m_name LIKE @search OR
                            pt.m_type LIKE @search OR
                            pt.m_type_sub LIKE @search OR
                            p.m_description LIKE @search OR
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
                var colQty = reader.GetOrdinal("m_qty");

                while (await reader.ReadAsync())
                {
                    result.Add(new PurchaseOrderItem
                    {
                        Item = reader.IsDBNull(colItem) ? null : reader.GetString(colItem),
                        Rack = reader.IsDBNull(colRack) ? null : reader.GetString(colRack),
                        Description = reader.IsDBNull(colDesc) ? null : reader.GetString(colDesc),
                        Link = reader.IsDBNull(colLink) ? null : reader.GetString(colLink),
                        Qty = reader.IsDBNull(colQty) ? 0 : reader.GetDouble(colQty),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(result);
        }

        // GET /api/purchase/byproduct?productId=5
        // Purchase rows for one product (tbl_purchase.m_item matched to tbl_products.m_name)
        [HttpGet("byproduct")]
        public async Task<IActionResult> GetPurchasesByProduct(int productId)
        {
            var result = new List<object>();

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                var cmd = new MySqlCommand(@"
                    SELECT p.m_id, p.m_date, p.m_date_received, p.m_order_no, p.m_qty,
                           s.m_name AS supplier_name
                    FROM tbl_purchase p
                    JOIN tbl_products pr ON p.m_item = pr.m_name
                    LEFT JOIN tbl_suppliers s ON p.m_id_supplier = s.m_id
                    WHERE pr.m_id = @productId
                    ORDER BY p.m_date ASC, p.m_id ASC",
                    conn);

                cmd.Parameters.AddWithValue("@productId", productId);

                using var reader = await cmd.ExecuteReaderAsync();

                var colId = reader.GetOrdinal("m_id");
                var colDate = reader.GetOrdinal("m_date");
                var colDateReceived = reader.GetOrdinal("m_date_received");
                var colOrderNo = reader.GetOrdinal("m_order_no");
                var colQty = reader.GetOrdinal("m_qty");
                var colSupplier = reader.GetOrdinal("supplier_name");

                while (await reader.ReadAsync())
                {
                    result.Add(new
                    {
                        id = reader.GetInt32(colId),
                        date = reader.IsDBNull(colDate) ? (DateTime?)null : reader.GetDateTime(colDate),
                        dateReceived = reader.IsDBNull(colDateReceived) ? (DateTime?)null : reader.GetDateTime(colDateReceived),
                        orderNo = reader.IsDBNull(colOrderNo) ? null : reader.GetString(colOrderNo),
                        qty = reader.IsDBNull(colQty) ? 0 : reader.GetDouble(colQty),
                        supplier = reader.IsDBNull(colSupplier) ? null : reader.GetString(colSupplier),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(result);
        }

        [Authorize(Roles = "admin,manager")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] PurchaseCreateRequest request)
        {
            if (request == null || request.items == null || request.items.Count == 0)
                return BadRequest("Invalid data");

            if (request.m_id_supplier == null || request.m_id_supplier == 0)
                return BadRequest("A supplier is required.");

            if (string.IsNullOrWhiteSpace(request.m_order_no))
                return BadRequest("An order number is required.");

            // Reject the whole order if any line has no item — no blank rows.
            if (request.items.Any(i => string.IsNullOrWhiteSpace(i.m_item)))
                return BadRequest("Every item row must have an item selected. Remove any empty rows before saving.");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                using var tran = await conn.BeginTransactionAsync();

                foreach (var item in request.items)
                {
                    var cmd = new MySqlCommand(@"
                        INSERT INTO tbl_purchase
                            (m_id_supplier, m_order_no, m_slno, m_date, m_date_received, m_courier, m_tracking, m_item, m_qty, m_rate, m_gst, m_amount, m_description, m_buy_link)
                        VALUES
                            (@m_id_supplier, @m_order_no, @m_slno, @m_date, @m_date_received, @m_courier, @m_tracking, @m_item, @m_qty, @m_rate, @m_gst, @m_amount, @m_description, @m_buy_link)",
                        conn, (MySqlTransaction)tran);

                    cmd.Parameters.AddWithValue("@m_id_supplier", request.m_id_supplier);
                    cmd.Parameters.AddWithValue("@m_order_no", request.m_order_no ?? "");
                    cmd.Parameters.AddWithValue("@m_slno", item.m_slno);
                    cmd.Parameters.AddWithValue("@m_date", (object?)request.m_date ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_date_received", (object?)request.m_date_received ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_courier", (object?)request.m_courier ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_tracking", (object?)request.m_tracking ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_item", item.m_item ?? "");
                    cmd.Parameters.AddWithValue("@m_qty", (object?)item.m_qty ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_rate", (object?)item.m_rate ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_gst", (object?)item.m_gst ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_amount", (object?)item.m_amount ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_description", (object?)item.m_description ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_buy_link", (object?)item.m_buy_link ?? DBNull.Value);

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

        // PUT /api/purchase/update/{m_id}
        // An order spans multiple rows keyed by (supplier, order_no). We look up
        // the original key from m_id, delete that order's rows, then re-insert the
        // edited items — all inside one transaction.
        [Authorize(Roles = "admin,manager")]
        [HttpPut("update/{m_id:int}")]
        public async Task<IActionResult> Update(int m_id, [FromBody] PurchaseCreateRequest request)
        {
            if (request == null || request.items == null || request.items.Count == 0)
                return BadRequest("Invalid data");

            if (request.m_id_supplier == null || request.m_id_supplier == 0)
                return BadRequest("A supplier is required.");

            if (string.IsNullOrWhiteSpace(request.m_order_no))
                return BadRequest("An order number is required.");

            if (request.items.Any(i => string.IsNullOrWhiteSpace(i.m_item)))
                return BadRequest("Every item row must have an item selected. Remove any empty rows before saving.");

            try
            {
                using var conn = _db.GetConnection();
                await conn.OpenAsync();

                // Resolve the original (supplier, order_no) this row belongs to.
                int origSupplier;
                string? origOrderNo;
                var lookup = new MySqlCommand(
                    "SELECT m_id_supplier, m_order_no FROM tbl_purchase WHERE m_id = @m_id", conn);
                lookup.Parameters.AddWithValue("@m_id", m_id);
                using (var lr = await lookup.ExecuteReaderAsync())
                {
                    if (!await lr.ReadAsync())
                        return NotFound("Purchase record not found.");
                    origSupplier = lr.IsDBNull(0) ? 0 : lr.GetInt32(0);
                    origOrderNo = lr.IsDBNull(1) ? null : lr.GetString(1);
                }

                using var tran = await conn.BeginTransactionAsync();

                var del = new MySqlCommand(
                    "DELETE FROM tbl_purchase WHERE m_id_supplier = @s AND m_order_no <=> @o",
                    conn, (MySqlTransaction)tran);
                del.Parameters.AddWithValue("@s", origSupplier);
                del.Parameters.AddWithValue("@o", (object?)origOrderNo ?? DBNull.Value);
                await del.ExecuteNonQueryAsync();

                foreach (var item in request.items)
                {
                    var cmd = new MySqlCommand(@"
                        INSERT INTO tbl_purchase
                            (m_id_supplier, m_order_no, m_slno, m_date, m_date_received, m_courier, m_tracking, m_item, m_qty, m_rate, m_gst, m_amount, m_description, m_buy_link)
                        VALUES
                            (@m_id_supplier, @m_order_no, @m_slno, @m_date, @m_date_received, @m_courier, @m_tracking, @m_item, @m_qty, @m_rate, @m_gst, @m_amount, @m_description, @m_buy_link)",
                        conn, (MySqlTransaction)tran);

                    cmd.Parameters.AddWithValue("@m_id_supplier", request.m_id_supplier);
                    cmd.Parameters.AddWithValue("@m_order_no", request.m_order_no ?? "");
                    cmd.Parameters.AddWithValue("@m_slno", item.m_slno);
                    cmd.Parameters.AddWithValue("@m_date", (object?)request.m_date ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_date_received", (object?)request.m_date_received ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_courier", (object?)request.m_courier ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_tracking", (object?)request.m_tracking ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_item", item.m_item ?? "");
                    cmd.Parameters.AddWithValue("@m_qty", (object?)item.m_qty ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_rate", (object?)item.m_rate ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_gst", (object?)item.m_gst ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_amount", (object?)item.m_amount ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_description", (object?)item.m_description ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@m_buy_link", (object?)item.m_buy_link ?? DBNull.Value);

                    await cmd.ExecuteNonQueryAsync();
                }

                await tran.CommitAsync();

                await _activity.LogAsync(User, "purchase_update",
                    $"Order '{request.m_order_no}' supplier #{request.m_id_supplier} ({request.items.Count} items)");
                return Ok(new { success = true, message = "Purchase updated successfully" });
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
                    SELECT m_id_supplier, m_order_no, m_date, m_date_received, m_courier, m_tracking
                    FROM tbl_purchase
                    WHERE m_id = @m_id",
                    conn);
                cmd.Parameters.AddWithValue("@m_id", m_id);

                using var reader = await cmd.ExecuteReaderAsync();

                var colSupplierId = reader.GetOrdinal("m_id_supplier");
                var colOrderNo = reader.GetOrdinal("m_order_no");
                var colDate = reader.GetOrdinal("m_date");
                var colDateReceived = reader.GetOrdinal("m_date_received");
                var colCourier = reader.GetOrdinal("m_courier");
                var colTracking = reader.GetOrdinal("m_tracking");

                if (await reader.ReadAsync())
                {
                    obj.m_id_supplier = reader.IsDBNull(colSupplierId) ? 0 : reader.GetInt32(colSupplierId);
                    obj.m_order_no = reader.IsDBNull(colOrderNo) ? "" : reader.GetString(colOrderNo);
                    obj.m_date = reader.IsDBNull(colDate) ? null : reader.GetDateTime(colDate);
                    obj.m_date_received = reader.IsDBNull(colDateReceived) ? null : reader.GetDateTime(colDateReceived);
                    obj.m_courier = reader.IsDBNull(colCourier) ? null : reader.GetString(colCourier);
                    obj.m_tracking = reader.IsDBNull(colTracking) ? null : reader.GetString(colTracking);
                }

                await reader.CloseAsync();

                if (obj.m_id_supplier == 0 || string.IsNullOrEmpty(obj.m_order_no))
                    return BadRequest("Invalid request");

                var cmd2 = new MySqlCommand(@"
                    SELECT m_slno, m_item, m_qty, m_rate, m_gst, m_amount, m_description, m_buy_link
                    FROM tbl_purchase
                    WHERE m_id_supplier = @m_id_supplier AND m_order_no = @m_order_no",
                    conn);
                cmd2.Parameters.AddWithValue("@m_id_supplier", obj.m_id_supplier);
                cmd2.Parameters.AddWithValue("@m_order_no", obj.m_order_no);

                using var reader2 = await cmd2.ExecuteReaderAsync();

                var colSlno = reader2.GetOrdinal("m_slno");
                var colItem = reader2.GetOrdinal("m_item");
                var colQty = reader2.GetOrdinal("m_qty");
                var colRate = reader2.GetOrdinal("m_rate");
                var colGst = reader2.GetOrdinal("m_gst");
                var colAmount = reader2.GetOrdinal("m_amount");
                var colDesc = reader2.GetOrdinal("m_description");
                var colLink = reader2.GetOrdinal("m_buy_link");

                while (await reader2.ReadAsync())
                {
                    obj.items.Add(new PurchaseItemRequest
                    {
                        m_slno = reader2.IsDBNull(colSlno) ? 0 : reader2.GetInt32(colSlno),
                        m_item = reader2.IsDBNull(colItem) ? null : reader2.GetString(colItem),
                        m_qty = reader2.IsDBNull(colQty) ? 0 : reader2.GetDouble(colQty),
                        m_rate = reader2.IsDBNull(colRate) ? 0 : reader2.GetDouble(colRate),
                        m_gst = reader2.IsDBNull(colGst) ? 0 : reader2.GetDouble(colGst),
                        m_amount = reader2.IsDBNull(colAmount) ? 0 : reader2.GetDouble(colAmount),
                        m_description = reader2.IsDBNull(colDesc) ? null : reader2.GetString(colDesc),
                        m_buy_link = reader2.IsDBNull(colLink) ? null : reader2.GetString(colLink),
                    });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            return Ok(obj);
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
