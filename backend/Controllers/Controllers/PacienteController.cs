using Core.DTOs;
using Core.DTOs.Paciente;
using Core.Entidades;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PacienteController : ControllerBase
    {
        private readonly IPacienteService _pacienteService;
        public PacienteController(IPacienteService pacienteService)
        {
            _pacienteService = pacienteService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaciente(int id)
        {
            var paciente = await _pacienteService.GetPacienteAsync(id);

            return Ok(paciente);
        }


        [HttpGet]
        public async Task<IActionResult> GetPacientes(
            [FromQuery] int? obraSocialId,
            [FromQuery] bool? activo,
            [FromQuery] bool? tienePagosPendientes)

        {
            
            var pacientes = await _pacienteService.GetPacientesAsync(obraSocialId, activo, tienePagosPendientes);
            return Ok(pacientes);
        }

        [Authorize(Roles = "Admin,Secretaria")]
        [HttpPost]
        public async Task<IActionResult> CrearPaciente([FromBody] PacienteDTO pacienteDto)
        {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                var creado = await _pacienteService.CrearPacienteAsync(pacienteDto);
                pacienteDto.Activo = true;
                if (creado == null)
                    return BadRequest("No se pudo crear el paciente.");
               return Ok(creado);
        }

        [Authorize(Roles = "Admin,Secretaria")]
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPaciente(int id, [FromBody] PacienteDTO paciente)
        {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
             
                var actualizado = await _pacienteService.ActualizarPacienteAsync(id,paciente);
                return Ok(actualizado);
        }

        [Authorize(Roles = "Admin,Secretaria")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPaciente(int id)
        {
              var eliminado = await _pacienteService.EliminarPacienteAsync(id);
             
              return NoContent();
        }

        [HttpGet("buscar")]
        public async Task<ActionResult<IEnumerable<PacienteSimpleDto>>> BuscarPacientes([FromQuery] string query)
        {
            var pacientes = await _pacienteService.BuscarPacientesAsync(query);
            return Ok(pacientes);
        }

        [HttpGet("{id}/detalles")]
        public async Task<ActionResult<PacienteDetalleDTO>> GetPacienteDetallesAsync(int id)
        {
            try
            {
                var pacienteDetalle = await _pacienteService.GetPacienteDetallesAsync(id);

                return Ok(pacienteDetalle);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Ocurrió un error al obtener los detalles del paciente. {ex.Message}");
            }
        }

        [HttpGet("check-dni")]
        public async Task<IActionResult> CheckDni([FromQuery] string dni)
        {
            if (string.IsNullOrEmpty(dni))
            {
                return BadRequest(new { message = "DNI no provisto." });
            }
            var exists = await _pacienteService.CheckDniExistsAsync(dni);

          
            return Ok(new { exists = exists });
        }

        [HttpGet("paginated")]
        public async Task<ActionResult<PagedResult<PacienteDTO>>> GetPacientesPaginados(
    [FromQuery] int pagina = 1,
    [FromQuery] int tamanio = 10,
    [FromQuery] string? busqueda = null,
    [FromQuery] int? obraSocialId = null,
    [FromQuery] bool? activo = null,
    [FromQuery] bool? tienePagosPendientes = null)
        {
            var result = await _pacienteService.GetPacientesPaginadosAsync(
                pagina, tamanio, busqueda, obraSocialId, activo, tienePagosPendientes);

            return Ok(result);
        }




    }
}

