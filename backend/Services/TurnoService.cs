using AutoMapper;
using Core.DTOs.Paciente;
using Core.DTOs.Pago.Output;
using Core.DTOs.Public;
using Core.DTOs.Turno.Input;
using Core.DTOs.Turno.Output;
using Core.DTOs.Usuario.Output;
using Core.Entidades;
using Core.Interfaces;
using Core.Interfaces.Email;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Infraestructure;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Core.DTOs;
using Core.DTOs.Paciente;

namespace Services
{
    public class TurnoService : ITurnoService


    {
        private readonly IPacienteService _pacienteService;
        private readonly ITurnoRepository _turnoRepository;
        private readonly IPagoService _pagoService;
        private readonly TeraDbContext _teraDbContext;
        private readonly IMapper _mapper;
        private readonly IObraSocialService _obraSocialService;
        private readonly ISesionRepository _sesionRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IDisponibilidadRepository _disponibilidadRepository;
        private readonly IEmailService _emailService;
        private readonly INotificacionService _notificacionService;
        private readonly IConfiguracionService _configService;
        private readonly IAusenciaRepository _ausenciaRepository;
        private readonly IAuditoriaService _auditoriaService;
        private readonly string _frontendBaseUrl;


        public TurnoService(
         ITurnoRepository turnoRepository,
         IPacienteService pacienteService,
         IPagoService pagoService,
         TeraDbContext teraDbContext,
         IMapper mapper,
         IObraSocialService obraSocialService,
         ISesionRepository sesionRepository,
         IHttpContextAccessor httpContextAccessor,
         IDisponibilidadRepository disponibilidadRepository,
         IEmailService emailService,
         INotificacionService notificacionService,
         IConfiguracionService configService,
         IAusenciaRepository ausenciaRepository,
         IAuditoriaService auditoriaService,
         IConfiguration configuration
     )
        {
            _turnoRepository = turnoRepository;
            _pacienteService = pacienteService;
            _pagoService = pagoService;
            _teraDbContext = teraDbContext;
            _mapper = mapper;
            _obraSocialService = obraSocialService;
            _sesionRepository = sesionRepository;
            _httpContextAccessor = httpContextAccessor;
            _disponibilidadRepository = disponibilidadRepository;
            _emailService = emailService;
            _notificacionService = notificacionService;
            _configService = configService;
            _ausenciaRepository = ausenciaRepository;
            _auditoriaService = auditoriaService;
            _frontendBaseUrl = configuration["FrontendBaseUrl"] ?? "http://localhost:5173";
        }


        public async Task<TurnoCalendarioDto> ActualizarTurnoAsync(int id, TurnoDtoActualizar dto)
        {
            var turnoExistente = await _turnoRepository.GetByIdConPaciente(id);
            if (turnoExistente == null)
            { throw new KeyNotFoundException("Turno no encontrado"); }




            if (dto.ObraSocialId.HasValue)
            {
                turnoExistente.ObraSocialId = dto.ObraSocialId;
                turnoExistente.Precio = await _obraSocialService.CalcularPrecioTurnoAsync(dto.ObraSocialId);
            }




            await _turnoRepository.Actualizar(turnoExistente);


            return _mapper.Map<TurnoCalendarioDto>(turnoExistente);
        }

        public async Task MarcarComoPagadoAsync(int turnoId, string metodoPago)
        {
            var turno = await _turnoRepository.GetById(turnoId)
                ?? throw new KeyNotFoundException("Turno no encontrado");

            if (turno.Pagos != null && turno.Pagos.Any(p => p.Anulado != true))
                throw new ArgumentException("El turno ya tiene un pago activo registrado. Anúlelo primero si desea registrar uno nuevo.");

            // Leemos el porcentaje actual del terapeuta y lo fijamos en el pago.
            // Si el admin lo cambia en el futuro, este registro histórico no se ve afectado.
            var terapeuta = await _teraDbContext.Usuarios
                .FirstOrDefaultAsync(u => u.Id == turno.TerapeutaId);
            decimal porcentajeAplicado = terapeuta?.PorcentajeGanancia ?? 70m;

            await _pagoService.CrearPago(new PagoDto
            {
                TurnoId = turnoId,
                MetodoPago = metodoPago,
                Fecha = DateTime.Now,
                Monto = turno.Precio,
                PorcentajeTerapeutaAplicado = porcentajeAplicado
            });

           await _auditoriaService.RegistrarAsync(
            accion: "MarcarPagado",
            modulo: "Turnos",
            entidad: "Turno",
            entidadId: turno.Id,
            descripcion: $"Se Marco como pagado el turno del paciente {turno.Paciente.Nombre} del día {ArTime(turno.FechaHora):dd/MM/yyyy HH:mm}."
);
        }


        public async Task<TurnoCalendarioDto> CrearTurnoAsync(TurnoDtoCreacion dto)
        {

            if (!dto.PacienteId.HasValue && string.IsNullOrWhiteSpace(dto.DNI))
            {
                throw new ArgumentException("Se debe proporcionar un PacienteId o los datos de un nuevo paciente.");
            }

           
            if (!dto.ObraSocialId.HasValue)
            {
                throw new ArgumentException("Se debe seleccionar una Cobertura (o Particular).");
            }



            using var transaction = await _teraDbContext.Database.BeginTransactionAsync();

            try
            {
                PacienteDTO pacienteAsignado;

                if (dto.PacienteId.HasValue)
                {

                    pacienteAsignado = await _pacienteService.GetPacienteAsync(dto.PacienteId.Value);
                    if (pacienteAsignado == null)
                    {
                        throw new KeyNotFoundException($"No se encontró el paciente con ID {dto.PacienteId.Value}.");
                    }

                    bool necesitaActualizar = false;


                    if (pacienteAsignado.ObraSocialId != dto.ObraSocialId)
                    {
                        pacienteAsignado.ObraSocialId = dto.ObraSocialId;
                        necesitaActualizar = true;
                    }


                    if (!pacienteAsignado.Activo)
                    {
                        pacienteAsignado.Activo = true;
                        necesitaActualizar = true;
                    }

                    if (necesitaActualizar)
                    {
                        await _pacienteService.ActualizarPacienteAsync(pacienteAsignado.Id, pacienteAsignado);
                    }
                }
                else
                {
                    var pacienteExistente = await _pacienteService.GetPacientePorDniAsync(dto.DNI);

                    if (pacienteExistente != null)
                    {

                        throw new ArgumentException($"Ya existe un paciente registrado con el DNI {dto.DNI}. Por favor, seleccione 'Paciente Existente'.");
                    }

                    var nuevoPacienteDto = new PacienteDTO
                    {
                        DNI = dto.DNI,
                        Nombre = dto.NombrePaciente,
                        Apellido = dto.ApellidoPaciente,
                        ObraSocialId = dto.ObraSocialId,
                        Activo = true
                    };
                    pacienteAsignado = await _pacienteService.CrearPacienteAsync(nuevoPacienteDto);

                    if (pacienteAsignado == null)
                    {

                        throw new InvalidOperationException("Error inesperado al intentar crear el nuevo paciente.");
                    }
                }


                decimal precioTurno = await _obraSocialService.CalcularPrecioTurnoAsync(dto.ObraSocialId);

                int duracion = await _configService.GetDuracionAsync(dto.TerapeutaId);

                var nuevaFechaFin = dto.Fecha.AddMinutes(duracion);

                var turnosTerapeutaDia = await _teraDbContext.Turnos
                    .Where(t => t.TerapeutaId == dto.TerapeutaId && t.FechaHora.Date == dto.Fecha.Date && (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion" || t.Estado == "Atendido"))
                    .ToListAsync();

                bool terapeutaOcupado = turnosTerapeutaDia.Any(t =>
                    t.FechaHora < nuevaFechaFin &&
                    t.FechaHora.AddMinutes(t.Duracion > 0 ? t.Duracion : 40) > dto.Fecha);

                if (terapeutaOcupado)
                {
                    throw new InvalidOperationException("Error de concurrencia: El profesional acaba de ser reservado en este horario. Actualice el calendario.");
                }
            
                var turnosPacienteDia = await _teraDbContext.Turnos
                    .Where(t => t.PacienteId == pacienteAsignado.Id && t.FechaHora.Date == dto.Fecha.Date && (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion" || t.Estado == "Atendido"))
                    .ToListAsync();

                bool pacienteOcupado = turnosPacienteDia.Any(t =>
                    t.FechaHora < nuevaFechaFin &&
                    t.FechaHora.AddMinutes(t.Duracion > 0 ? t.Duracion : 40) > dto.Fecha);

                if (pacienteOcupado)
                {
                    throw new InvalidOperationException("El paciente ya tiene un turno asignado en este horario con otro profesional.");
                }

                var turno = new Turno
                {
                    FechaHora = dto.Fecha,
                    PacienteId = pacienteAsignado.Id,
                    Precio = precioTurno,
                    Estado = "Reservado",
                    ObraSocialId = dto.ObraSocialId ,
                    Duracion = duracion,
                    TerapeutaId = dto.TerapeutaId
                };

                var turnoCreado = await _turnoRepository.Agregar(turno);

               
                await transaction.CommitAsync();
                var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
                _ = int.TryParse(userIdString ?? "0", out int usuarioActualId);

               
                if (usuarioActualId != dto.TerapeutaId)
                {
                    string timeZoneId = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows)
                        ? "Argentina Standard Time" : "America/Argentina/Buenos_Aires";
                    var zonaAr = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                    var fechaLocal = TimeZoneInfo.ConvertTimeFromUtc(dto.Fecha, zonaAr);

                    var mensaje = $"Te han agendado un nuevo turno con {pacienteAsignado.Nombre} {pacienteAsignado.Apellido} para el {fechaLocal:dd/MM/yyyy} a las {fechaLocal:HH:mm} hs.";

                    try
                    {
                        await _notificacionService.CrearNotificacionAsync(
                            usuarioDestinoId: dto.TerapeutaId,
                            titulo: "Nuevo Turno Asignado",
                            mensaje: mensaje,
                            referenciaId: turnoCreado.Id
                        );
                    }
                    catch (Exception ex)
                    {
                       
                        Console.WriteLine($"Error al enviar notificación de creación: {ex.Message}");
                    }
                }

                var turnoConPaciente = await _turnoRepository.GetByIdConPaciente(turnoCreado.Id);
                if (turnoConPaciente == null)
                {
                    throw new InvalidOperationException("No se pudo recuperar el turno recién creado con los datos del paciente.");
                }

                try
                {
                    await _auditoriaService.RegistrarAsync(
                        accion: "CREACION",
                        modulo: "Turnos",
                        entidad: "Turno",
                        entidadId: turnoCreado.Id,
                        descripcion: $"Se creó un turno para el paciente {pacienteAsignado.Nombre} {pacienteAsignado.Apellido} el {ArTime(dto.Fecha):dd/MM/yyyy} a las {ArTime(dto.Fecha):HH:mm} hs."
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al registrar auditoría de creación: {ex.Message}");
                }

                var turnoDtoRespuesta = _mapper.Map<TurnoCalendarioDto>(turnoConPaciente);
                return turnoDtoRespuesta;
            }
            catch (Exception)
            {

                await transaction.RollbackAsync();


                throw;
            }
        }



        public async Task<bool> EliminarTurnoAsync(int id)
        {
            
            var turnoACancelar = await _turnoRepository.GetByIdConPaciente(id);

            if (turnoACancelar == null) throw new KeyNotFoundException("Turno no encontrado");

          
            if (turnoACancelar.Pagos != null && turnoACancelar.Pagos.Any(p => p.Anulado != true))
                throw new ArgumentException("No se puede cancelar un turno que ya tiene un pago registrado. Anule el pago primero.");

            turnoACancelar.Estado = "Cancelado";
            await _turnoRepository.Actualizar(turnoACancelar);

            if (!string.IsNullOrEmpty(turnoACancelar.Paciente.Email))
            {
                var asunto = "Turno Cancelado";
                var cuerpo = $@"
            <p>Hola {turnoACancelar.Paciente.Nombre},</p>
            <p>Su turno del día <strong>{turnoACancelar.FechaHora:dd/MM/yyyy}</strong> a las <strong>{turnoACancelar.FechaHora:HH:mm} hs</strong> ha sido cancelado.</p>
            <p>Saludos, TeraGestion.</p>";

                _ = _emailService.SendEmailAsync(turnoACancelar.Paciente.Email, asunto, cuerpo);
            }

            await _auditoriaService.RegistrarAsync(
             accion: "CANCELACION",
             modulo: "Turnos",
             entidad: "Turno",
             entidadId: turnoACancelar.Id,
             descripcion: $"Canceló el turno del paciente {turnoACancelar.Paciente.Nombre} del día {ArTime(turnoACancelar.FechaHora):dd/MM/yyyy HH:mm}."
            );
            return true;
        }




        public async Task<TurnoDto> GetTurnoAsync(int id)
        {
            var turnoAbuscar = await _turnoRepository.GetById(id);
            if (turnoAbuscar == null)
            {
                throw new KeyNotFoundException("No se encontro el turno");
            }
            var turnoDto = _mapper.Map<TurnoDto>(turnoAbuscar);

            return turnoDto;
        }

        public async Task<IEnumerable<TurnoCalendarioDto>> GetTurnosAsync(DateTime start, DateTime end)
        {
            var userIdString = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            int userId = int.Parse(userIdString ?? "0");

            IEnumerable<Turno> turnos;

            if (userRole == "Admin" || userRole == "Secretaria")
            {
                turnos = await _turnoRepository.ObtenerPorRangoAsync(start, end);
            }
            else
            {
                turnos = await _turnoRepository.ObtenerPorRangoAsync(start, end, userId);
            }

            return _mapper.Map<IEnumerable<TurnoCalendarioDto>>(turnos);
        }
        public async Task<IEnumerable<Turno>> GetTurnosSinDto()
        {
            return await _turnoRepository.ObtenerTodos();
        }



        public async Task<IEnumerable<string>> GetAvailableSlotsAsync(DateTime date,int terapeutaId)
        {
            var availableSlots = new List<string>();


          

            string timeZoneId = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows)
                ? "Argentina Standard Time"
                : "America/Argentina/Buenos_Aires";

            var zonaAr = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

            var fechaUtcBusqueda = date.ToUniversalTime().Date;

            var tieneAusencia = await _ausenciaRepository.GetByFechaAndUsuarioAsync(fechaUtcBusqueda, terapeutaId);

            if (tieneAusencia != null)
            {
                return availableSlots;
            }

            var diaDeLaSemana = date.DayOfWeek;

            var disponibilidadDia = await _disponibilidadRepository.GetByUserIdAndDayAsync(terapeutaId, diaDeLaSemana);

            if (disponibilidadDia == null || !disponibilidadDia.Disponible ||
                !disponibilidadDia.HoraInicio.HasValue || !disponibilidadDia.HoraFin.HasValue)
            {
                return availableSlots;
            }

            int duracionConfigurada = await _configService.GetDuracionAsync(terapeutaId);

            var fechaUtc = date.ToUniversalTime().Date;
            var turnosDelDia = await _turnoRepository.GetTurnosByDayAndTerapeutaAsync(fechaUtc, terapeutaId);

            TimeSpan currentSlotStart = disponibilidadDia.HoraInicio.Value;
            TimeSpan endTime = disponibilidadDia.HoraFin.Value;

            while (currentSlotStart < endTime)
            {
               
                TimeSpan currentSlotEnd = currentSlotStart.Add(TimeSpan.FromMinutes(duracionConfigurada));

                if (currentSlotEnd <= endTime)
                {
                   
                    bool estaOcupado = turnosDelDia.Any(t =>
                    {

                        var fechaLocalTurno = TimeZoneInfo.ConvertTimeFromUtc(t.FechaHora, zonaAr);
                        var turnoExistenteInicio = fechaLocalTurno.TimeOfDay;

                        var duracionReal = t.Duracion > 0 ? t.Duracion : 60;
                        var turnoExistenteFin = turnoExistenteInicio.Add(TimeSpan.FromMinutes(duracionReal));

                        return turnoExistenteInicio < currentSlotEnd && turnoExistenteFin > currentSlotStart;

                    });

                    
                    if (!estaOcupado)
                    {
                        availableSlots.Add(currentSlotStart.ToString(@"hh\:mm"));
                    }

                }

                
                currentSlotStart = currentSlotStart.Add(TimeSpan.FromMinutes(duracionConfigurada));

            }

            return availableSlots;
        }
        public async Task<IEnumerable<TurnoCalendarioDto>> GetTurnosDelDiaAsync(DateTime date)
        {

            var turnos = await _turnoRepository.GetTurnosByDayAsync(date.Date); 


            return _mapper.Map<IEnumerable<TurnoCalendarioDto>>(turnos);
        }


        public async Task<TurnoDetalleDto> GetTurnoDetalleAsync(int id)
        {
            var turno = await _turnoRepository.GetByIdConPaciente(id);
            if (turno == null)
            {
                throw new KeyNotFoundException("Turno no encontrado");
            }


            var turnoDto = _mapper.Map<TurnoDetalleDto>(turno);


            var sesionExistente = await _sesionRepository.GetByTurnoIdAsync(id);


            if (sesionExistente != null)
            {

                turnoDto.Asistencia = sesionExistente.Asistencia;
                turnoDto.NotasSesion = sesionExistente.Notas;
                turnoDto.SesionId = sesionExistente.Id;
            }
            else
            {

                turnoDto.Asistencia = null;
                turnoDto.NotasSesion = null;
                turnoDto.SesionId = null;
            }

            return turnoDto;
        }

        public async Task<TurnoCalendarioDto> ReprogramarTurnoAsync(int id, DateTime nuevaFecha)
        {
            var turno = await _turnoRepository.GetByIdConPaciente(id);
            if (turno == null) throw new KeyNotFoundException("Turno no encontrado");
            if (turno.Estado == "Atendido" || turno.Estado == "Ausente" || turno.Estado == "Cancelado")
            {
                throw new InvalidOperationException("No se puede reprogramar un turno que ya finalizó su ciclo (Atendido, Ausente o Cancelado).");
            }
            var duracion = turno.Duracion > 0 ? turno.Duracion : 40;
            var nuevaFechaFin = nuevaFecha.AddMinutes(duracion);

            var turnosTerapeutaDia = await _teraDbContext.Turnos
                .Where(t => t.Id != id && t.TerapeutaId == turno.TerapeutaId && t.FechaHora.Date == nuevaFecha.Date && (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion" || t.Estado == "Atendido"))
                .ToListAsync();

            bool terapeutaOcupado = turnosTerapeutaDia.Any(t =>
                t.FechaHora < nuevaFechaFin &&
                t.FechaHora.AddMinutes(t.Duracion > 0 ? t.Duracion : 40) > nuevaFecha);

            if (terapeutaOcupado) throw new InvalidOperationException("El profesional ya tiene otro turno en este nuevo horario.");

            var turnosPacienteDia = await _teraDbContext.Turnos
                .Where(t => t.Id != id && t.PacienteId == turno.PacienteId && t.FechaHora.Date == nuevaFecha.Date && (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion" || t.Estado == "Atendido"))
                .ToListAsync();

            bool pacienteOcupado = turnosPacienteDia.Any(t =>
                t.FechaHora < nuevaFechaFin &&
                t.FechaHora.AddMinutes(t.Duracion > 0 ? t.Duracion : 40) > nuevaFecha);

            if (pacienteOcupado) throw new InvalidOperationException("El paciente ya tiene un turno en este horario con otro profesional.");

            turno.FechaHora = nuevaFecha;


            if (turno.Estado == "Pendiente de Cierre" || turno.Estado == "Cancelado")
            {
                turno.Estado = "Reservado";
            }

            await _turnoRepository.Actualizar(turno);

            await _auditoriaService.RegistrarAsync(
             accion: "REPROGRAMACION",
             modulo: "Turnos",
             entidad: "Turno",
             entidadId: turno.Id,
             descripcion: $"Reprogramo el turno del paciente {turno.Paciente.Nombre} del día {ArTime(turno.FechaHora):dd/MM/yyyy HH:mm}."
);
            return _mapper.Map<TurnoCalendarioDto>(turno);
        }

        public async Task<TurnoCalendarioDto> ReservarTurnoPublicoAsync(ReservaDto dto)
        {
            
            var slots = await GetAvailableSlotsAsync(dto.FechaHora.Date, dto.TerapeutaId);

            string timeZoneId = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(System.Runtime.InteropServices.OSPlatform.Windows)
                ? "Argentina Standard Time" : "America/Argentina/Buenos_Aires";
            var zonaHoraria = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);

         
            var fechaLocal = TimeZoneInfo.ConvertTimeFromUtc(dto.FechaHora.ToUniversalTime(), zonaHoraria);
            var horaSolicitada = fechaLocal.ToString("HH:mm");


            if (!slots.Contains(horaSolicitada))
            {
                throw new InvalidOperationException("Lo sentimos, ese horario ya no está disponible.");
            }

            using var transaction = await _teraDbContext.Database.BeginTransactionAsync();
            try
            {
                
                var paciente = await _pacienteService.GetPacientePorDniAsync(dto.DNI);
                int pacienteId;
                string nombreFinal;
                string apellidoFinal;

                if (paciente != null)
                {
                    
                    pacienteId = paciente.Id;
                    nombreFinal = paciente.Nombre;
                    apellidoFinal = paciente.Apellido;


                }
                else
                {
                    
                    var nuevoPaciente = new PacienteDTO
                    {
                        Nombre = dto.Nombre,
                        Apellido = dto.Apellido,
                        DNI = dto.DNI,
                        Email = dto.Email,
                        Telefono = dto.Telefono,
                        Activo = true
                       
                    };
                    var pacienteCreado = await _pacienteService.CrearPacienteAsync(nuevoPaciente);
                    pacienteId = pacienteCreado.Id;
                    nombreFinal = dto.Nombre;
                    apellidoFinal = dto.Apellido;
                }

               
                var yaTieneTurno = await _turnoRepository.ExisteTurnoPorPacienteYFecha(pacienteId, dto.FechaHora);
                if (yaTieneTurno)
                {
                    throw new InvalidOperationException("Ya tienes un turno reservado para este día.");
                }

                decimal precioCalculado = 0;

              
                if (dto.ObraSocialId.HasValue)
                {
                    
                    precioCalculado = await _obraSocialService.CalcularPrecioTurnoAsync(dto.ObraSocialId);
                }
                var token = Guid.NewGuid().ToString("N");

                int duracion = await _configService.GetDuracionAsync(dto.TerapeutaId);

                var nuevaFechaFin = dto.FechaHora.AddMinutes(duracion);

                var turnosTerapeutaDia = await _teraDbContext.Turnos
                    .Where(t => t.TerapeutaId == dto.TerapeutaId && t.FechaHora.Date == dto.FechaHora.Date && (t.Estado == "Reservado" || t.Estado == "PendienteConfirmacion" || t.Estado == "Atendido"))
                    .ToListAsync();

                bool terapeutaOcupado = turnosTerapeutaDia.Any(t =>
                    t.FechaHora < nuevaFechaFin &&
                    t.FechaHora.AddMinutes(t.Duracion > 0 ? t.Duracion : 40) > dto.FechaHora);

                if (terapeutaOcupado)
                {
                    throw new InvalidOperationException("Lo sentimos, alguien más acaba de reservar este horario. Por favor, seleccione otro.");
                }

                var turno = new Turno
                {
                    FechaHora = dto.FechaHora,
                    PacienteId = pacienteId,
                    Estado = "PendienteConfirmacion",
                    TokenConfirmacion = token,
                    ObraSocialId = dto.ObraSocialId, 
                    Precio = precioCalculado,
                    Duracion = duracion,
                    TerapeutaId = dto.TerapeutaId

                };

                var turnoCreado = await _turnoRepository.Agregar(turno);
                await transaction.CommitAsync();



                var link = $"{_frontendBaseUrl}/confirmar-turno?token={token}&id={turnoCreado.Id}";

               

               

                var cuerpoPaciente = $@"
    <h1>Turno Confirmado</h1>
    <p>Hola {dto.Nombre}, te esperamos el {fechaLocal:dd/MM/yyyy} a las {fechaLocal:HH:mm} hs.</p>
    <p><strong>Para confirmar tu reserva, por favor haz clic en el siguiente enlace:</strong></p>
    <p><a href='{link}'>CONFIRMAR MI TURNO</a></p>
    <p>Si no fuiste tú, ignora este mensaje.</p>";

                _ = _emailService.SendEmailAsync(dto.Email, "Acción Requerida: Confirma tu Turno", cuerpoPaciente);


             


                var turnoConPaciente = await _turnoRepository.GetByIdConPaciente(turnoCreado.Id);

                try
                {
                    await _auditoriaService.RegistrarAsync(
                        accion: "RESERVA_PUBLICA",
                        modulo: "Turnos",
                        entidad: "Turno",
                        entidadId: turnoCreado.Id,
                        descripcion: $"Reserva pública: {dto.Nombre} {dto.Apellido} (DNI {dto.DNI}) reservó un turno para el {fechaLocal:dd/MM/yyyy} a las {fechaLocal:HH:mm} hs. Estado: PendienteConfirmación."
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al registrar auditoría de reserva pública: {ex.Message}");
                }

                return _mapper.Map<TurnoCalendarioDto>(turnoConPaciente);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> ConfirmarTurnoAsync(int id, string token)
        {
            var turno = await _turnoRepository.GetByIdConPaciente(id);

            if (turno == null) return false;

            if (turno.TokenConfirmacion == token && turno.Estado == "PendienteConfirmacion")
            {
                turno.Estado = "Reservado";
                turno.TokenConfirmacion = null;

                await _turnoRepository.Actualizar(turno);

                
                string timeZoneId = "Argentina Standard Time";
                TimeZoneInfo zonaHoraria;
                try
                {
                    zonaHoraria = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
                }
                catch (TimeZoneNotFoundException)
                {
                    zonaHoraria = TimeZoneInfo.FindSystemTimeZoneById("America/Argentina/Buenos_Aires");
                }

               
                var fechaUtc = DateTime.SpecifyKind(turno.FechaHora, DateTimeKind.Utc);
                var fechaLocal = TimeZoneInfo.ConvertTimeFromUtc(fechaUtc, zonaHoraria);
             
                try
                {
                    await _notificacionService.CrearNotificacionAsync(
                        usuarioDestinoId: turno.TerapeutaId,
                        titulo: "Turno Confirmado",
                      
                        mensaje: $"El paciente {turno.Paciente.Nombre} {turno.Paciente.Apellido} ha confirmado su turno del {fechaLocal:dd/MM} a las {fechaLocal:HH:mm} hs.",
                        referenciaId: turno.Id
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error notificación: {ex.Message}");
                }

                try
                {
                    await _auditoriaService.RegistrarAsync(
                        accion: "CONFIRMACION",
                        modulo: "Turnos",
                        entidad: "Turno",
                        entidadId: turno.Id,
                        descripcion: $"El paciente {turno.Paciente.Nombre} {turno.Paciente.Apellido} confirmó su turno del {fechaLocal:dd/MM/yyyy} a las {fechaLocal:HH:mm} hs."
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al registrar auditoría de confirmación: {ex.Message}");
                }

                return true;
            }

            return false;
        }

        public async Task<bool> RevertirEstadoTurnoAsync(int turnoId)
        {
            var turno = await _turnoRepository.GetById(turnoId);
            if (turno == null) return false;

            var estadoAnterior = turno.Estado;

            if (estadoAnterior == "Atendido" || estadoAnterior == "Ausente")
            {
                turno.Estado = "Pendiente";
                await _turnoRepository.Actualizar(turno);

                var sesion = await _sesionRepository.GetByTurnoIdAsync(turnoId);
                if (sesion != null)
                {
                    await _sesionRepository.Eliminar(sesion.Id);
                }

                await _auditoriaService.RegistrarAsync(
                    "Reversión de Estado",
                    "Turnos",
                    "Turno",
                    turno.Id,
                    $"Se revirtió el turno #{turno.Id} de '{estadoAnterior}' a 'Pendiente' por error del profesional."
                );

                return true;
            }
            return false;
        }


        public async Task<PagedResult<Core.DTOs.Paciente.TurnoPendientePagoDto>> GetTurnosPendientesPagoPaginadosAsync(int pacienteId, int pagina, int tamanio)
        {
            var (turnos, totalItems) = await _turnoRepository.GetTurnosPendientesPagoPaginadosAsync(pacienteId, pagina, tamanio);

            var dtos = turnos.Select(t => new Core.DTOs.Paciente.TurnoPendientePagoDto
            {
                Id = t.Id,
                FechaHora = t.FechaHora,
                Estado = t.Estado,
                Precio = t.Precio,
                TerapeutaNombre = t.Terapeuta != null ? $"{t.Terapeuta.Nombre} {t.Terapeuta.Apellido}".Trim() : "Sin asignar"
            }).ToList();

            int totalPages = (int)Math.Ceiling(totalItems / (double)tamanio);

            return new PagedResult<Core.DTOs.Paciente.TurnoPendientePagoDto>
            {
                Items = dtos,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = pagina
            };
        }

        /// <summary>Convierte un DateTime UTC a hora local de Argentina (UTC-3).</summary>
        private static DateTime ArTime(DateTime utcDt)
        {
            string tzId = System.Runtime.InteropServices.RuntimeInformation.IsOSPlatform(
                System.Runtime.InteropServices.OSPlatform.Windows)
                ? "Argentina Standard Time"
                : "America/Argentina/Buenos_Aires";
            return TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.SpecifyKind(utcDt, DateTimeKind.Utc),
                TimeZoneInfo.FindSystemTimeZoneById(tzId));
        }
    }


}

