using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Reportes
{
    public class ReporteMetodoPagoDto
    {
        public string MetodoPago { get; set; } = string.Empty;
        public int Cantidad { get; set; }
    }
}
