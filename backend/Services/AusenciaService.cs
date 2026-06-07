using AutoMapper;
using Core.DTOs.Ausencia.Output;
using Core.Entidades;
using Core.Interfaces.Email;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Infraestructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class AusenciaService : IAusenciaService
    {
        private readonly IAusenciaRepository _ausenciaRepository;
        private readonly ITurnoRepository _turnoRepository; 
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;
        private readonly TeraDbContext _context; 

        public AusenciaService(
            IAusenciaRepository ausenciaRepository,
            ITurnoRepository turnoRepository,
            IEmailService emailService,
            IMapper mapper,
            TeraDbContext context)
        {
            _ausenciaRepository = ausenciaRepository;
            _turnoRepository = turnoRepository;
            _emailService = emailService;
            _mapper = mapper;
            _context = context;
        }

        public async Task<IEnumerable<AusenciaDto>> GetAusenciasAsync(int usuarioId)
        {
            var ausencias = await _ausenciaRepository.GetByUsuarioIdAsync(usuarioId);
            return _mapper.Map<IEnumerable<AusenciaDto>>(ausencias);
        }

        public async Task<AusenciaDto> CrearAusenciaAsync(int usuarioId, AusenciaDto dto)
        {

            var fechaUtc = DateTime.SpecifyKind(dto.Fecha, DateTimeKind.Utc);
            var existente = await _ausenciaRepository.GetByFechaAndUsuarioAsync(fechaUtc, usuarioId);
            if (existente != null)
            {
                throw new ArgumentException($"Ya existe una ausencia registrada para la fecha {dto.Fecha:dd/MM/yyyy}.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                
                var ausencia = _mapper.Map<Ausencia>(dto);
                ausencia.UsuarioId = usuarioId;
                ausencia.Fecha = fechaUtc;

                var ausenciaCreada = await _ausenciaRepository.Agregar(ausencia);

               
                var turnosAfectados = await _turnoRepository.GetTurnosByDayAsync(fechaUtc);

                
                foreach (var turno in turnosAfectados)
                {
                   
                    if (turno.Estado.ToLower() == "reservado")
                    {
                        
                        turno.Estado = "Cancelado";
                        await _turnoRepository.Actualizar(turno);

                       
                        if (!string.IsNullOrEmpty(turno.Paciente.Email))
                        {
                            var asunto = "Aviso Importante: Turno Cancelado";
                            var cuerpo = $@"
                                <h2>Hola {turno.Paciente.Nombre},</h2>
                                <p>Le informamos que el profesional <strong>no estará disponible</strong> el día <strong>{dto.Fecha:dd/MM/yyyy}</strong> por motivos de: {dto.Motivo}.</p>
                                <p>Lamentablemente, su turno de las <strong>{turno.FechaHora:HH:mm} hs</strong> ha sido cancelado.</p>
                                <p>Le pedimos disculpas por las molestias. Por favor, contáctenos para reprogramar.</p>
                                <br>
                                <p>Atte, TeraGestión.</p>";

                            _ = _emailService.SendEmailAsync(turno.Paciente.Email, asunto, cuerpo);
                        }
                    }
                }

                await transaction.CommitAsync();
                return _mapper.Map<AusenciaDto>(ausenciaCreada);
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> EliminarAusenciaAsync(int id)
        {
            
            return await _ausenciaRepository.Eliminar(id);
        }
    }
}
