using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public  class ObraSocial
    {

        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal PrecioTurno { get; set; }

        public bool Activa { get; set; } = true;

        public ICollection<Paciente> Pacientes { get; set; } = new List<Paciente>();
        public ICollection<Turno> Turnos { get; set; }
    }
}
