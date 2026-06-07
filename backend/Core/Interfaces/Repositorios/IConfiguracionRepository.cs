using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IConfiguracionRepository
    {
        Task<int> GetDuracionSesionAsync(int usuarioId);
        Task UpdateDuracionSesionAsync(int usuarioId, int minutos);
    }
}
