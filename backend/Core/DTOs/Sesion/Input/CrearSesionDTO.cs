using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Sesion.Input
{
    public class CrearSesionDTO
    {

        public DateTime Fecha { get; set; }
        public int TurnoId { get; set; }
        public int PacienteId { get; set; }
    }
}






