using Core.DTOs.ObraSocial;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ObraSocialController : ControllerBase
    {

        private readonly IObraSocialService _obraSocialService;

        public ObraSocialController(IObraSocialService obraSocialService)
        {
            _obraSocialService = obraSocialService;
        }


        [HttpGet]
        public async Task<IActionResult> GetObrasSociales()
        {
            
            var obrasSociales = await _obraSocialService.GetObrasSocialesAdminAsync();
            return Ok(obrasSociales);
        }


        [HttpGet("{id}/precio")]
        public async Task<IActionResult> GetPrecioTurno(int id)
        {
            var precio = await _obraSocialService.CalcularPrecioTurnoAsync(id);
            
            return Ok(new { precio = precio });
        }

        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetObraSocial(int id)
        {
            var obraSocial = await _obraSocialService.GetByIdAsync(id);
            if (obraSocial == null) return NotFound();
            return Ok(obraSocial);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CrearObraSocial([FromBody] ObraSocialDto obraSocialDto)
        {
            var nuevaObraSocial = await _obraSocialService.CrearObraSocialAsync(obraSocialDto);
            return CreatedAtAction(nameof(GetObraSocial), new { id = nuevaObraSocial.Id }, nuevaObraSocial);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarObraSocial(int id, [FromBody] ObraSocialDto obraSocialDto)
        {
            var obraSocialActualizada = await _obraSocialService.ActualizarObraSocialAsync(id, obraSocialDto);
            return Ok(obraSocialActualizada);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarObraSocial(int id)
        {
            await _obraSocialService.EliminarObraSocialAsync(id);
            return NoContent();
        }

        [HttpGet("activas")]
        public async Task<IActionResult> GetObrasSocialesActivas()
        {
           
            var obrasSociales = await _obraSocialService.GetObrasSocialesAsync();
            return Ok(obrasSociales);
        }
    }
}

