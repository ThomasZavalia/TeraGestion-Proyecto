using Core.DTOs.Ausencia.Output;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/usuario/me/ausencias")] 
    [ApiController]
    [Authorize]
    public class AusenciaController : ControllerBase
    {
        private readonly IAusenciaService _ausenciaService;

        public AusenciaController(IAusenciaService ausenciaService)
        {
            _ausenciaService = ausenciaService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMisAusencias()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var ausencias = await _ausenciaService.GetAusenciasAsync(userId);
            return Ok(ausencias);
        }

        [HttpPost]
        public async Task<IActionResult> CrearAusencia([FromBody] AusenciaDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId)) return Unauthorized();

            var nuevaAusencia = await _ausenciaService.CrearAusenciaAsync(userId, dto);
            return Ok(nuevaAusencia);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarAusencia(int id)
        {
            var resultado = await _ausenciaService.EliminarAusenciaAsync(id);
            if (!resultado) return NotFound();
            return NoContent();
        }
    }
}
