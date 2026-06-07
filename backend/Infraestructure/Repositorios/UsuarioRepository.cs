using Core.Entidades;
using Core.Interfaces.Repositorios;
using Infraestructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Repositorios
{
    public class UsuarioRepository : IUsuariosRepository
    {
        private readonly TeraDbContext _context;

        public UsuarioRepository(TeraDbContext context)
        {
            _context = context;
        }
        public async Task<Usuario> Actualizar(Usuario usuario)
        {
            
            _context.Usuarios.Update(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }


        public async Task<Usuario> Agregar(Usuario usuario)
        {
            if (usuario == null) { return null; }

            await _context.Usuarios.AddAsync(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }

        public async Task<bool> Eliminar(int id)
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null) { return false; }

            usuario.Activo = !usuario.Activo;
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<Usuario>? GetById(int id)

        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (usuario == null) { return null; }
            return usuario;
        }

        public Task<Usuario> GetByUsernameAsync(string username)
        {

            var usuario = _context.Usuarios.FirstOrDefaultAsync(u => u.Username == username);
            return usuario;
        }

        public async Task<IEnumerable<Usuario>> ObtenerTodos()

        {
            var usuarios = await _context.Usuarios.ToListAsync();
            return usuarios;
        }

        public async Task<Usuario> GetByEmailAsync(string email)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<Usuario> GetByResetTokenAsync(string token)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.ResetToken == token);
        }

        public async Task<IEnumerable<Usuario>> GetTerapeutasDisponibles()
        {
            return await _context.Usuarios
                .Where(u => u.Rol == "Terapeuta" && u.Activo == true)
                .ToListAsync();

            
        }

        public async Task<List<Turno>> GetTurnosRendimientoAsync(int terapeutaId, DateTime fechaInicioMes)
        {
            
            return await _context.Turnos
                .Include(t => t.Paciente)
                .Include(t=>t.Sesion)
                .Include(t=>t.Pagos)
                .Where(t => t.TerapeutaId == terapeutaId && t.FechaHora >= fechaInicioMes)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Usuario> usuarios, int total)> GetUsuariosPaginadosAsync(int pagina, int tamanio, string? busqueda, bool mostrarInactivos)
        {
            var query = _context.Usuarios.AsQueryable();

            if (mostrarInactivos)
            {
                query = query.Where(u => u.Activo == false);
            }
            else
            {
                query = query.Where(u => u.Activo == true);
            }
            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                var b = busqueda.ToLower();
                query = query.Where(u =>
                    u.Username.ToLower().Contains(b) ||
                    (u.Nombre != null && u.Nombre.ToLower().Contains(b)) ||
                    (u.Apellido != null && u.Apellido.ToLower().Contains(b)) ||
                    u.Email.ToLower().Contains(b)
                );
            }

         
            int totalItems = await query.CountAsync();

            var usuariosFiltrados = await query
                .OrderBy(u => u.Rol).ThenBy(u => u.Apellido).ThenBy(u => u.Nombre)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (usuariosFiltrados, totalItems);
        }
    }

}
