using Infraestructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/notificaciones")]
    [ApiController]
    [Authorize] 
    public class NotificacionesController : ControllerBase
    {
        private readonly TeraDbContext _context;

        public NotificacionesController(TeraDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMisNotificaciones()
        {
           
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var notificaciones = await _context.Notificaciones
                .Where(n => n.UsuarioId == userId)
                .OrderByDescending(n => n.FechaCreacion)
                .Take(20) 
                .ToListAsync();

            return Ok(notificaciones);
        }

        [HttpPut("{id}/leer")]
        public async Task<IActionResult> MarcarComoLeida(int id)
        {
            var notificacion = await _context.Notificaciones.FindAsync(id);
            if (notificacion == null) return NotFound();

            notificacion.Leida = true;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
