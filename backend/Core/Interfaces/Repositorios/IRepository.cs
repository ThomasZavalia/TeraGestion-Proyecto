using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Repositorios
{
    public interface IRepository<T> where T : class
    {
        public Task<T?> GetById(int id);

       public Task<IEnumerable<T>> ObtenerTodos();


        public Task<T> Agregar(T entity);
        public Task<T> Actualizar(T entity);
        public Task<bool> Eliminar(int id);

    }
}
