using Core.Entidades;
using Core.Interfaces.Services;
using Infraestructure;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class NotificacionService : INotificacionService
    {
        private readonly TeraDbContext _context;
        private readonly IHubContext<NotificacionesHub> _hubContext;

        public NotificacionService(TeraDbContext context, IHubContext<NotificacionesHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task CrearNotificacionAsync(int usuarioDestinoId, string titulo, string mensaje, int? referenciaId = null)
        {
          
            var notificacion = new Notificacion
            {
                UsuarioId = usuarioDestinoId,
                Titulo = titulo,
                Mensaje = mensaje,
                ReferenciaId = referenciaId,
                Tipo = "Turno",
                FechaCreacion = DateTime.UtcNow,
                Leida = false
            };

            await _context.Notificaciones.AddAsync(notificacion);
            await _context.SaveChangesAsync();

            

            await _hubContext.Clients.User(usuarioDestinoId.ToString())
                .SendAsync("RecibirNotificacion", new
                {
                    id = notificacion.Id,
                    titulo = titulo,
                    mensaje = mensaje,
                    fecha = notificacion.FechaCreacion
                });
        }
    }
}
