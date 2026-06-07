using Core.DTOs.Disponiblidad.Input;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/usuario/me/disponibilidad")] 
    [ApiController]
    [Authorize] 
    public class DisponibilidadController : ControllerBase
    {
        private readonly IDisponibilidadService _disponibilidadService;

        public DisponibilidadController(IDisponibilidadService disponibilidadService)
        {
            _disponibilidadService = disponibilidadService;
        }

        
        [HttpGet]
        public async Task<IActionResult> GetMiDisponibilidad()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Token inválido.");
            }

            var disponibilidad = await _disponibilidadService.GetDisponibilidadAsync(userId);
            return Ok(disponibilidad); 
        }


        [HttpPut("terapeuta/{terapeutaId}")]
        [Authorize(Roles = "Admin")] 
        public async Task<IActionResult> UpdateDisponibilidadTerapeuta(int terapeutaId, [FromBody] DisponibilidadUpdateDto dto)
        {
           
            await _disponibilidadService.UpdateDisponibilidadAsync(terapeutaId, dto);

            return Ok(new { message = "Horarios del terapeuta asignados correctamente." });
        }

        [HttpGet("terapeuta/{terapeutaId}")]
      
        [Authorize(Roles = "Admin,Secretaria,Terapeuta")]
        public async Task<IActionResult> GetDisponibilidadTerapeuta(int terapeutaId)
        {
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userRole == "Terapeuta" && int.TryParse(userIdString, out int userId) && userId != terapeutaId)
            {
                return Forbid("No tienes permiso para ver los horarios de otro terapeuta.");
            }

            var disponibilidad = await _disponibilidadService.GetDisponibilidadAsync(terapeutaId);
            return Ok(disponibilidad);
        }
    }
}
