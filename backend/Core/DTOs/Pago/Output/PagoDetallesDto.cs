using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Pago.Output
{
    public class PagoDetallesDto
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal? Monto { get; set; } 
        public string MetodoPago { get; set; }
        public int TurnoId { get; set; } 

       
        public int PacienteId { get; set; }
        public string PacienteNombre { get; set; }
        public string PacienteApellido { get; set; }

        public DateTime? FechaTurno { get; set; }
        public string TerapeutaTurno { get; set; }
    }
}
