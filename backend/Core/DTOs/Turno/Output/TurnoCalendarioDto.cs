using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Turno.Output
{
    public class TurnoCalendarioDto
    {
        public int Id { get; set; }


        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public string Title { get; set; }

        public string Estado { get; set; }
        public decimal? Precio { get; set; }
        public int PacienteId { get; set; }

        public string PacienteNombre { get; set; }
        public string PacienteApellido { get; set; }
        public int? ObraSocialId { get; set; }
        public DateTime FechaHora { get; set; }
        public int Duracion { get; set; }

        public int TerapeutaId { get; set; }

        public string TerapeutaNombre { get; set; }
        public string TerapeutaApellido { get; set; }

        public bool EstaPagado { get; set; }


    }
}
