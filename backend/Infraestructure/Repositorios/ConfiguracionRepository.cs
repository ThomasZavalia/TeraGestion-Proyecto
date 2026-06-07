using Core.Interfaces.Repositorios;
using Infraestructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositorios
{
    public class ConfiguracionRepository : IConfiguracionRepository
    {
        private readonly TeraDbContext _context;

        public ConfiguracionRepository(TeraDbContext context)
        {
            _context = context;
        }

        public async Task<int> GetDuracionSesionAsync(int usuarioId)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            return usuario?.DuracionTurnoDefault ?? 60; 
        }

        public async Task UpdateDuracionSesionAsync(int usuarioId, int minutos)
        {
            var usuario = await _context.Usuarios.FindAsync(usuarioId);
            if (usuario != null)
            {
                usuario.DuracionTurnoDefault = minutos;
                
                await _context.SaveChangesAsync();
            }
        }
    }
}
