using Core.DTOs.Public;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Services;

namespace Controllers.Controllers
{
    [Route("api/public/turnos")]
    [ApiController]
    [EnableRateLimiting("PublicPolicy")]
    public class PublicTurnosController : ControllerBase
    {
        private readonly ITurnoService _turnoService;
        private readonly IObraSocialService _obraSocialService;
        private readonly IRecaptchaService _recaptchaService;

        public PublicTurnosController(ITurnoService turnoService, IObraSocialService obraSocialService, IRecaptchaService recaptchaService)
        {
            _turnoService = turnoService;
            _obraSocialService = obraSocialService;
            _recaptchaService = recaptchaService;
        }


        [HttpGet("disponibilidad/{terapeutaId}")]
        public async Task<IActionResult> GetDisponibilidad([FromQuery] DateTime fecha,int terapeutaId)
        {
           
            var slots = await _turnoService.GetAvailableSlotsAsync(fecha,terapeutaId);
            return Ok(slots);
        }

        
        [HttpPost("reservar")]
        public async Task<IActionResult> Reservar([FromBody] ReservaDto dto)
        {

            var esHumano = await _recaptchaService.ValidateTokenAsync(dto.RecaptchaToken);
            if (!esHumano)
            {
                return BadRequest(new { error = "Actividad sospechosa detectada. Intente nuevamente." });
            }
            try
            {
                var turno = await _turnoService.ReservarTurnoPublicoAsync(dto);
                return Ok(new { message = "Turno reservado con éxito", turnoId = turno.Id });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message }); 
            }
            catch (Exception ex)
            {
               
                return StatusCode(500, new { error = "Ocurrió un error al procesar la reserva." });
            }
        }

        [HttpGet("obras-sociales")]
        public async Task<IActionResult> GetObrasSocialesPublicas()
        {
            
            var obras = await _obraSocialService.GetObrasSocialesAsync();
            return Ok(obras);
        }

        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarTurno([FromQuery] int id, [FromQuery] string token)
        {
            var exito = await _turnoService.ConfirmarTurnoAsync(id, token);

            if (exito)
            {
                return Ok(new { message = "Turno confirmado exitosamente." });
            }
            else
            {
                return BadRequest(new { error = "El enlace de confirmación es inválido o el turno ya fue confirmado." });
            }
        }
    }
}
