namespace MyStockAPI.Models
{
    public class PurchaseCreateRequest
    {
        public string? m_order_no { get; set; }
        public int? m_id_supplier { get; set; }
        public DateTime? m_date { get; set; }
        public DateTime? m_date_received { get; set; }
        public List<PurchaseItemRequest> items { get; set; } = new();
    }

    public class PurchaseItemRequest
    {
        public int m_slno { get; set; }
        public string? m_item { get; set; }
        public double? m_qty { get; set; }
        public double? m_rate { get; set; }
        public double? m_gst { get; set; }
        public double? m_amount { get; set; }
    }

    public class PurchaseListItem
    {
        public int Id { get; set; }
        public string? OrderNo { get; set; }
        public string? Product { get; set; }
        public string? Supplier { get; set; }
        public int? SupplierId { get; set; }
        public int Quantity { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? DateReceived { get; set; }
    }

    public class PurchaseOrderItem
    {
        public string? Item { get; set; }
        public string? Rack { get; set; }
        public string? Description { get; set; }
        public string? Link { get; set; }
        public double Qty { get; set; }
    }
}
