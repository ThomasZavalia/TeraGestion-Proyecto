using Core.Entidades;
using Core.Interfaces.Repositorios;
using Infraestructure;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositorios
{
    public class TurnoRepository : ITurnoRepository
    {
        private readonly TeraDbContext _context;

        public TurnoRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task<Turno> Actualizar(Turno turno)
        {
           
            _context.Entry(turno).State = EntityState.Modified;

         
            await _context.SaveChangesAsync();
            return turno;
        }

        public async Task<Turno> Agregar(Turno turno)
        {
            await _context.Turnos.AddAsync(turno);


            await _context.SaveChangesAsync();
            return turno;
        }

        public async Task<bool> Eliminar(int id)
        {
            var turnoExistente = await _context.Turnos.FindAsync(id);
            if (turnoExistente == null)
            {
                return false;
            }
            _context.Turnos.Remove(turnoExistente);
            await _context.SaveChangesAsync();
            return true;

        }



        public async Task<Turno?> GetById(int id)
        {
            return await _context.Turnos.Include(t=>t.Paciente)
                                        .Include(t=>t.Pagos)
                                 .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<IEnumerable<Turno>> ObtenerTodos()
        {
            return await _context.Turnos
                                   .Include(t => t.Paciente)
                                   .Include(t=>t.ObraSocial)
                                   .Include(t=>t.Terapeuta)
                                   .Include(t=> t.Pagos)
                                   .AsNoTracking()
                                   .ToListAsync();

        }

        public async Task<Turno?> GetByIdConPaciente(int id)
        {

            return await _context.Turnos
                                 .Include(t => t.Paciente)
                                 .Include(t=>t.Terapeuta)
                                 .Include(t=>t.ObraSocial)
                                 .Include(t=>t.Pagos)
                                 .FirstOrDefaultAsync(t => t.Id == id);
        }


        public async Task<IEnumerable<Turno>> GetTurnosByDayAsync(DateTime date)
        {

            return await _context.Turnos
                                  .Include(t => t.Paciente)
                                  .Where(t => t.FechaHora.Date == date.Date)
                                  .Include(t=>t.Pagos)
                                  .AsNoTracking()
                                  .ToListAsync();
        }



        public async Task<bool> ExisteTurnoPorPacienteYFecha(int pacienteId, DateTime fecha)
        {
            return await _context.Turnos
                .AnyAsync(t => t.PacienteId == pacienteId
                               && t.FechaHora.Date == fecha.Date
                               && t.Estado.ToLower() != "cancelado");
        }

        public async Task<IEnumerable<Turno>> GetTurnosByDayAndTerapeutaAsync(DateTime fecha, int terapeutaId)
        {
            return await _context.Turnos
                .Where(t => t.FechaHora.Date == fecha.Date && t.TerapeutaId == terapeutaId && t.Estado != "Cancelado")
                .ToListAsync();
        }

        public async Task<IEnumerable<Turno>> GetTurnosByTerapeutaAsync(int terapeutaId)
        {
            return await _context.Turnos
                .Include(t => t.Paciente)
                .Include(t => t.ObraSocial)
                .Include(t => t.Terapeuta)
                .Include(t => t.Pagos)
                .Where(t => t.TerapeutaId == terapeutaId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Turno>> ObtenerPorRangoAsync(DateTime inicio, DateTime fin, int? terapeutaId = null)
        {
            var query = _context.Turnos
                .Include(t => t.Paciente)
                .Include(t => t.Pagos) 
                .Where(t => t.FechaHora >= inicio && t.FechaHora <= fin)
                .AsQueryable();

            if (terapeutaId.HasValue && terapeutaId.Value > 0)
            {
                query = query.Where(t => t.TerapeutaId == terapeutaId.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<(string Paciente, int Turnos)>> GetTopPacientesReporteAsync()
        {
            var query = await _context.Turnos
                .AsNoTracking()
                .Where(t => t.Paciente != null)
                .GroupBy(t => new { t.Paciente.Nombre, t.Paciente.Apellido })
                .Select(g => new
                {
                    PacienteNombre = g.Key.Nombre + " " + g.Key.Apellido,
                    TurnosCount = g.Count()
                })
                .OrderByDescending(x => x.TurnosCount)
                .Take(5)
                .ToListAsync(); 

            return query.Select(q => (q.PacienteNombre, q.TurnosCount));
        }

        public async Task<IEnumerable<Turno>> GetTurnosHistoricoTerapeutaAsync(int terapeutaId)
        {
            return await _context.Turnos
                .Include(t => t.Sesion)
                .Include(t => t.Pagos)
                .Include(t => t.Paciente)
                .AsNoTracking() 
                .Where(t => t.TerapeutaId == terapeutaId)
                .ToListAsync();
        }




        public async Task<(IEnumerable<Turno> turnos, int totalItems)> GetTurnosPendientesPagoPaginadosAsync(int pacienteId, int pagina, int tamanio)
        {
            var hoy = DateTime.UtcNow;
            var query = _context.Turnos
                .Include(t => t.Terapeuta)
                .AsNoTracking()
                .Where(t => t.PacienteId == pacienteId && 
                            t.FechaHora < hoy && 
                            t.Estado.ToLower() != "cancelado" && 
                            !t.Pagos.Any());

            int totalItems = await query.CountAsync();

            var turnos = await query
                .OrderByDescending(t => t.FechaHora)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (turnos, totalItems);
        }

        public async Task<int> GetCantidadTurnosPendientesPagoAsync(int pacienteId)
        {
            var hoy = DateTime.UtcNow;
            return await _context.Turnos
                .Where(t => t.PacienteId == pacienteId && 
                            t.FechaHora < hoy && 
                            t.Estado.ToLower() != "cancelado" && 
                            !t.Pagos.Any())
                .CountAsync();
        }

    }



}