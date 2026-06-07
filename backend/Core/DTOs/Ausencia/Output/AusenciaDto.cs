using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Ausencia.Output
{
    public class AusenciaDto
    {
        public int Id { get; set; }

        [Required]
        public DateTime Fecha { get; set; } 

        [Required]
        public string Motivo { get; set; }
    }
}
