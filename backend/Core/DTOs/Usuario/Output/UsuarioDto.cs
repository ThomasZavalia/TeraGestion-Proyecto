using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Usuario.Output
{
    public class UsuarioDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Rol { get; set; }

        
        public string? Nombre { get; set; }
        public string? Apellido { get; set; }
        public bool Activo { get; set; }

        public decimal PorcentajeGanancia { get; set; }

        public string? Titulo { get; set; }
        public string? Especialidad { get; set; }

        public string NombreCompletoProfesional =>
   string.IsNullOrWhiteSpace(Titulo)
       ? $"{Nombre} {Apellido}"
       : $"{Titulo} {Nombre} {Apellido}";
    }
}
