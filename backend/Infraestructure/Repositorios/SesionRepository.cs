using Core.Entidades;
using Core.Interfaces.Repositorios;
using Infraestructure;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositorios
{
    public class SesionRepository : ISesionRepository
    {
        private readonly TeraDbContext _context;

        public SesionRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task<Sesion> Actualizar(Sesion sesion)
        {
            
           
           _context.Entry(sesion).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return sesion;
        }



        public async Task<Sesion> Agregar(Sesion sesion)
        {

           await _context.Sesiones.AddAsync(sesion);
            await _context.SaveChangesAsync();


            return sesion;
        }



        public async Task<bool> Eliminar(int id)
        {
            var sesionEncontrada = await _context.Sesiones.FindAsync(id);
            if (sesionEncontrada == null)
            {
                return false; 
            }


            _context.Sesiones.Remove(sesionEncontrada);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Sesion>? GetById(int id)
        {
            var sesionExistente = await _context.Sesiones.FindAsync(id);
            if (sesionExistente == null)
            {
                return null;
            }
            return sesionExistente;
        }

        public async Task<IEnumerable<Sesion>> ObtenerTodos()
        {
            return await _context.Sesiones.ToListAsync();
        }

        public async Task<Sesion?> GetByTurnoIdAsync(int turnoId)
        {
            
            return await _context.Sesiones
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(s => s.TurnoId == turnoId);
        }

        public async Task<(IEnumerable<Sesion> Items, int Total)> GetPaginadasPorPacienteAsync(
     int pacienteId,
     int pagina,
     int tamanio,
     DateTime? desde,
     DateTime? hasta,
     int? terapeutaId,
     string? asistencia)
        {
            var query = _context.Sesiones
                .Where(s => s.PacienteId == pacienteId)
                .AsQueryable();

            if (desde.HasValue) query = query.Where(s => s.FechaHoraInicio >= desde.Value);
            if (hasta.HasValue) query = query.Where(s => s.FechaHoraInicio <= hasta.Value);

            if (terapeutaId.HasValue) query = query.Where(s => s.Turno.TerapeutaId == terapeutaId.Value);

            if (!string.IsNullOrWhiteSpace(asistencia)) query = query.Where(s => s.Asistencia == asistencia);

            int total = await query.CountAsync();

            var items = await query
                .OrderByDescending(s => s.FechaHoraInicio)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .Include(s => s.Turno).ThenInclude(t => t.Terapeuta)
                .ToListAsync();

            return (items, total);
        }

    }
}
