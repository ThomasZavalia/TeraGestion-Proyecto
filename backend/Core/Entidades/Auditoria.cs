using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Auditoria
    {
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        public string UsuarioNombre { get; set; }
        public string UsuarioRol { get; set; }

        public string Accion { get; set; }
        public string Modulo { get; set; }
        public string Entidad { get; set; }
        public int? EntidadId { get; set; }

        public DateTime FechaHora { get; set; }

        public string Descripcion { get; set; }
        public string? ValoresAnteriores { get; set; }
        public string? ValoresNuevos { get; set; }

        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
    }
}
