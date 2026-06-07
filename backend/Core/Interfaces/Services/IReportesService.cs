using Core.DTOs.Reportes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IReportesService
    {
        public Task<IEnumerable<ReporteTopPacienteDto>> GetTopPacientes(DateTime? fechaDesde = null, DateTime? fechaHasta = null);
        public Task<IEnumerable<ReporteMetodoPagoDto>> GetMetodosPagoDto(DateTime? fechaDesde = null, DateTime? fechaHasta = null);
        public Task<IEnumerable<ReporteEstadoDto>> GetTurnoPorEstado(DateTime? fechaDesde = null, DateTime? fechaHasta = null);
        public Task<IEnumerable<ReporteMesDto>> GetIngresosPorMes(DateTime? fechaDesde = null, DateTime? fechaHasta = null);
        public Task<IEnumerable<ReporteMesDto>> GetTurnosPorMes(DateTime? fechaDesde = null, DateTime? fechaHasta = null);
        Task<IEnumerable<ReporteEstadoDto>> GetTurnosPorObraSocial(DateTime? fechaDesde = null, DateTime? fechaHasta = null);

        Task<byte[]> GenerarExcelReporteCompleto(DateTime? fechaDesde, DateTime? fechaHasta);

        Task<ReporteTerapeutaDto> GetRendimientoTerapeutaAsync(int terapeutaId, DateTime? fechaDesde = null, DateTime? fechaHasta = null);



    }
}
