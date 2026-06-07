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
    public class ObraSocialRepository : IObraSocialRepository
    {
        private readonly TeraDbContext _context;

        public ObraSocialRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task<ObraSocial> Actualizar(ObraSocial entity)
        {
           
            _context.Entry(entity).State = EntityState.Modified; 
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task<ObraSocial> Agregar(ObraSocial entity)
        {
            await _context.ObrasSociales.AddAsync(entity);
            entity.Activa = true;
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Eliminar(int id)
        {
            var existente = await _context.ObrasSociales.FindAsync(id);
            if (existente == null) return false;
            existente.Activa = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ObraSocial> GetById(int id)
        {
           
            return await _context.ObrasSociales
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<IEnumerable<ObraSocial>> ObtenerTodos()
        {
            return await _context.ObrasSociales.Where(os=>os.Activa==true).AsNoTracking().ToListAsync();
        }

        public async Task<IEnumerable<ObraSocial>> ObtenerTodasParaAdmin()
        {
            
            return await _context.ObrasSociales
               .AsNoTracking()
               .OrderByDescending(os => os.Activa) 
               .ThenBy(os => os.Nombre)
               .ToListAsync();
        }
    }
}

