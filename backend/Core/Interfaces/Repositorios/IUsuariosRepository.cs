using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IUsuariosRepository : IRepository<Entidades.Usuario>
    {
        Task<Usuario> GetByUsernameAsync(string username);
        Task<Usuario> GetByEmailAsync(string email);
        Task<Usuario> GetByResetTokenAsync(string token);
        Task<IEnumerable<Usuario>> GetTerapeutasDisponibles();
        Task<List<Turno>> GetTurnosRendimientoAsync(int terapeutaId, DateTime fechaInicioMes);

        Task<(IEnumerable<Usuario> usuarios, int total)> GetUsuariosPaginadosAsync(int pagina, int tamanio, string? busqueda, bool mostrarInactivos);


    }
}
