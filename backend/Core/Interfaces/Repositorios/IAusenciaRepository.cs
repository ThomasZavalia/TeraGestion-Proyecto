using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IAusenciaRepository:IRepository<Ausencia>
    {
        Task<IEnumerable<Ausencia>> GetByUsuarioIdAsync(int usuarioId);
        Task<Ausencia?> GetByFechaAndUsuarioAsync(DateTime fecha, int usuarioId);
    }
}
