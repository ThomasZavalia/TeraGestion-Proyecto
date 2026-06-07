using AutoMapper;
using Core.DTOs.ObraSocial;
using Core.Entidades;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services
{
    public class ObraSocialService : IObraSocialService
    {
        private readonly IObraSocialRepository _obraSocialRepository;
        private const decimal PrecioBaseSinObraSocial = 5m; 
        private readonly IMapper _mapper;

        public ObraSocialService(IObraSocialRepository obraSocialRepository, IMapper mapper)
        {
            _obraSocialRepository = obraSocialRepository;
            _mapper = mapper;
        }

        public async Task<ObraSocialDto> GetByIdAsync(int id)
        {
            var obraSocial =  await _obraSocialRepository.GetById(id);
            return _mapper.Map<ObraSocialDto>(obraSocial);
        }

        public async Task<decimal> CalcularPrecioTurnoAsync(int? obraSocialId)
        {
            if (obraSocialId.HasValue)
            {
                var obraSocial = await _obraSocialRepository.GetById(obraSocialId.Value);
                if (obraSocial != null && obraSocial.Activa)
                    return obraSocial.PrecioTurno;
            }
            return PrecioBaseSinObraSocial;
        }


        public async Task<IEnumerable<ObraSocialDto>> GetObrasSocialesAsync()
        {
            
            var obrasSociales = await _obraSocialRepository.ObtenerTodos();
            
            return _mapper.Map<IEnumerable<ObraSocialDto>>(obrasSociales);
        }

        public async Task<ObraSocialDto> CrearObraSocialAsync(ObraSocialDto obraSocialDto)
        {
            var nuevaObraSocial = _mapper.Map<ObraSocial>(obraSocialDto);
        
            var obraSocialCreada = await _obraSocialRepository.Agregar(nuevaObraSocial);
            
            return _mapper.Map<ObraSocialDto>(obraSocialCreada);
        }

        public async Task<ObraSocialDto> ActualizarObraSocialAsync(int id, ObraSocialDto obraSocialDto)
        {
            var obraSocialExistente = await _obraSocialRepository.GetById(id);
            if (obraSocialExistente == null)
            {
                throw new KeyNotFoundException("Obra social no encontrada");
            }

            obraSocialExistente.Nombre = obraSocialDto.Nombre;
            obraSocialExistente.PrecioTurno = obraSocialDto.PrecioTurno;
            obraSocialExistente.Activa = obraSocialDto.Activa;

           

           
            var obraSocialActualizada = await _obraSocialRepository.Actualizar(obraSocialExistente);

            
            return _mapper.Map<ObraSocialDto>(obraSocialActualizada);
        }

        public async Task<bool> EliminarObraSocialAsync(int id)
        {
            var obraSocial = await _obraSocialRepository.GetById(id);
            if (obraSocial == null)
            {
                throw new KeyNotFoundException("Obra social no encontrada");
            }
           
            return await _obraSocialRepository.Eliminar(id);
        }

        public async Task<IEnumerable<ObraSocialDto>> GetObrasSocialesAdminAsync()
        {
            var obrasSociales = await _obraSocialRepository.ObtenerTodasParaAdmin();
            return _mapper.Map<IEnumerable<ObraSocialDto>>(obrasSociales);
        }
    }
}