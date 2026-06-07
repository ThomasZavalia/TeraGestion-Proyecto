using Core.DTOs;
using Core.DTOs.Pago.Input;
using Core.DTOs.Turno;
using Core.DTOs.Turno.Input;
using Core.DTOs.Turno.Output;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TurnoController : ControllerBase
    {

        private readonly ITurnoService _turnoService;
        public TurnoController(ITurnoService turnoService)
        {
            _turnoService = turnoService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTurno(int id)
        {
           
           var turno = await _turnoService.GetTurnoAsync(id);
           
            return Ok(turno);
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] DateTime start, [FromQuery] DateTime end)
        {
            if (start != default)
                start = DateTime.SpecifyKind(start, DateTimeKind.Utc);

            if (end != default)
                end = DateTime.SpecifyKind(end, DateTimeKind.Utc);

            if (start == default)
                start = DateTime.UtcNow.AddDays(-15);

            if (end == default)
                end = DateTime.UtcNow.AddDays(45);

            try
            {
                var turnos = await _turnoService.GetTurnosAsync(start, end);
                return Ok(turnos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error interno del servidor", detalle = ex.Message });
            }
        }

        [Authorize(Roles = "Admin,Secretaria")]
        [HttpPost]
        public async Task<IActionResult> CrearTurno([FromBody] TurnoDtoCreacion turno)
        {
            try
            {
                var turnoCreado = await _turnoService.CrearTurnoAsync(turno);

                return Ok(turnoCreado);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            { 
                return StatusCode(500, new { message = "Ocurrió un error inesperado en el servidor." });
            }
        }




        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarTurno(int id, [FromBody]TurnoDtoActualizar turnoDto)
        {
           
            
           var turnoActualizado = await _turnoService.ActualizarTurnoAsync(id, turnoDto);
           
            
            return Ok(turnoActualizado);
        }
        [Authorize(Roles = "Admin,Secretaria")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarTurno(int id)
        {
           var turno = await _turnoService.EliminarTurnoAsync(id);
           
            return NoContent();
        }

        [Authorize(Roles = "Admin,Secretaria")]
        [HttpPost("{id}/pagar")]
        public async Task<IActionResult> MarcarComoPagado(int id, [FromBody] PagoRequestDto request)
        {
            await _turnoService.MarcarComoPagadoAsync(id, request.MetodoPago);
                return Ok("Turno marcado como pagado correctamente");
            
            
        }

        [HttpGet("disponibilidad/{terapeutaId}")]
        public async Task<IActionResult> GetDisponibilidad([FromQuery] DateTime fecha, int terapeutaId)
        {
            var slots = await _turnoService.GetAvailableSlotsAsync(fecha, terapeutaId);
            return Ok(slots);
        }

        [HttpGet("paciente/{pacienteId}/pendientes")]
        public async Task<IActionResult> GetTurnosPendientesPago(int pacienteId, [FromQuery] int pagina = 1, [FromQuery] int tamanio = 5)
        {
            var result = await _turnoService.GetTurnosPendientesPagoPaginadosAsync(pacienteId, pagina, tamanio);
            return Ok(result);
        }

        [HttpGet("hoy")] 
        public async Task<IActionResult> GetTurnosDeHoy()
        {

            var hoyUtc = DateTime.UtcNow;
            var turnos = await _turnoService.GetTurnosDelDiaAsync(hoyUtc);
            return Ok(turnos); 
        }

        [HttpGet("{id}/detalle")]
        public async Task<IActionResult> GetTurnoDetalle(int id)
        {
        
            var turno = await _turnoService.GetTurnoDetalleAsync(id);
            return Ok(turno);
        }

        [HttpPut("{id}/reprogramar")]
        public async Task<IActionResult> ReprogramarTurno(int id, [FromBody] TurnoReprogramacionDto dto)
        {
            var turnoActualizado = await _turnoService.ReprogramarTurnoAsync(id, dto.NuevaFecha);
            return Ok(turnoActualizado);
        }

        [Authorize(Roles = "Admin,Secretaria")] 
        [HttpPut("{id}/revertir")]
        public async Task<IActionResult> RevertirTurno(int id)
        {
            var resultado = await _turnoService.RevertirEstadoTurnoAsync(id);
            return resultado ? Ok() : BadRequest("No se pudo revertir el turno.");
        }
    }
}
