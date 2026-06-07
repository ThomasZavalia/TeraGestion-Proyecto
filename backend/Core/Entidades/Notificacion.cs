using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Notificacion
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; } 
        public string Titulo { get; set; } 
        public string Mensaje { get; set; } 
        public bool Leida { get; set; } = false;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

       
        public int? ReferenciaId { get; set; }
        public string Tipo { get; set; } 

        
        public Usuario Usuario { get; set; }
    }
}
