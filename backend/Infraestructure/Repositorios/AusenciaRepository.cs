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
    public class AusenciaRepository :IAusenciaRepository
    {
        private readonly TeraDbContext _context;

        public AusenciaRepository(TeraDbContext context) 
        {
            _context = context;
        }

        public async Task<IEnumerable<Ausencia>> GetByUsuarioIdAsync(int usuarioId)
        {
            return await _context.Ausencias
                                 .Where(a => a.UsuarioId == usuarioId)
                                 .OrderByDescending(a => a.Fecha)
                                 .AsNoTracking()
                                 .ToListAsync();
        }

        public async Task<Ausencia?> GetByFechaAndUsuarioAsync(DateTime fecha, int usuarioId)
        {
            return await _context.Ausencias
                                 .FirstOrDefaultAsync(a => a.Fecha.Date == fecha.Date && a.UsuarioId == usuarioId);
        }

       
        public async Task<Ausencia> Agregar(Ausencia ausencia)
        {
            await _context.Ausencias.AddAsync(ausencia);
            await _context.SaveChangesAsync();
            return ausencia;
        }

        public async Task<bool> Eliminar(int id)
        {
            var entidad = await _context.Ausencias.FindAsync(id);
            if (entidad == null) return false;
            _context.Ausencias.Remove(entidad);
            await _context.SaveChangesAsync();
            return true;
        }

        public Task<Ausencia?> GetById(int id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Ausencia>> ObtenerTodos()
        {
            throw new NotImplementedException();
        }

        public Task<Ausencia> Actualizar(Ausencia entity)
        {
            throw new NotImplementedException();
        }
    }
}
