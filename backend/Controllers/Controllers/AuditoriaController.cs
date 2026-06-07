using Core.Interfaces.Repositorios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")] 
    public class AuditoriaController : ControllerBase
    {
        private readonly IAuditoriaRepository _auditoriaRepository;

        public AuditoriaController(IAuditoriaRepository auditoriaRepository)
        {
            _auditoriaRepository = auditoriaRepository;
        }

        [HttpGet("paginated")]
        public async Task<IActionResult> GetAuditoriasPaginadas(
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanio = 10,
            [FromQuery] DateTime? fechaDesde = null,
            [FromQuery] DateTime? fechaHasta = null,
            [FromQuery] int? usuarioId = null,
            [FromQuery] string? modulo = null,
            [FromQuery] string? accion = null)
        {
            var (items, total) = await _auditoriaRepository.GetAuditoriasPaginadasAsync(
                pagina, tamanio, fechaDesde, fechaHasta, usuarioId, modulo, accion);

            int totalPages = (int)Math.Ceiling(total / (double)tamanio);

            return Ok(new
            {
                items,
                totalItems = total,
                totalPages,
                currentPage = pagina
            });
        }
    }
}

