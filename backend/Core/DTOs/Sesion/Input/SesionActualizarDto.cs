using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Sesion.Input
{
    public class SesionActualizarDto
    {

        
        public string Notas { get; set; } 

        [RegularExpression("^(Presente|Ausente)$", ErrorMessage = "El estado de asistencia debe ser 'Presente' o 'Ausente'.")]
        public string Asistencia { get; set; } 
    }
}
