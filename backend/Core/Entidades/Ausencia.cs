using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Entidades
{
    public class Ausencia
    {

        public int Id { get; set; }
        public DateTime Fecha { get; set; } 
        public string Motivo { get; set; } 

        public int UsuarioId { get; set; } 
        public Usuario Usuario { get; set; }
    }
}
