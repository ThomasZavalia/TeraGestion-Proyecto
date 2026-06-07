using Core.Entidades;
using Core.Interfaces;
using Core.Interfaces.Repositorios;
using Infraestructure;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class AuditoriaService : IAuditoriaService
    {
        private readonly IAuditoriaRepository _auditoriaRepository; 
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditoriaService(
            IAuditoriaRepository auditoriaRepository,
            IHttpContextAccessor httpContextAccessor)
        {
            _auditoriaRepository = auditoriaRepository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task RegistrarAsync(
            string accion,
            string modulo,
            string entidad,
            int? entidadId,
            string descripcion)
        {
            var httpContext = _httpContextAccessor.HttpContext;

            var userIdStr = httpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int usuarioId = userIdStr != null ? int.Parse(userIdStr) : 0;
            var usuarioNombre = httpContext?.User.FindFirst(ClaimTypes.Name)?.Value ?? "Sistema Automático";
            var usuarioRol = httpContext?.User.FindFirst(ClaimTypes.Role)?.Value ?? "Sistema";

            var ipAddress = httpContext?.Connection.RemoteIpAddress?.ToString();
            var userAgent = httpContext?.Request.Headers["User-Agent"].ToString();

            var auditoria = new Auditoria
            {
                UsuarioId = usuarioId,
                UsuarioNombre = usuarioNombre,
                UsuarioRol = usuarioRol,
                Accion = accion,
                Modulo = modulo,
                Entidad = entidad,
                EntidadId = entidadId,
                Descripcion = descripcion,
                FechaHora = DateTime.UtcNow,
                IpAddress = ipAddress, 
                UserAgent = userAgent  
            };

            await _auditoriaRepository.RegistrarAsync(auditoria); 
        }
    }
}

