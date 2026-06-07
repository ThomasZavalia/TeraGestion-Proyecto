using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Disponiblidad.Output
{
    public class DisponibilidadDto
    {
        public DayOfWeek DiaSemana { get; set; }
        public string DiaNombre { get; set; } 
        public bool Disponible { get; set; }
       
        public string HoraInicio { get; set; } 
        public string HoraFin { get; set; } 
        
    }
}
