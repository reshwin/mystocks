using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MyStockAPI;
using MyStockAPI.Helpers;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

SqlMapper.AddTypeHandler(new DateOnlyTypeHandler());
SqlMapper.AddTypeHandler(new TimeOnlyTypeHandler());

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter your JWT token."
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    // Credentialed requests (cookies) cannot use AllowAnyOrigin; reflect the
    // caller's origin when it belongs to our own site (doomsquare.com) or is local dev.
    options.AddPolicy("AllowReact",
        policy => policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrEmpty(origin)) return false;
                try
                {
                    var host = new Uri(origin).Host;
                    return host == "localhost"
                        || host == "127.0.0.1"
                        || host == "doomsquare.com"
                        || host.EndsWith(".doomsquare.com")
                        // private LAN ranges for on-device dev testing (token-based)
                        || host.StartsWith("192.168.")
                        || host.StartsWith("10.")
                        || host.StartsWith("172.16.") || host.StartsWith("172.17.") || host.StartsWith("172.18.") || host.StartsWith("172.19.")
                        || host.StartsWith("172.2")   || host.StartsWith("172.30.") || host.StartsWith("172.31.");
                }
                catch { return false; }
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Accept the token from the HttpOnly auth cookie when no Bearer header is present.
        var cookieName = builder.Configuration["Auth:CookieName"] ?? "auth_token";
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (string.IsNullOrEmpty(context.Token) &&
                    context.Request.Cookies.TryGetValue(cookieName, out var cookieToken))
                {
                    context.Token = cookieToken;
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddSingleton<DbHelper>();
builder.Services.AddSingleton<MyStockAPI.Helpers.ActivityLogger>();

var app = builder.Build();

app.UseCors("AllowReact");

if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
