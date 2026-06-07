using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Sesion
    {
        public int Id { get; set; }
        public DateTime FechaHoraInicio { get; set; }

        public string Asistencia { get; set; } 
        public string? Notas { get; set; }

        public int PacienteId { get; set; }

        public Paciente Paciente { get; set; }
        public int TurnoId { get; set; }
        public Turno Turno { get; set; }




    }
}
