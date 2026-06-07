using Core.DTOs.Ausencia.Output;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IAusenciaService
    {
        Task<AusenciaDto> CrearAusenciaAsync(int usuarioId, AusenciaDto dto);
        Task<IEnumerable<AusenciaDto>> GetAusenciasAsync(int usuarioId);
        Task<bool> EliminarAusenciaAsync(int id);
    }
}
