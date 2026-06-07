using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface ITurnoRepository : IRepository<Entidades.Turno>
    {
        Task<Turno?> GetByIdConPaciente(int id);

        Task<IEnumerable<Turno>> GetTurnosByDayAsync(DateTime date);
        Task<bool> ExisteTurnoPorPacienteYFecha(int pacienteId, DateTime fecha);

       Task<IEnumerable<Turno>> GetTurnosByDayAndTerapeutaAsync(DateTime fecha, int terapeutaId);

        Task<IEnumerable<Turno>> GetTurnosByTerapeutaAsync(int terapeutaId);

        Task<IEnumerable<Turno>> ObtenerPorRangoAsync(DateTime inicio, DateTime fin, int? terapeutaId = null);

   
        Task<IEnumerable<(string Paciente, int Turnos)>> GetTopPacientesReporteAsync();
        Task<IEnumerable<Turno>> GetTurnosHistoricoTerapeutaAsync(int terapeutaId);

        Task<(IEnumerable<Turno> turnos, int totalItems)> GetTurnosPendientesPagoPaginadosAsync(int pacienteId, int pagina, int tamanio);
        Task<int> GetCantidadTurnosPendientesPagoAsync(int pacienteId);
    }
}
