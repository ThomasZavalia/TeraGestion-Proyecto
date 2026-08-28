using Controllers;
using Core.Entidades;
using Core.Interfaces;
using Core.Interfaces.Email;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Core.Mapping;
using Infraestructure;
using Infrastructure.Email;
using Infrastructure.Hubs;
using Infrastructure.Repositorios;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Prometheus;
using Serilog;
using Services;
using Services.BackgroundJobs;
using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);


builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

builder.Services.AddDbContext<TeraDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("Infrastructure")));

builder.Services.AddHttpContextAccessor();

builder.Services.AddSignalR();


// Repositorios
builder.Services.AddScoped<IPacienteRepository, PacienteRepository>();
builder.Services.AddScoped<ITurnoRepository, TurnoRepository>();
builder.Services.AddScoped<IUsuariosRepository, UsuarioRepository>();
builder.Services.AddScoped<IPagosRepository, PagoRepository>();
builder.Services.AddScoped<ISesionRepository, SesionRepository>();
builder.Services.AddScoped<IObraSocialRepository, ObraSocialRepository>();
builder.Services.AddScoped<IDisponibilidadRepository, DisponibilidadRepository>();
builder.Services.AddScoped<IAusenciaRepository, AusenciaRepository>();
builder.Services.AddScoped<IConfiguracionRepository, ConfiguracionRepository>();
builder.Services.AddScoped<IAuditoriaRepository, AuditoriaRepository>();


// Servicios
builder.Services.AddScoped<IPacienteService, PacienteService>();
builder.Services.AddScoped<ITurnoService, TurnoService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IPagoService, PagoService>();
builder.Services.AddScoped<ISesionService, SesionService>();
builder.Services.AddScoped<IObraSocialService, ObraSocialService>();
builder.Services.AddScoped<IReportesService,ReportesService>();
builder.Services.AddScoped<IDisponibilidadService, DisponibilidadService>();
builder.Services.AddScoped<IEmailService, SmtpEmailService>();
builder.Services.AddScoped<IAusenciaService, AusenciaService>();
builder.Services.AddScoped<IRecaptchaService, RecaptchaService>();
builder.Services.AddScoped<INotificacionService, NotificacionService>();
builder.Services.AddScoped<IConfiguracionService, ConfiguracionService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();

builder.Services.AddHostedService<TurnoCleanupService>();
builder.Services.AddHostedService<TurnoReminderService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
      policy.WithOrigins(builder.Configuration["FrontendBaseUrl"])
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];

           
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notificaciones"))
            {
              
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});


builder.Services.AddAutoMapper(config => { },
    typeof(Program).Assembly,
    typeof(Core.Mapping.TurnoProfile).Assembly,
    typeof(PagoProfile).Assembly,
    typeof(SesionProfile).Assembly,
    typeof(DisponibilidadProfile).Assembly,
    typeof(UsuarioProfile).Assembly,
    typeof(ObraSocialProfile).Assembly,
    typeof(AusenciaProfile).Assembly
);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
   
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    
    options.AddFixedWindowLimiter(policyName: "PublicPolicy", options =>
    {
        options.PermitLimit = 15;
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 5; 
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseMiddleware<Controllers.Middlewares.ErrorHandlingMiddleware>();
app.UseRateLimiter();
app.UseHttpMetrics(); 

app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<Controllers.Middlewares.CheckUsuarioActivoMiddleware>();

app.MapHub<NotificacionesHub>("/hubs/notificaciones");
app.MapMetrics();  

app.MapControllers();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();




using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<TeraDbContext>();

    
    context.Database.Migrate();


    if (!context.Usuarios.Any())
    {
        var hasher = new PasswordHasher<Usuario>();
        var admin = new Usuario
        {
            Id = 2,
            Username = "admin",
            Email = "admin@teragestion.com",
            Rol = "Admin",
            DuracionTurnoDefault = 40,
            Activo = true
           
        };

        admin.PasswordHash = hasher.HashPassword(admin, "Admin123!");

        context.Usuarios.Add(admin);
        context.SaveChanges();

     
        var dias = Enum.GetValues(typeof(DayOfWeek)).Cast<DayOfWeek>();
        foreach (var dia in dias)
        {
            context.Set<Disponibilidad>().Add(new Disponibilidad
            {
                UsuarioId = admin.Id,
                DiaSemana = dia,
                Disponible = (dia >= DayOfWeek.Monday && dia <= DayOfWeek.Friday),
                HoraInicio = (dia >= DayOfWeek.Monday && dia <= DayOfWeek.Friday) ? new TimeSpan(16, 0, 0) : null,
                HoraFin = (dia >= DayOfWeek.Monday && dia <= DayOfWeek.Friday) ? new TimeSpan(21, 0, 0) : null
            });
        }
        context.SaveChanges();
    }
}
app.Run();
