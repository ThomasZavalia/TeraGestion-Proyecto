using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/configuracion")]
    [ApiController]
    [Authorize]
    public class ConfiguracionController : ControllerBase
    {
        private readonly IConfiguracionService _service;

        public ConfiguracionController(IConfiguracionService service)
        {
            _service = service;
        }

        [HttpGet("duracion")]
        public async Task<IActionResult> GetDuracion()
        {
            
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var duracion = await _service.GetDuracionAsync(userId);
            return Ok(new { duracion });
        }

        [HttpPut("duracion")]
        public async Task<IActionResult> UpdateDuracion([FromBody] int nuevaDuracion)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                await _service.ActualizarDuracionAsync(userId, nuevaDuracion);
                return Ok(new { message = "Duración actualizada." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}
