namespace MyStockAPI.Models
{
    public class ProductType
    {
        public int Id { get; set; }
        public string? Type { get; set; }
        public string? TypeSub { get; set; }
    }

    public class ProductTypeRequest
    {
        public string m_type { get; set; } = string.Empty;
        public string? m_type_sub { get; set; }
    }
}
