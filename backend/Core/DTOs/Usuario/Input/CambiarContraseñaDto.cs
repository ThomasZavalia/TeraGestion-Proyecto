using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Usuario.Input
{
    public class CambiarContraseñaDto
    {
        [Required(ErrorMessage = "La contraseña actual es requerida.")]
        public string ContraseñaActual { get; set; }

        [Required(ErrorMessage = "La nueva contraseña es requerida.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "La nueva contraseña debe tener al menos 6 caracteres.")]
        public string ContraseñaNueva { get; set; }

        [Compare("ContraseñaNueva", ErrorMessage = "La confirmación de contraseña no coincide.")]
        public string ConfirmarContraseñaNueva { get; set; }
    }
}
