using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Usuario.Output
{
    public class TerapeutaListaDto
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; }

        public string? Titulo { get; set; }
        public string? Especialidad { get; set; }

       
        public string NombreCompletoProfesional => string.IsNullOrWhiteSpace(Titulo)
            ? NombreCompleto
            : $"{Titulo} {NombreCompleto}";
    }
}
