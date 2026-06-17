namespace MyStockAPI.Models
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool RememberMe { get; set; } = false;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public User User { get; set; } = new();
    }
}
