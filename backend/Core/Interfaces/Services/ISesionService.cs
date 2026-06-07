using Core.DTOs;
using Core.DTOs.Paciente;
using Core.DTOs.Sesion.Input;
using Core.DTOs.Sesion.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces.Services
{
    public interface ISesionService
    {
        public Task<SesionDTO> GetSesionByIdAsync(int id);
        public Task<IEnumerable<SesionDTO>> GetSesionesAsync();
        
        Task<SesionDTO> CrearSesionAsync(SesionCreacionDto dto);
       
        Task<SesionDTO> ActualizarSesionAsync(int id, SesionActualizarDto dto);
        public Task<bool> EliminarSesionAsync(int id);

        Task<SesionDTO> RegistrarAsistenciaAsync(SesionAsistenciaDto dto);

        Task<PagedResult<SesionHistorialDTO>> GetSesionesPaginadasAsync(
   int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, int? terapeutaId, string? asistencia);


    }
}
