using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Reportes
{
    public class ReporteMesDto
    {
        public string Mes { get; set; }
        public decimal Valor { get; set; }
        public decimal TotalFacturado { get; set; }
        public decimal PagoTerapeutas { get; set; }
        public decimal GananciaClinica { get; set; }
    }
}
