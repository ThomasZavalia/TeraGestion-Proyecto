using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Usuario.Input
{
    public class UsuarioActualizarDto
    {

        public string Username { get; set; }
        public string Email { get; set; }
        public string Rol { get; set; }


        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public bool Activo { get; set; }

        [Range(0, 100, ErrorMessage = "El porcentaje debe estar entre 0 y 100.")]
        public decimal PorcentajeGanancia { get; set; }

        public string? Titulo { get; set; }
        public string? Especialidad { get; set; }

       
    }
}
