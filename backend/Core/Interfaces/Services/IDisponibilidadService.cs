using Core.DTOs.Disponiblidad.Input;
using Core.DTOs.Disponiblidad.Output;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IDisponibilidadService
    {
        Task<IEnumerable<DisponibilidadDto>> GetDisponibilidadAsync(int userId);
        Task UpdateDisponibilidadAsync(int userId, DisponibilidadUpdateDto dto);
    }
}
