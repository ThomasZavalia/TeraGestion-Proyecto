using AutoMapper;
using Core.DTOs;
using Core.DTOs.Paciente;
using Core.Entidades;
using Core.Interfaces;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Services
{
    public class PacienteService : IPacienteService
    {
        private readonly IPacienteRepository _pacienteRepository;
        private readonly IMapper _mapper;
        private readonly IAuditoriaService _auditoriaService;
        private readonly IHttpContextAccessor _httpContextAccessor; 
        private readonly ITurnoRepository _turnoRepository;

        public PacienteService(IPacienteRepository pacienteRepository, IMapper mapper,IAuditoriaService auditoriaService, IHttpContextAccessor httpContextAccessor, ITurnoRepository turnoRepository)
        {
            _pacienteRepository = pacienteRepository;
            _mapper = mapper;
            _auditoriaService = auditoriaService;
            _httpContextAccessor = httpContextAccessor;
            _httpContextAccessor = httpContextAccessor;
            _turnoRepository = turnoRepository;
        }

        public async Task<PacienteDTO> ActualizarPacienteAsync(int id, PacienteDTO pacienteDto)
        {

            if (pacienteDto == null) throw new ArgumentNullException(nameof(pacienteDto));
            if (string.IsNullOrWhiteSpace(pacienteDto.Nombre) || string.IsNullOrWhiteSpace(pacienteDto.Apellido))
                throw new ArgumentException("Nombre y Apellido son obligatorios");

            var pacienteParaActualizar = _mapper.Map<Paciente>(pacienteDto);

            var actualizado = await _pacienteRepository.Actualizar(id, pacienteParaActualizar);

            if (actualizado == null)
            {
                throw new KeyNotFoundException("Paciente no encontrado");
            }

            return _mapper.Map<PacienteDTO>(actualizado);

        }

        public async Task<PacienteDTO> CrearPacienteAsync(PacienteDTO pacienteDto)
        {
            try
            {
                pacienteDto.Activo = true;
                var nuevoPaciente = _mapper.Map<Paciente>(pacienteDto);
                var creado = await _pacienteRepository.Agregar(nuevoPaciente);
                await _auditoriaService.RegistrarAsync(
                accion: "CREACION",
                modulo: "Pacientes",
                entidad: "Paciente",
                entidadId: creado.Id,
                descripcion: $"Creo al paciente {creado.Nombre} {creado.Apellido} (DNI: {creado.DNI})."
 );
                return _mapper.Map<PacienteDTO>(creado);
            }
            catch (Exception ex)
            {
                throw new Exception("Error al crear el paciente", ex);
            }
        }
        public async Task<bool> EliminarPacienteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Id inválido");


            var paciente = await _pacienteRepository.GetById(id);
            if (paciente == null) { throw new KeyNotFoundException("Paciente no encontrado"); }


            paciente.Activo = false;


            await _pacienteRepository.Actualizar(paciente);

            await _auditoriaService.RegistrarAsync(
            accion: "DESACTIVACION",
            modulo: "Pacientes",
            entidad: "Paciente",
            entidadId: paciente.Id,
         descripcion: $"Desactivó al paciente {paciente.Nombre} {paciente.Apellido} (DNI: {paciente.DNI})."
);

            return true;
        }

        public async Task<PacienteDTO> GetPacienteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Id inválido");
            var paciente = await _pacienteRepository.GetById(id);
            if (paciente == null) { throw new KeyNotFoundException("Paciente no encontrado"); }

            return MapToDto(paciente);
        }

        public async Task<PacienteDTO> GetPacientePorDniAsync(string dni)
        {
            if (dni == null) { throw new ArgumentException("Obligatorio introducir el dni"); }
            var pacientes = await _pacienteRepository.ObtenerTodos();
            var paciente = pacientes.FirstOrDefault(p => p.DNI == dni);

            return MapToDto(paciente);

        }

        public async Task<IEnumerable<PacienteDTO>> GetPacientesAsync()
        {
            var pacientes = await _pacienteRepository.ObtenerTodos();

            var pacientesDTO = _mapper.Map<IEnumerable<PacienteDTO>>(pacientes);

            return pacientesDTO;
        }

        private PacienteDTO MapToDto(Paciente paciente)
        {
            if (paciente == null) return null;
            return new PacienteDTO
            {
                Id = paciente.Id,
                Nombre = paciente.Nombre,
                Apellido = paciente.Apellido,
                FechaNacimiento = paciente.FechaNacimiento,
                Telefono = paciente.Telefono,
                Email = paciente.Email,
                DNI = paciente.DNI,

            };
        }

        private Paciente MapToEntity(PacienteDTO dto)
        {
            if (dto == null) return null;
            return new Paciente
            {
                Id = dto.Id,
                Nombre = dto.Nombre,
                Apellido = dto.Apellido,
                FechaNacimiento = dto.FechaNacimiento,
                ObraSocialId = dto.ObraSocialId,
                Telefono = dto.Telefono,
                Email = dto.Email,
                DNI = dto.DNI
            };
        }


        public async Task<IEnumerable<Paciente>> GetPacientesSinDto()
        {
            return await _pacienteRepository.ObtenerTodos();
        }

        public async Task<IEnumerable<PacienteSimpleDto>> BuscarPacientesAsync(string query)
        {
            var pacientes = await _pacienteRepository.BuscarAsync(query);
            return _mapper.Map<IEnumerable<PacienteSimpleDto>>(pacientes);
        }


        public async Task<PacienteDetalleDTO> GetPacienteDetallesAsync(int id)
        {
            var paciente = await _pacienteRepository.GetDetallesByIdAsync(id);

            if (paciente == null)
            {
                throw new KeyNotFoundException("Paciente no encontrado");
            }

            var dto = _mapper.Map<PacienteDetalleDTO>(paciente);

           
            int turnosSinPagoCount = await _turnoRepository.GetCantidadTurnosPendientesPagoAsync(paciente.Id);

            dto.TienePagosPendientes = turnosSinPagoCount > 0;
            dto.CantidadTurnosPendientesPago = turnosSinPagoCount;

            return dto;
        }

        public async Task<bool> CheckDniExistsAsync(string dni)
        {
            if (string.IsNullOrEmpty(dni))
            {
                return false;


            }


            var paciente = await GetPacientePorDniAsync(dni);
            return paciente != null;

        }



        public async Task<IEnumerable<PacienteDTO>> GetPacientesAsync(int? obraSocialId, bool? activo, bool? tienePagosPendientes)
        {

            var pacientes = await _pacienteRepository.ObtenerTodosAsync(obraSocialId, activo, tienePagosPendientes);

            var pacientesDTO = _mapper.Map<IEnumerable<PacienteDTO>>(pacientes);
            return pacientesDTO;
        }

        public async Task<PagedResult<PacienteDTO>> GetPacientesPaginadosAsync(
      int pagina, int tamanio, string? busqueda, int? obraSocialId, bool? activo, bool? tienePagosPendientes)
        {
            var (pacientes, totalItems) = await _pacienteRepository.GetPacientesPaginadosYFiltradosAsync(
                pagina, tamanio, busqueda, obraSocialId, activo, tienePagosPendientes);

            var pacientesDto = _mapper.Map<IEnumerable<PacienteDTO>>(pacientes);

            int totalPages = (int)Math.Ceiling(totalItems / (double)tamanio);

            return new PagedResult<PacienteDTO>
            {
                Items = pacientesDto,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = pagina
            };
        }
    }
}
