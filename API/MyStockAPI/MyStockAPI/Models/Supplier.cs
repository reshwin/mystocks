namespace MyStockAPI.Models
{
    public class Supplier
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Web { get; set; }
    }

    public class SupplierRequest
    {
        public string m_name { get; set; } = string.Empty;
        public string? m_web { get; set; }
    }
}
