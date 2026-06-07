using Core.DTOs.Public;
using Core.DTOs.Turno.Input;
using Core.DTOs.Turno.Output;
using Core.Entidades;
using Core.Interfaces.Repositorios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Core.DTOs;
using Core.DTOs.Paciente;

namespace Core.Interfaces.Services
{
    public interface ITurnoService
    {
        public Task<TurnoDto> GetTurnoAsync(int id);
        public Task<IEnumerable<TurnoCalendarioDto>> GetTurnosAsync(DateTime start, DateTime end);
        
            
        public Task<TurnoCalendarioDto> CrearTurnoAsync(TurnoDtoCreacion turnoDto);
        public Task<TurnoCalendarioDto> ActualizarTurnoAsync(int id, TurnoDtoActualizar turno);
        public Task<bool> EliminarTurnoAsync(int id);
        public Task<IEnumerable<Turno>> GetTurnosSinDto();

        public Task MarcarComoPagadoAsync(int turnoId, string metodo);

        Task<IEnumerable<string>> GetAvailableSlotsAsync(DateTime date,int terapeutaId);

        Task<IEnumerable<TurnoCalendarioDto>> GetTurnosDelDiaAsync(DateTime date);
        Task<TurnoDetalleDto> GetTurnoDetalleAsync(int id);

        Task<TurnoCalendarioDto> ReprogramarTurnoAsync(int id, DateTime nuevaFecha);
        Task<TurnoCalendarioDto> ReservarTurnoPublicoAsync(ReservaDto dto);

        Task<bool> ConfirmarTurnoAsync(int id,string token);
        Task<bool> RevertirEstadoTurnoAsync(int turnoId);

        Task<PagedResult<Core.DTOs.Paciente.TurnoPendientePagoDto>> GetTurnosPendientesPagoPaginadosAsync(int pacienteId, int pagina, int tamanio);




    }
}
