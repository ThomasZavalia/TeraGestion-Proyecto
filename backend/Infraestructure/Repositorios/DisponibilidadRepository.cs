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
    public class DisponibilidadRepository : IDisponibilidadRepository
    {
        private readonly TeraDbContext _context;

        public DisponibilidadRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Disponibilidad>> GetByUserIdAsync(int userId)
        {
            return await _context.Disponibilidades
                                 .Where(d => d.UsuarioId == userId)
                                 .OrderBy(d => d.DiaSemana)
                                 .AsNoTracking()
                                 .ToListAsync();
        }


        public async Task UpdateDisponibilidadAsync(IEnumerable<Disponibilidad> disponibilidades)
        {

            if (disponibilidades == null || !disponibilidades.Any()) return;

            var userId = disponibilidades.First().UsuarioId;
            var existentes = await _context.Disponibilidades
                                          .Where(d => d.UsuarioId == userId)
                                          .ToListAsync();

            foreach (var actualizado in disponibilidades)
            {
                var existente = existentes.FirstOrDefault(e => e.DiaSemana == actualizado.DiaSemana);

                if (existente != null)
                {

                    existente.Disponible = actualizado.Disponible;
                    existente.HoraInicio = actualizado.HoraInicio;
                    existente.HoraFin = actualizado.HoraFin;
                    _context.Entry(existente).State = EntityState.Modified;
                }
                else
                {

                    await _context.Disponibilidades.AddAsync(actualizado);
                }

                await _context.SaveChangesAsync();
            }
        }


        public async Task<Disponibilidad?> GetByUserIdAndDayAsync(int userId, DayOfWeek dayOfWeek)
        {
            return await _context.Disponibilidades
                                 .AsNoTracking()
                                 .FirstOrDefaultAsync(d => d.UsuarioId == userId && d.DiaSemana == dayOfWeek);
        }
    }
}
