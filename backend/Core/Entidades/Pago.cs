using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Pago
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal? Monto { get; set; }
        public string MetodoPago { get; set; } 
        public int TurnoId { get; set; }
        public Turno Turno { get; set; }
        public bool? Anulado { get; set; }

        /// <summary>
        /// Porcentaje del terapeuta fijado en el momento del cobro.
        /// Garantiza que los reportes históricos no se vean afectados
        /// por cambios futuros en el porcentaje del profesional.
        /// </summary>
        public decimal? PorcentajeTerapeutaAplicado { get; set; }
    }
}
