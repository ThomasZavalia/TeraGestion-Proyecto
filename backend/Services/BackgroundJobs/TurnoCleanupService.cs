using Infraestructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.BackgroundJobs
{
    public class TurnoCleanupService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<TurnoCleanupService> _logger;

        public TurnoCleanupService(
            IServiceProvider serviceProvider,
            ILogger<TurnoCleanupService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation(" TurnoCleanupService iniciado.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await LimpiarTurnosVencidos();
                }
                catch (Exception ex)
                {
                    _logger.LogError($" Error en TurnoCleanupService: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        private async Task LimpiarTurnosVencidos()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TeraDbContext>();

            var ahoraTucuman = DateTime.UtcNow.AddHours(-3);

            var inicioDeHoyTucuman = ahoraTucuman.Date;

            var limiteUtcParaVencer = inicioDeHoyTucuman.AddHours(3);

            var turnosVencidos = await context.Turnos
                .Where(t => t.FechaHora < limiteUtcParaVencer &&
                            (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion"))
                .ToListAsync();

            if (turnosVencidos.Any())
            {
                _logger.LogWarning($" Limpiando {turnosVencidos.Count} turnos de días anteriores...");

                foreach (var turno in turnosVencidos)
                {
                    turno.Estado = "Pendiente de Cierre";
                }

                await context.SaveChangesAsync();
                _logger.LogInformation($" {turnosVencidos.Count} turnos viejos marcados como Pendiente de Cierre.");
            }
        }
    }
}
