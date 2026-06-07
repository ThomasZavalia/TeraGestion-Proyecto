using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Public
{
    public class ReservaDto
    {
        [Required]
        public DateTime FechaHora { get; set; } 

        [Required]
        public string Nombre { get; set; }
        [Required]
        public string Apellido { get; set; }
        [Required]
        [RegularExpression("^[0-9]{7,8}$", ErrorMessage = "DNI inválido")]
        public string DNI { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; } 
        public string? Telefono { get; set; }

        public int? ObraSocialId { get; set; }
        public string? RecaptchaToken { get; set; }

        public int TerapeutaId { get; set; }


    }
}
