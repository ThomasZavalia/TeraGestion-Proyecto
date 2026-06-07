using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Sesion.Input
{
    
        public class SesionAsistenciaDto
        {
            [Required]
            public int TurnoId { get; set; }
            [Required]
            public string Asistencia { get; set; } 
        }
    
}
