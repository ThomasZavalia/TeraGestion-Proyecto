using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Reportes
{
    public  class ReporteTopPacienteDto
    {

        public string Paciente { get; set; } = string.Empty;
        public int Turnos { get; set; }
    }
}
