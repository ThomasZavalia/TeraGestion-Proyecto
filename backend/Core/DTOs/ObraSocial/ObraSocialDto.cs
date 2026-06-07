using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.ObraSocial
{
    public class ObraSocialDto
    {


        public int Id { get; set; }
        public string Nombre { get; set; }
        public decimal PrecioTurno { get; set; }

        public bool Activa { get; set; }
    }
}
