using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Turno.Input
{
    public class TurnoDtoActualizar
    {

        public bool EsParticular { get; set; }
        public int? ObraSocialId { get; set; }
        public decimal? Precio { get; set; }
    }
}
