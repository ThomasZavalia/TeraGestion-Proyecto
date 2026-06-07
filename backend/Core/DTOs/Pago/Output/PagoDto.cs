using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Pago.Output
{
    public class PagoDto
    {

        public int Id { get; set; }

        [Required]
        public DateTime Fecha { get; set; }
        [Required]
        public decimal? Monto { get; set; }
        [Required]
        public string MetodoPago { get; set; }
        [Required]
        public int TurnoId { get; set; }

        public string PacienteNombre { get; set; }
        public string PacienteApellido { get; set; }

        public DateTime? FechaTurno { get; set; }
        public string TerapeutaTurno { get; set; }

        public decimal? PorcentajeTerapeutaAplicado { get; set; }
    }
}
