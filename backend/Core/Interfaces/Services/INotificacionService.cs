using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface INotificacionService
    {
        Task CrearNotificacionAsync(int usuarioDestinoId, string titulo, string mensaje, int? referenciaId = null);
    }
}
