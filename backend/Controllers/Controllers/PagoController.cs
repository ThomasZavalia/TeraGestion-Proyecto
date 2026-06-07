using Core.DTOs;
using Core.DTOs.Pago.Output;
using Core.Entidades;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SQLitePCL;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Secretaria")]
    public class PagoController : ControllerBase
    {

        private readonly IPagoService _pagoService;
        public PagoController(IPagoService pagoService)
        {
            _pagoService = pagoService;
        }
        
        

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPago(int id)
        {
            try
            {
                var pagoEncontrado = await _pagoService.GetPago(id);

                return Ok(pagoEncontrado);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }



        [HttpGet]
        public async Task<IActionResult> GetPagos()
        {
            try
            {
                var pagos = await _pagoService.GetPagos();
                return Ok(pagos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }



        [HttpPost]
        public async Task<IActionResult> CrearPago([FromBody] PagoDto pago)
        {
           
                var nuevoPago = await _pagoService.CrearPago(pago);
                return Ok(nuevoPago);
          
        }




        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarPago(int id, [FromBody] Core.Entidades.Pago pago)
        {
            throw new NotImplementedException();
        }




        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarPago(int id)
        {
            
                var eliminado = await _pagoService.EliminarPago(id);
            return NoContent();
        }

        [HttpGet("pagos-filtrados")]
        public async Task<IActionResult> GetPagos(
            [FromQuery] DateTime? fechaDesde,
            [FromQuery] DateTime? fechaHasta,
            [FromQuery] int? pacienteId)
        {
            var pagos = await _pagoService.GetPagosAsync(fechaDesde, fechaHasta, pacienteId);
            return Ok(pagos); 
        }

        [HttpGet("paginated")]
        [Authorize(Roles = "Admin,Secretaria")] 
        public async Task<ActionResult<PagedResult<PagoDto>>> GetPagosPaginados(
    [FromQuery] int pagina = 1,
    [FromQuery] int tamanio = 10,
    [FromQuery] string? busqueda = null,
    [FromQuery] DateTime? fechaDesde = null,
    [FromQuery] DateTime? fechaHasta = null,
    [FromQuery] string? metodoPago = null)
        {
            var result = await _pagoService.GetPagosPaginadosAsync(
                pagina, tamanio, busqueda, fechaDesde, fechaHasta, metodoPago);

            return Ok(result);
        }

        [HttpPut("{id}/anular")]
        [Authorize(Roles = "Admin,Secretaria")]
        public async Task<IActionResult> AnularPago(int id)
        {
            var resultado = await _pagoService.AnularPagoAsync(id);

            if (!resultado)
                return BadRequest(new { message = "No se pudo anular el pago. Es posible que no exista o ya esté anulado." });

            return Ok(new { message = "Pago anulado correctamente. El turno vuelve a estar Pendiente de cobro." });
        }

        [HttpGet("exportar-excel")]
        [Authorize(Roles = "Admin,Secretaria")]
        public async Task<IActionResult> ExportarPagosExcel(
    [FromQuery] string? busqueda = null,
    [FromQuery] DateTime? fechaDesde = null,
    [FromQuery] DateTime? fechaHasta = null,
    [FromQuery] string? metodoPago = null)
        {
            try
            {
                var excelBytes = await _pagoService.ExportarExcelAsync(busqueda, fechaDesde, fechaHasta, metodoPago);

                string fileName = $"Reporte_Pagos_{DateTime.Now:yyyyMMdd}.xlsx";

                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al generar el archivo Excel.", error = ex.Message });
            }
        }

        [HttpGet("paciente/{pacienteId}")]
        public async Task<IActionResult> GetPagosDePaciente(
    int pacienteId,
    [FromQuery] int pagina = 1,
    [FromQuery] int tamanio = 5,
    [FromQuery] DateTime? desde = null,
    [FromQuery] DateTime? hasta = null,
    [FromQuery] string? metodoPago = null)
        {
            var resultado = await _pagoService.GetPagosPaginadosAsync(
                pacienteId, pagina, tamanio, desde, hasta, metodoPago);
            return Ok(resultado);
        }
    }


}
