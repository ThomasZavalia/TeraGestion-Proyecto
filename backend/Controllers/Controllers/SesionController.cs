using Core.DTOs.Sesion.Input;
using Core.DTOs.Sesion.Output;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class SesionController : ControllerBase
    {

        private readonly ISesionService _sesionService;
        public SesionController(ISesionService sesionService)
        {
            _sesionService = sesionService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetSesion(int id)
        {
           
                var sesion = await _sesionService.GetSesionByIdAsync(id);
                return Ok(sesion);
          
        }



        [HttpGet]
        public async Task<IActionResult> GetSesiones()
        {
            
                var sesiones = await _sesionService.GetSesionesAsync();
                return Ok(sesiones);
           
        }



        [HttpPost]
        
        public async Task<IActionResult> CrearSesion([FromBody] SesionCreacionDto dto)
        {
            
            var nuevaSesionDto = await _sesionService.CrearSesionAsync(dto);
            
            return CreatedAtAction(nameof(GetSesion), new { id = nuevaSesionDto.Id }, nuevaSesionDto);
        }



        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarSesion(int id, [FromBody] SesionActualizarDto dto) 
        {
            var sesionActualizadaDto = await _sesionService.ActualizarSesionAsync(id, dto);
            return Ok(sesionActualizadaDto);
        }





        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarSesion(int id)
        {
            
                var resultado = await _sesionService.EliminarSesionAsync(id);
            return NoContent();
        }

        [HttpPost("registrar-asistencia")]
        public async Task<IActionResult> RegistrarAsistencia([FromBody] SesionAsistenciaDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var sesionDto = await _sesionService.RegistrarAsistenciaAsync(dto);
            return Ok(sesionDto);
        }

        [HttpGet("paciente/{pacienteId}")]
        public async Task<IActionResult> GetSesiones(
    int pacienteId,
    [FromQuery] int pagina = 1,
    [FromQuery] int tamanio = 5,
    [FromQuery] DateTime? desde = null,
    [FromQuery] DateTime? hasta = null,
    [FromQuery] int? terapeutaId = null,
    [FromQuery] string? asistencia = null)
        {
            var resultado = await _sesionService.GetSesionesPaginadasAsync(
                pacienteId, pagina, tamanio, desde, hasta, terapeutaId, asistencia);
            return Ok(resultado);
        }

    }
}
