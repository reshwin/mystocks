namespace MyStockAPI.DTOs.Stock
{
    public class StockMovementDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Direction { get; set; } = string.Empty;
        public decimal Qty { get; set; }
        public int? PurchaseId { get; set; }
        public string? Project { get; set; }
        public string? Notes { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public DateOnly Date { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
