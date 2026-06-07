using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Reportes
{
    public class ReporteTerapeutaDto
    {
        public int TurnosAtendidosMes { get; set; }
        public int PacientesUnicosMes { get; set; }
        public double TasaAsistencia { get; set; }
        public List<TopPacienteDto> TopPacientes { get; set; } = new List<TopPacienteDto>();
        public decimal? GananciasEstimadasMes { get; set; }

        public List<ReporteMesDto> EvolucionGanancias { get; set; } = new List<ReporteMesDto>();
        public List<ReporteEstadoDto> DistribucionEstados { get; set; } = new List<ReporteEstadoDto>();
    }
}
