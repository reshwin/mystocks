namespace MyStockAPI.DTOs.Stock
{
    public class CreateStockMovementRequest
    {
        public int M_product_id { get; set; }
        public string M_type { get; set; } = string.Empty;
        public string M_direction { get; set; } = string.Empty;
        public decimal M_qty { get; set; }
        public DateOnly M_date { get; set; }
        public int? M_purchase_id { get; set; }
        public string? M_project { get; set; }
        public string? M_notes { get; set; }
        public int M_user_id { get; set; }
    }
}
