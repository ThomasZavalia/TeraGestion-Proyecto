using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IPagosRepository : IRepository<Entidades.Pago>
    {

        Task<IEnumerable<Pago>> GetPagosFiltradosAsync(DateTime? fechaDesde, DateTime? fechaHasta, int? pacienteId);
        Task<(IEnumerable<Pago> pagos, int total)> GetPagosPaginadosYFiltradosAsync(
    int pagina, int tamanio, string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago);
        Task<(IEnumerable<Pago> Items, int Total)> GetPaginadosPorPacienteAsync(
    int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, string? metodoPago);
    }
}
