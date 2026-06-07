using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IDisponibilidadRepository
    {
        Task<IEnumerable<Disponibilidad>> GetByUserIdAsync(int userId);
        
        Task UpdateDisponibilidadAsync(IEnumerable<Disponibilidad> disponibilidades);

        Task<Disponibilidad?> GetByUserIdAndDayAsync(int userId, DayOfWeek dayOfWeek);

    }
}
