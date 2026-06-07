using Core.Entidades;
using Core.Interfaces.Repositorios;
using Infraestructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositorios
{
    public class PagoRepository : IPagosRepository
    {

        private readonly TeraDbContext _context;
        public PagoRepository(TeraDbContext context)
        {
            _context = context;
        }
        public async Task<Pago> Actualizar(Pago pago)
        {
            _context.Pagos.Update(pago);
            await _context.SaveChangesAsync();
            return pago;
        }

        public async Task<Pago> Agregar(Pago pago)
        {
            _context.Pagos.Add(pago);
            await _context.SaveChangesAsync();
            return pago;
        }

        public async Task<bool> Eliminar(int id)
        {
            var pagoEncontrado = await _context.Pagos.FindAsync(id);
            if (pagoEncontrado == null)
            {
                return false;
            }
            else
            {
                _context.Pagos.Remove(pagoEncontrado);
                await _context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<Pago>? GetById(int id)
        {
            return await _context.Pagos.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Pago>> ObtenerTodos()
        {
            return await _context.Pagos
                          .Include(p => p.Turno)
                          .ThenInclude(t => t.Terapeuta)
                          .ToListAsync();
        }

        public async Task<IEnumerable<Pago>> GetPagosFiltradosAsync(DateTime? fechaDesde, DateTime? fechaHasta, int? pacienteId)
        {

            IQueryable<Pago> query = _context.Pagos
                                             .Include(p => p.Turno)
                                                .ThenInclude(t => t.Paciente)
                                             .Include(p => p.Turno)
                                                .ThenInclude(t => t.Terapeuta)
                                             .AsNoTracking();


            if (fechaDesde.HasValue)
            {

                query = query.Where(p => p.Fecha.Date >= fechaDesde.Value.Date);
            }
            if (fechaHasta.HasValue)
            {

                query = query.Where(p => p.Fecha.Date <= fechaHasta.Value.Date);
            }
            if (pacienteId.HasValue)
            {
                query = query.Where(p => p.Turno.PacienteId == pacienteId.Value);
            }


            query = query.OrderByDescending(p => p.Fecha);

            return await query.ToListAsync();
        }

        public async Task<(IEnumerable<Pago> pagos, int total)> GetPagosPaginadosYFiltradosAsync(
    int pagina, int tamanio, string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago)
        {
            var query = _context.Pagos
                .Include(p => p.Turno)
                    .ThenInclude(t => t.Paciente)
                .Include(t=>t.Turno)
                    .ThenInclude(t => t.Terapeuta)
                .AsQueryable();

            query = query.Where(p => p.Anulado != true);

            if (string.IsNullOrWhiteSpace(busqueda) && !fechaDesde.HasValue && !fechaHasta.HasValue)
            {
                var fechaCalculada = DateTime.Now.AddDays(-3);

                var haceTresDias = DateTime.SpecifyKind(fechaCalculada, DateTimeKind.Unspecified);

                query = query.Where(p => p.Fecha >= haceTresDias);
            }

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                var b = busqueda.ToLower();
                query = query.Where(p => p.Turno.Paciente.Nombre.ToLower().Contains(b) ||
                                         p.Turno.Paciente.Apellido.ToLower().Contains(b) ||
                                         p.Turno.Paciente.DNI.Contains(b));
            }

            if (fechaDesde.HasValue)
            {
                var desdeLocal = DateTime.SpecifyKind(fechaDesde.Value, DateTimeKind.Unspecified);
                query = query.Where(p => p.Fecha >= desdeLocal);
            }

            if (fechaHasta.HasValue)
            {
                var hastaLocal = DateTime.SpecifyKind(fechaHasta.Value, DateTimeKind.Unspecified).AddDays(1).AddTicks(-1);
                query = query.Where(p => p.Fecha <= hastaLocal);
            }

            if (!string.IsNullOrWhiteSpace(metodoPago))
            {
                query = query.Where(p => p.MetodoPago == metodoPago);
            }
        
            int totalItems = await query.CountAsync();

            var pagosFiltrados = await query
                .OrderByDescending(p => p.Fecha)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (pagosFiltrados, totalItems);
        }


       
        public async Task<(IEnumerable<Pago> Items, int Total)> GetPaginadosPorPacienteAsync(
            int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, string? metodoPago)
        {
            var query = _context.Pagos
                .Include(p => p.Turno)
                .Where(p => p.Turno.PacienteId == pacienteId)
                .AsQueryable();

            if (desde.HasValue) query = query.Where(p => p.Fecha >= desde.Value);
            if (hasta.HasValue) query = query.Where(p => p.Fecha <= hasta.Value);
            if (!string.IsNullOrWhiteSpace(metodoPago)) query = query.Where(p => p.MetodoPago == metodoPago);

            int total = await query.CountAsync();

            var items = await query
                .OrderByDescending(p => p.Fecha)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (items, total);
        }

    }
}
