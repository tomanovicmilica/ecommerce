using API.Data;
using API.Entities;
using API.Middleware;
using API.RequestHelpers;
using API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddAutoMapper(typeof(MappingProfiles).Assembly);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    var jwtSecurityScheme = new OpenApiSecurityScheme
    {
        BearerFormat = "JWT",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        Description = "Put Bearer + your token in the box below",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(jwtSecurityScheme.Reference.Id, jwtSecurityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtSecurityScheme, Array.Empty<string>() }
    });
});

builder.Services.AddDbContext<StoreContext>(opt =>
{
    var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

    if (string.IsNullOrEmpty(connectionString))
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        Console.WriteLine("[DB] Using DefaultConnection from appsettings.json");
    }
    else
    {
        Console.WriteLine($"[DB] Using DATABASE_URL from environment (length: {connectionString.Length})");
    }

    // Render provides DATABASE_URL in a specific format that needs conversion
    if (connectionString != null && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
    {
        try
        {
            // Parse Render's DATABASE_URL format: postgres://user:password@host:port/database
            var uri = new Uri(connectionString);
            var db = uri.AbsolutePath.Trim('/');
            var userInfo = uri.UserInfo.Split(':');
            var user = userInfo[0];
            var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var port = uri.Port > 0 ? uri.Port : 5432; // Default to 5432 if port not specified

            connectionString = $"Host={uri.Host};Port={port};Database={db};Username={user};Password={password};SSL Mode=Require;Trust Server Certificate=true";
            Console.WriteLine($"[DB] Converted connection string - Host: {uri.Host}, Port: {port}, Database: {db}, User: {user}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DB] ERROR converting connection string: {ex.Message}");
            throw;
        }
    }

    if (string.IsNullOrEmpty(connectionString))
    {
        Console.WriteLine("[DB] ERROR: Connection string is empty!");
        throw new InvalidOperationException("Database connection string is not configured");
    }

    opt.UseNpgsql(connectionString);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddIdentityCore<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
})
.AddRoles<Role>()
.AddEntityFrameworkStores<StoreContext>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.
                GetBytes(builder.Configuration["JWTSettings:TokenKey"]!))
        };

        // Configure JWT for SignalR
        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] Authentication failed: {context.Exception.GetType().Name} - {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"[JWT] Token validated successfully for user: {context.Principal?.Identity?.Name}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"[JWT] Challenge issued: {context.Error}, {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IDigitalDeliveryService, DigitalDeliveryService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddSignalR();
var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.ConfigObject.AdditionalItems.Add("persistAuthorization", "true");
    });
}



app.UseRouting();
//app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("CorsPolicy");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<API.Hubs.NotificationHub>("/notificationHub");

// SPA fallback for React Router
app.MapFallbackToFile("index.html");

// Run migrations and seed data before starting the app
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        Console.WriteLine("[MIGRATION] Starting database migration...");
        var context = services.GetRequiredService<StoreContext>();
        await context.Database.MigrateAsync();
        Console.WriteLine("[MIGRATION] Database migration completed successfully");

        Console.WriteLine("[SEED] Starting database initialization...");
        var userManager = services.GetRequiredService<UserManager<User>>();
        var roleManager = services.GetRequiredService<RoleManager<Role>>();
        await DbInitializer.Initialize(context, userManager, roleManager);
        Console.WriteLine("[SEED] Database initialization completed successfully");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "A problem occurred during migration");
        Console.WriteLine($"[MIGRATION ERROR] {ex.Message}");
        Console.WriteLine($"[MIGRATION ERROR] Stack trace: {ex.StackTrace}");
        throw; // Re-throw to prevent app from starting with uninitialized database
    }
}

Console.WriteLine("[APP] Starting web application...");
app.Run();



