using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class ConfiguracionService : IConfiguracionService
    {
        private readonly IConfiguracionRepository _repo;

        public ConfiguracionService(IConfiguracionRepository repo)
        {
            _repo = repo;
        }

        public async Task<int> GetDuracionAsync(int usuarioId)
        {
            return await _repo.GetDuracionSesionAsync(usuarioId);
        }

        public async Task ActualizarDuracionAsync(int usuarioId, int minutos)
        {
            if (minutos < 15 || minutos > 180)
                throw new ArgumentException("La duración debe estar entre 15 y 180 minutos.");

            await _repo.UpdateDuracionSesionAsync(usuarioId, minutos);
        }
    }
}
