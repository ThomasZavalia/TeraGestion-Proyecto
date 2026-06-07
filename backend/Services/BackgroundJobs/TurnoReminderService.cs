using Core.Interfaces.Email;
using Infraestructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace Services.BackgroundJobs
{
    /// <summary>
    /// Envía recordatorios por email a los pacientes que tienen turno al día siguiente.
    /// Corre una vez por día a las 18:00 hs (hora Argentina).
    /// Solo envía si el turno fue creado hace más de 2 horas (evita spam en reservas de último momento).
    /// </summary>
    public class TurnoReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TurnoReminderService> _logger;

        private static readonly TimeZoneInfo ZonaArgentina = ObtenerZonaArgentina();

        public TurnoReminderService(IServiceProvider serviceProvider, ILogger<TurnoReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("TurnoReminderService iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var ahoraLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaArgentina);

                // Próximas 18:00 hs — si ya pasaron hoy, calcula para mañana
                // Próximas 18:00 hs — si ya pasaron hoy, calcula para mañana
                var horaObjetivo = new TimeSpan(18, 0, 0);
                var proximoEnvio = ahoraLocal.TimeOfDay < horaObjetivo
                    ? ahoraLocal.Date.Add(horaObjetivo)
                    : ahoraLocal.Date.AddDays(1).Add(horaObjetivo);

                var demora = proximoEnvio - ahoraLocal;
                _logger.LogInformation("Próximo envío de recordatorios en {Horas:F1} horas ({Hora}).",
                    demora.TotalHours, proximoEnvio.ToString("dd/MM/yyyy HH:mm"));

                try
                {
                    await Task.Delay(demora, stoppingToken);
                }
                catch (TaskCanceledException)
                {
                    break;
                }

                try
                {
                    await EnviarRecordatorios();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al enviar recordatorios de turnos.");
                }
            }
        }

        private async Task EnviarRecordatorios()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TeraDbContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

            var ahoraLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ZonaArgentina);
            var mananaLocal = ahoraLocal.Date.AddDays(1);

            // Convertimos inicio y fin de "mañana" a UTC para comparar con la BD
            var mananaUtcInicio = TimeZoneInfo.ConvertTimeToUtc(mananaLocal, ZonaArgentina);
            var mananaUtcFin = TimeZoneInfo.ConvertTimeToUtc(mananaLocal.AddDays(1), ZonaArgentina);

            // Límite: turno creado hace más de 2 horas (evita recordatorios inmediatos)
            var limiteCreacion = DateTime.UtcNow.AddHours(-2);

            var turnos = await context.Turnos
                .Include(t => t.Paciente)
                .Include(t => t.Terapeuta)
                .Where(t =>
                    t.FechaHora >= mananaUtcInicio &&
                    t.FechaHora < mananaUtcFin &&
                    t.Estado == "Reservado" &&
                    t.Paciente.Email != null && t.Paciente.Email != "" &&
                    t.CreadoEn <= limiteCreacion)
                .ToListAsync();

            if (!turnos.Any())
            {
                _logger.LogInformation("No hay turnos para recordar mañana ({Fecha}).", mananaLocal.ToString("dd/MM/yyyy"));
                return;
            }

            _logger.LogInformation("Enviando {Cantidad} recordatorios para el {Fecha}.", turnos.Count, mananaLocal.ToString("dd/MM/yyyy"));

            foreach (var turno in turnos)
            {
                var fechaLocal = TimeZoneInfo.ConvertTimeFromUtc(
                    DateTime.SpecifyKind(turno.FechaHora, DateTimeKind.Utc), ZonaArgentina);

                var nombrePaciente = turno.Paciente.Nombre;
                var nombreTerapeuta = $"{turno.Terapeuta?.Nombre} {turno.Terapeuta?.Apellido}".Trim();

                var culturaEs = CultureInfo.GetCultureInfo("es-AR");
                var fechaTexto = fechaLocal.ToString("dddd dd 'de' MMMM", culturaEs);

                var cuerpo = $@"
<p>Hola <strong>{nombrePaciente}</strong>,</p>
<p>Te recordamos que mañana tenés un turno agendado:</p>
<ul>
    <li><strong>Fecha:</strong> {fechaTexto}</li>
    <li><strong>Hora:</strong> {fechaLocal:HH:mm} hs</li>
    {(string.IsNullOrEmpty(nombreTerapeuta) ? "" : $"<li><strong>Profesional:</strong> {nombreTerapeuta}</li>")}
</ul>
<p>Si necesitás cancelar o reprogramar, por favor comunicáte con el consultorio.</p>
<p>Saludos,<br/>TeraGestión</p>";

                try
                {
                    await emailService.SendEmailAsync(
                        turno.Paciente.Email,
                        "Recordatorio de Turno — Mañana",
                        cuerpo);

                    _logger.LogInformation("Recordatorio enviado a {Email} para turno #{Id}.", turno.Paciente.Email, turno.Id);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "No se pudo enviar recordatorio al paciente {Id} (turno #{TurnoId}).",
                        turno.PacienteId, turno.Id);
                }
            }
        }

        private static TimeZoneInfo ObtenerZonaArgentina()
        {
            try
            {
                return TimeZoneInfo.FindSystemTimeZoneById("Argentina Standard Time");
            }
            catch (TimeZoneNotFoundException)
            {
                return TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
            }
        }
    }
}
