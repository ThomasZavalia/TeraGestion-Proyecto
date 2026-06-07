using AutoMapper;
using Core.DTOs.Paciente;
using Core.DTOs.Turno.Input;
using Core.DTOs.Turno.Output;
using Core.Entidades;
using Core.Interfaces.Email;
using Core.Interfaces.Repositorios;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Core.Interfaces.Services;
using Infraestructure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Services;
using System.Security.Claims;
using Core.Interfaces;

namespace TeraGestion.Tests;

public class TurnoServiceTests
{
    private readonly TeraDbContext _teraDbContext;
    private readonly Mock<ITurnoRepository> _turnoRepoMock;
    private readonly Mock<IPacienteService> _pacienteServiceMock;
    private readonly Mock<IPagoService> _pagoServiceMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<IObraSocialService> _obraSocialMock;
    private readonly Mock<ISesionRepository> _sesionRepoMock;
    private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
    private readonly Mock<IDisponibilidadRepository> _disponibilidadRepoMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<INotificacionService> _notificacionServiceMock;
    private readonly Mock<IConfiguracionService> _configServiceMock;
    private readonly Mock<IPacienteRepository> _pacienteRepoMock;
    private readonly Mock<IAusenciaRepository> _ausenciaRepoMock;
    private readonly Mock<IAuditoriaService> _auditoriaServiceMock;


    private readonly TurnoService _turnoService;

    public TurnoServiceTests()
    {
        var options = new DbContextOptionsBuilder<TeraDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning)) 
        .Options;

        _teraDbContext = new TeraDbContext(options);

        _pacienteRepoMock = new Mock<IPacienteRepository>();
        _turnoRepoMock = new Mock<ITurnoRepository>();
        _pacienteServiceMock = new Mock<IPacienteService>();
        _pagoServiceMock = new Mock<IPagoService>();
        _mapperMock = new Mock<IMapper>();
        _obraSocialMock = new Mock<IObraSocialService>();
        _sesionRepoMock = new Mock<ISesionRepository>();
        _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
        _disponibilidadRepoMock = new Mock<IDisponibilidadRepository>();
        _emailServiceMock = new Mock<IEmailService>();
        _notificacionServiceMock = new Mock<INotificacionService>();
        _configServiceMock = new Mock<IConfiguracionService>();
        _ausenciaRepoMock = new Mock<IAusenciaRepository>();
            _auditoriaServiceMock = new Mock<IAuditoriaService>();


        var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] {
                new Claim(ClaimTypes.NameIdentifier, "2") 
            }));

        var context = new DefaultHttpContext { User = user };
        _httpContextAccessorMock.Setup(h => h.HttpContext).Returns(context);

       

        _turnoService = new TurnoService(
            _turnoRepoMock.Object,
            _pacienteServiceMock.Object,
            _pagoServiceMock.Object,
            _teraDbContext,
            _mapperMock.Object,
            _obraSocialMock.Object,
            _sesionRepoMock.Object,
            _httpContextAccessorMock.Object,
            _disponibilidadRepoMock.Object,
            _emailServiceMock.Object,
            _notificacionServiceMock.Object,
            _configServiceMock.Object,
            _ausenciaRepoMock.Object
           ,_auditoriaServiceMock.Object
        );
    }

    [Fact]
    public async Task GetAvailableSlots_DeberiaOcultarHorarios_SiHaySolapamiento()
    {
        // ARRANGE
        var fecha = new DateTime(2025, 12, 20);
        var terapeutaId = 2;


        _configServiceMock.Setup(c => c.GetDuracionAsync(It.IsAny<int>())).ReturnsAsync(40);

        
        var dispo = new Disponibilidad
        {
            Disponible = true,
            HoraInicio = new TimeSpan(8, 0, 0),
            HoraFin = new TimeSpan(12, 0, 0)
        };
        _disponibilidadRepoMock.Setup(d => d.GetByUserIdAndDayAsync(It.IsAny<int>(), It.IsAny<DayOfWeek>()))
                               .ReturnsAsync(dispo);

        // ACT
        var slots = await _turnoService.GetAvailableSlotsAsync(fecha,2);

        // ASSERT
        Assert.NotNull(slots);
        Assert.Contains("08:00", slots);
    }

    [Fact]
    public async Task GetAvailableSlots_DeberiaMostrarHorario_SiEmpiezaJustoCuandoTerminaElOtro()
    {
        // ARRANGE
        var fecha = new DateTime(2025, 12, 20); 
        _configServiceMock.Setup(c => c.GetDuracionAsync(It.IsAny<int>())).ReturnsAsync(30);
        var terapeutaId = 2;


        var dispo = new Disponibilidad
        {
            Disponible = true,
            HoraInicio = new TimeSpan(8, 0, 0), 
            HoraFin = new TimeSpan(12, 0, 0)   
        };

      
        _disponibilidadRepoMock.Setup(d => d.GetByUserIdAndDayAsync(It.IsAny<int>(), It.IsAny<DayOfWeek>()))
                               .ReturnsAsync(dispo);

        var turnos = new List<Turno> {
        new Turno {
            FechaHora = new DateTime(2025, 12, 20, 8, 0, 0),
            Duracion = 30
        }
    };
        _turnoRepoMock.Setup(r => r.GetTurnosByDayAsync(It.IsAny<DateTime>())).ReturnsAsync(turnos);

        // ACT
        var slots = await _turnoService.GetAvailableSlotsAsync(fecha,terapeutaId);

        // ASSERT
       
        Assert.NotEmpty(slots); 
        Assert.Contains("08:30", slots);
    }

    [Fact]
    public async Task CrearTurnoAsync_PacienteExistente_DeberiaRetornarTurnoMapeado()
    {
     // ARRANGE  
        var dto = new TurnoDtoCreacion { PacienteId = 1, ObraSocialId = 10, Fecha = DateTime.Now.AddDays(1) };
        var paciente = new PacienteDTO { Id = 1, Activo = true, ObraSocialId = 10 };
        var turnoGuardado = new Turno { Id = 50, PacienteId = 1 };

        _pacienteServiceMock.Setup(s => s.GetPacienteAsync(1)).ReturnsAsync(paciente);
        _obraSocialMock.Setup(s => s.CalcularPrecioTurnoAsync(10)).ReturnsAsync(5000);
        _configServiceMock.Setup(s => s.GetDuracionAsync(2)).ReturnsAsync(40);

        _turnoRepoMock.Setup(r => r.Agregar(It.IsAny<Turno>())).ReturnsAsync(turnoGuardado);
        _turnoRepoMock.Setup(r => r.GetByIdConPaciente(50)).ReturnsAsync(new Turno { Id = 50, Paciente = new Paciente() });
        _mapperMock.Setup(m => m.Map<TurnoCalendarioDto>(It.IsAny<Turno>())).Returns(new TurnoCalendarioDto { Id = 50 });

        // ACT
        var resultado = await _turnoService.CrearTurnoAsync(dto);

        // ASSERT
        Assert.NotNull(resultado);
        Assert.Equal(50, resultado.Id);
        _turnoRepoMock.Verify(r => r.Agregar(It.IsAny<Turno>()), Times.Once);
    }

    [Fact]
    public async Task CrearTurnoAsync_PacienteNuevo_DeberiaCrearPacienteYTurno()
    {
        // ARRANGE
        var dto = new TurnoDtoCreacion
        {
            DNI = "123456",
            NombrePaciente = "Thomas",
            ApellidoPaciente = "Zavalia",
            ObraSocialId = 1,
            Fecha = DateTime.Now.AddDays(1)
        };

        _pacienteServiceMock.Setup(s => s.GetPacientePorDniAsync("123456")).ReturnsAsync((PacienteDTO)null);
        _pacienteServiceMock.Setup(s => s.CrearPacienteAsync(It.IsAny<PacienteDTO>()))
                            .ReturnsAsync(new PacienteDTO { Id = 99, DNI = "123456" });

        _turnoRepoMock.Setup(r => r.Agregar(It.IsAny<Turno>())).ReturnsAsync(new Turno { Id = 100 });
        _turnoRepoMock.Setup(r => r.GetByIdConPaciente(100)).ReturnsAsync(new Turno { Id = 100, Paciente = new Paciente() });
        _mapperMock.Setup(m => m.Map<TurnoCalendarioDto>(It.IsAny<Turno>())).Returns(new TurnoCalendarioDto { Id = 100 });

        // ACT
        var resultado = await _turnoService.CrearTurnoAsync(dto);

        // ASSERT
        Assert.NotNull(resultado);
        _pacienteServiceMock.Verify(s => s.CrearPacienteAsync(It.IsAny<PacienteDTO>()), Times.Once);
    }

    [Fact]
    public async Task CrearTurnoAsync_SinDatosDePaciente_DeberiaLanzarArgumentException()
    {
        // ARRANGE
        var dto = new TurnoDtoCreacion { PacienteId = null, DNI = null };

        // ACT Y ASSERT
        var ex = await Assert.ThrowsAsync<ArgumentException>(() => _turnoService.CrearTurnoAsync(dto));
        Assert.Contains("Se debe proporcionar un PacienteId", ex.Message);
    }
}
