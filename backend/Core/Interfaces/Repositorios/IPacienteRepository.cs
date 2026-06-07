using Core.DTOs;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IPacienteRepository : IRepository<Entidades.Paciente>
    {

        Task<IEnumerable<Paciente>> BuscarAsync(string query);

        Task<Paciente> GetDetallesByIdAsync(int id);

        Task<IEnumerable<Paciente>> ObtenerTodosAsync(int? obraSocialId, bool? activo, bool? tienePagosPendientes);


        
        Task<Paciente> Actualizar(int id, Paciente entity);


        Task<(IEnumerable<Paciente> pacientes, int total)> GetPacientesPaginadosYFiltradosAsync(
     int pagina, int tamanio, string? busqueda, int? obraSocialId, bool? activo, bool? tienePagosPendientes);
    }
}
