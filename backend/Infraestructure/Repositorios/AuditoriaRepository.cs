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
    public class AuditoriaRepository : IAuditoriaRepository
    {
        private readonly TeraDbContext _context;

        public AuditoriaRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task RegistrarAsync(Auditoria auditoria)
        {
            await _context.Auditorias.AddAsync(auditoria);
            await _context.SaveChangesAsync();
        }

        public async Task<(IEnumerable<Auditoria> items, int total)> GetAuditoriasPaginadasAsync(
            int pagina,
            int tamanio,
            DateTime? fechaDesde = null,
            DateTime? fechaHasta = null,
            int? usuarioId = null,
            string? modulo = null,
            string? accion = null)
        {
            var query = _context.Auditorias.AsQueryable();

            if (fechaDesde.HasValue)
            {
                var desdeUtc = DateTime.SpecifyKind(fechaDesde.Value, DateTimeKind.Utc);
                query = query.Where(a => a.FechaHora >= desdeUtc);
            }

            if (fechaHasta.HasValue)
            {
                var hastaUtc = DateTime.SpecifyKind(fechaHasta.Value, DateTimeKind.Utc).AddDays(1).AddTicks(-1);
                query = query.Where(a => a.FechaHora <= hastaUtc);
            }

            if (!fechaDesde.HasValue && !fechaHasta.HasValue)
            {
                var haceTresDias = DateTime.UtcNow.AddDays(-3);
                query = query.Where(a => a.FechaHora >= haceTresDias);
            }

            if (usuarioId.HasValue)
                query = query.Where(a => a.UsuarioId == usuarioId.Value);

            if (!string.IsNullOrWhiteSpace(modulo))
                query = query.Where(a => a.Modulo == modulo);

            if (!string.IsNullOrWhiteSpace(accion))
                query = query.Where(a => a.Accion == accion);

            int total = await query.CountAsync();

            var items = await query
                .OrderByDescending(a => a.FechaHora)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (items, total);
        }
    }
}


