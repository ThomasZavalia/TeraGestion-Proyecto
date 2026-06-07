using AutoMapper;
using Core.DTOs;
using Core.DTOs.Paciente;
using Core.DTOs.Sesion.Input;
using Core.DTOs.Sesion.Output;
using Core.Entidades;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class SesionService : ISesionService
    {
        private readonly ISesionRepository _sesionRepository;
        private readonly ITurnoRepository _turnoRepository;
        private readonly ITurnoService _turnoService;
        private readonly IPacienteService _pacienteService;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SesionService(ITurnoService turnoService, ISesionRepository sesionRepository, IPacienteService pacienteService, IMapper mapper, ITurnoRepository turnoRepository, IHttpContextAccessor httpContextAccessor)
        {
            _turnoService = turnoService;
            _sesionRepository = sesionRepository;
            _pacienteService = pacienteService;
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor;
            _turnoRepository = turnoRepository;
        }






        public async Task<SesionDTO> ActualizarSesionAsync(int id, SesionActualizarDto dto)
        {
            var sesionExistente = await _sesionRepository.GetById(id);
            if (sesionExistente == null)
            {
                throw new KeyNotFoundException($"Sesión con ID {id} no encontrada.");
            }


            sesionExistente.Notas = dto.Notas;

            if (dto.Asistencia != null)
            {
                sesionExistente.Asistencia = dto.Asistencia;
            }



            var sesionActualizada = await _sesionRepository.Actualizar(sesionExistente);
            return _mapper.Map<SesionDTO>(sesionActualizada);
        }






        public async Task<SesionDTO> CrearSesionAsync(SesionCreacionDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));


            var sesionExistente = await _sesionRepository.GetByTurnoIdAsync(dto.TurnoId);
            if (sesionExistente != null)
            {

                throw new ArgumentException($"Ya existe una sesión registrada para el turno ID {dto.TurnoId}.");

            }

            var turnoDto = await _turnoService.GetTurnoAsync(dto.TurnoId);
            if (turnoDto == null)
            {
                throw new KeyNotFoundException($"El turno con ID {dto.TurnoId} no fue encontrado.");
            }


            var nuevaSesion = new Sesion
            {
                TurnoId = dto.TurnoId,
                PacienteId = turnoDto.PacienteId,
                FechaHoraInicio = DateTime.SpecifyKind(turnoDto.FechaHora, DateTimeKind.Utc),
              
                Asistencia = dto.Asistencia,
                Notas = null
            };


            var sesionCreada = await _sesionRepository.Agregar(nuevaSesion);
            return _mapper.Map<SesionDTO>(sesionCreada);
        }






        public async Task<bool> EliminarSesionAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("El ID es invalido.");

            var eliminado = await _sesionRepository.Eliminar(id);
            if (!eliminado)
                throw new KeyNotFoundException($"No se encontro la sesión con ID {id}.");

            return true;
        }






        public async Task<IEnumerable<SesionDTO>> GetSesionesAsync()
        {
            var TodasLasSesiones = await _sesionRepository.ObtenerTodos();

            if (TodasLasSesiones == null || !TodasLasSesiones.Any())
                return Enumerable.Empty<SesionDTO>();

            var sesionesDto = _mapper.Map<IEnumerable<SesionDTO>>(TodasLasSesiones).ToList();
            var userRol = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;

            foreach (var s in sesionesDto)
            {
                if (userRol != "Terapeuta")
                {
                    s.Notas = "Contenido confidencial - Solo lectura para Terapeutas";
                }

                var turnoDetalle = await _turnoService.GetTurnoDetalleAsync(s.TurnoId);

                if (turnoDetalle != null)
                {
                    s.ProfesionalNombre = turnoDetalle.TerapeutaNombreCompletoProfesional
                                          ?? turnoDetalle.TerapeutaNombreCompleto
                                          ?? "Desconocido";
                }
            }

            return sesionesDto;
        }

        public async Task<SesionDTO> GetSesionByIdAsync(int id)
        {
            if (id <= 0) throw new ArgumentException("El ID es invalido.");

            var sesion = await _sesionRepository.GetById(id);
            if (sesion == null) throw new KeyNotFoundException($"La sesión con ID {id} no fue encontrada.");

            var sesionDto = _mapper.Map<SesionDTO>(sesion);

            var userRol = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            var turnoDetalle = await _turnoService.GetTurnoDetalleAsync(sesion.TurnoId);
            if (turnoDetalle != null)
            {
                sesionDto.ProfesionalNombre = turnoDetalle.TerapeutaNombreCompletoProfesional
                                              ?? turnoDetalle.TerapeutaNombreCompleto
                                              ?? "Desconocido";
            }

            if (userRol != "Terapeuta")
                sesionDto.Notas = "🔒 Contenido confidencial - Solo visible para Terapeutas";
            else if (turnoDetalle?.TerapeutaId != userId)
                sesionDto.Notas = "🔒 Contenido privado - Sesión de otro profesional";

            return sesionDto;
        }

        public async Task<SesionDTO> RegistrarAsistenciaAsync(SesionAsistenciaDto dto)
        {
            var sesionExistente = await _sesionRepository.GetByTurnoIdAsync(dto.TurnoId);
            Sesion sesionFinal;

            if (sesionExistente != null)
            {
                var sesionParaActualizar = await _sesionRepository.GetById(sesionExistente.Id);
                sesionParaActualizar.Asistencia = dto.Asistencia;

                if (dto.Asistencia == "Ausente") sesionParaActualizar.Notas = "Paciente ausente";

                sesionFinal = await _sesionRepository.Actualizar(sesionParaActualizar);
            }
            else
            {
                var turnoDto = await _turnoService.GetTurnoAsync(dto.TurnoId);
                if (turnoDto == null) throw new KeyNotFoundException($"El turno con ID {dto.TurnoId} no fue encontrado.");

                var nuevaSesion = new Sesion
                {
                    TurnoId = dto.TurnoId,
                    PacienteId = turnoDto.PacienteId,
                    FechaHoraInicio = turnoDto.FechaHora,
                    Asistencia = dto.Asistencia,
                    Notas = ""
                };

                sesionFinal = await _sesionRepository.Agregar(nuevaSesion);
            }

            var turno = await _turnoRepository.GetById(dto.TurnoId);
            if (turno != null)
            {
                turno.Estado = dto.Asistencia == "Ausente" ? "Ausente" : "Atendido";
                await _turnoRepository.Actualizar(turno);
            }

            return _mapper.Map<SesionDTO>(sesionFinal);
        }

        public async Task<PagedResult<SesionHistorialDTO>> GetSesionesPaginadasAsync(
     int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, int? terapeutaId, string? asistencia)
        {
            var (items, totalItems) = await _sesionRepository.GetPaginadasPorPacienteAsync(
                pacienteId, pagina, tamanio, desde, hasta, terapeutaId, asistencia);

            var listaItems = items.ToList();
            var dtos = _mapper.Map<List<SesionHistorialDTO>>(listaItems);
            var userRol = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            var userIdStr = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            int.TryParse(userIdStr, out int userId);

            foreach (var dto in dtos)
            {
                var sesionOriginal = listaItems.First(i => i.Id == dto.Id);

                if (userRol != "Terapeuta")
                    dto.Notas = "🔒 Contenido confidencial - Solo visible para Terapeutas";
                else if (sesionOriginal.Turno?.TerapeutaId != userId)
                    dto.Notas = "🔒 Contenido privado - Sesión de otro profesional";

                if (sesionOriginal.Turno?.Terapeuta != null)
                {
                    dto.ProfesionalNombre = $"{sesionOriginal.Turno.Terapeuta.Nombre} {sesionOriginal.Turno.Terapeuta.Apellido}";
                }
            }

            return new PagedResult<SesionHistorialDTO>
            {
                Items = dtos,
                TotalItems = totalItems,
                CurrentPage = pagina,
                TotalPages = (int)Math.Ceiling(totalItems / (double)tamanio)
            };
        }
    }
    }
