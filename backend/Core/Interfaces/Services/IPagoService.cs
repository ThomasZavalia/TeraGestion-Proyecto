using Core.DTOs;
using Core.DTOs.Paciente;
using Core.DTOs.Pago.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface IPagoService
    {
        public Task<PagoDto> GetPago(int id);
        public Task<IEnumerable<PagoDto>> GetPagos();
        public Task<PagoDto> CrearPago(PagoDto pago);
        public Task<Pago> ActualizarPago(Pago pago);
        public Task<bool> EliminarPago(int id);
        public Task<IEnumerable<Pago>> GetPagosSinDto();
        public Task<IEnumerable<PagoDetallesDto>> GetPagosAsync(DateTime? fechaDesde, DateTime? fechaHasta, int? pacienteId);
        Task<PagedResult<PagoDto>> GetPagosPaginadosAsync(
    int pagina, int tamanio, string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago);
        Task<bool> AnularPagoAsync(int id);
        Task<byte[]> ExportarExcelAsync(string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago);
        Task<PagedResult<PagoHistorialDTO>> GetPagosPaginadosAsync(
    int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, string? metodoPago);

    }
}
