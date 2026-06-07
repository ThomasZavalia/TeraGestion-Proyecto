using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Usuario.Input
{
    public class ReiniciarClaveDto
    {
        public string Token { get; set; }
        public string NuevaPassword { get; set; }
        public string ConfirmarPassword { get; set; }
    }
}
