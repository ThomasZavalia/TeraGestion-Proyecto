using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IAuditoriaService
    {
        Task RegistrarAsync(string accion, string modulo, string entidad, int? entidadId, string descripcion);
    }
}
