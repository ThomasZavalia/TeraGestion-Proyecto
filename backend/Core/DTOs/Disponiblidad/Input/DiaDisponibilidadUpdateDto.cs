using Core.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Disponiblidad.Input
{
    public class DiaDisponibilidadUpdateDto
    {
        [Required]
        public DayOfWeek DiaSemana { get; set; }
        public bool Disponible { get; set; }

      
        [ValidTimeFormat] 
        public string? HoraInicio { get; set; } 

        [ValidTimeFormat] 
        public string? HoraFin { get; set; } 
     
    }

    public class DisponibilidadUpdateDto
    {
        public List<DisponibilidadDiaDto> Dias { get; set; } = new List<DisponibilidadDiaDto>();
    }
    public class DisponibilidadDiaDto
    {
        public DayOfWeek DiaSemana { get; set; } 
        public bool Disponible { get; set; }
        public string? HoraInicio { get; set; } 
        public string? HoraFin { get; set; }    
    }
}

