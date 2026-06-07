using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Turno.Output
{
    public class TurnoDetalleDto
    {
        public int Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string PacienteNombre { get; set; } 
        public string Estado { get; set; } 
        public decimal Precio { get; set; }


        public string? Asistencia { get; set; }
        public string? NotasSesion { get; set; } 
        public int? SesionId { get; set; }

        public int TerapeutaId { get; set; }
        public string TerapeutaNombreCompleto { get; set; }

        public bool EstaPagado { get; set; }

        public string? TerapeutaNombreCompletoProfesional { get; set; }



    }
}
