namespace MyStockAPI.DTOs.Stock
{
    public class StockBalanceDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? RackLocation { get; set; }

        public decimal Opening { get; set; }
        public decimal Purchased { get; set; }
        public decimal Returned { get; set; }
        public decimal Consumed { get; set; }
        public decimal WriteOff { get; set; }
        public decimal Pending { get; set; }

        // in-hand stock: opening + received purchases + returns - consumption - writeoffs
        public decimal Balance => Opening + Purchased + Returned - Consumed - WriteOff;
    }
}
