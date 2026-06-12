namespace MyStockAPI.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int? TypeId { get; set; }
        public string? Type { get; set; }
        public string? TypeSub { get; set; }
        public int? Pins { get; set; }
        public string? RackLocation { get; set; }
        public string? Link { get; set; }
        public string? Description { get; set; }
        public double? StockPurchased { get; set; }
        public double? StockIn { get; set; }
        public double? StockOut { get; set; }
    }

    public class ProductRequest
    {
        public string m_name { get; set; } = string.Empty;
        public int? m_id_type { get; set; }
        public int? m_pins { get; set; }
        public string? m_rack_location { get; set; }
        public string? m_link { get; set; }
        public string? m_description { get; set; }
    }

    public class RackLocationRequest
    {
        public string? RackLocation { get; set; }
    }
}
