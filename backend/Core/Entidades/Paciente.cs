using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Paciente
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Telefono { get; set; }
        public string? Email { get; set; }
        public string DNI { get; set; }

        public int? ObraSocialId { get; set; }  
        public ObraSocial ObraSocial { get; set; }

        public bool Activo { get; set; } = true;

        public ICollection<Turno> Turnos { get; set; } = new List<Turno>();

        public ICollection<Sesion> Sesiones { get; set; } = new List<Sesion>();

    }
}
