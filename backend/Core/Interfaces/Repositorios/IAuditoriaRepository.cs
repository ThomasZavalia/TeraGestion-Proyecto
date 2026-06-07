using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IAuditoriaRepository
    {
        Task RegistrarAsync(Auditoria auditoria);

        Task<(IEnumerable<Auditoria> items, int total)> GetAuditoriasPaginadasAsync(
            int pagina,
            int tamanio,
            DateTime? fechaDesde = null,
            DateTime? fechaHasta = null,
            int? usuarioId = null,
            string? modulo = null,
            string? accion = null);
    }
}
