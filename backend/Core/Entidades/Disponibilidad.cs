using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Disponibilidad
    {
        [Key] 
        public int Id { get; set; }

        [Required]
        public DayOfWeek DiaSemana { get; set; } 

        public bool Disponible { get; set; } = true; 
        
        public TimeSpan? HoraInicio { get; set; }
        public TimeSpan? HoraFin { get; set; }

       
        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey("UsuarioId")]
        public virtual Usuario Usuario { get; set; }
    }
}
    

