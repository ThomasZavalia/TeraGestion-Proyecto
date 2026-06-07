using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportesController : ControllerBase
    {

        private readonly IReportesService _reportesService;
        public ReportesController(IReportesService reportesService)
        {
            _reportesService = reportesService;
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("top-pacientes")]
        public async Task<IActionResult> GetTopPacientes([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var topPacientes = await _reportesService.GetTopPacientes(fechaDesde, fechaHasta);
            return Ok(topPacientes);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("metodos-pago")]
        public async Task<IActionResult> GetMetodosPago([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var metodosPago = await _reportesService.GetMetodosPagoDto(fechaDesde, fechaHasta);
            return Ok(metodosPago);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("turnos-por-estado")]
        public async Task<IActionResult> GetTurnosPorEstado([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var turnosPorEstado = await _reportesService.GetTurnoPorEstado(fechaDesde, fechaHasta);
            return Ok(turnosPorEstado);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("turnos-por-mes")]
        public async Task<IActionResult> GetTurnosPorMes([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var turnosPorMes = await _reportesService.GetTurnosPorMes(fechaDesde, fechaHasta);
            return Ok(turnosPorMes);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("ingresos-por-mes")]
        public async Task<IActionResult> GetIngresosPorMes([FromQuery]DateTime? fechaDesde = null, [FromQuery]DateTime? fechaHasta = null)
        {
            var ingresosPorMes = await _reportesService.GetIngresosPorMes(fechaDesde, fechaHasta);
            return Ok(ingresosPorMes);
        }
        [Authorize(Roles = "Admin")]
        [HttpGet("turnos-por-obrasocial")]
        public async Task<IActionResult> GetTurnosPorObraSocial([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var reporte = await _reportesService.GetTurnosPorObraSocial(fechaDesde, fechaHasta);
            return Ok(reporte);
        }

        [HttpGet("exportar-excel")]
        public async Task<IActionResult> ExportarReportes([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            try
            {
                var archivoContent = await _reportesService.GenerarExcelReporteCompleto(fechaDesde, fechaHasta);

                string nombreArchivo = $"Reporte_TeraGestion_{DateTime.Now:yyyyMMdd}.xlsx";
                string tipoContenido = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                return File(archivoContent, tipoContenido, nombreArchivo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error al generar el reporte: " + ex.Message);
            }
        }

        [HttpGet("mi-rendimiento")]
        [Authorize(Roles = "Terapeuta")]
      
        public async Task<IActionResult> GetMiRendimiento([FromQuery] DateTime? fechaDesde = null, [FromQuery] DateTime? fechaHasta = null)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var reporte = await _reportesService.GetRendimientoTerapeutaAsync(userId, fechaDesde, fechaHasta);

            return Ok(reporte);
        }


    }
}
