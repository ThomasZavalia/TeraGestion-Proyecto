using ClosedXML.Excel;
using Core.DTOs.Reportes;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class ReportesService : IReportesService
    {
        private readonly IPacienteService _pacienteService;
        private readonly IPagoService _pagoService;
        private readonly ITurnoService _turnoService;
        private readonly IUsuariosRepository _usuarioRepository;
        private readonly ITurnoRepository _turnoRepository;


        public ReportesService(IPacienteService pacienteService, ITurnoService turnoService, IPagoService pagoService, IUsuariosRepository usuariosRepository, ITurnoRepository turnoRepository)

        {
            _pacienteService = pacienteService;
            _turnoService = turnoService;
            _pagoService = pagoService;
            _usuarioRepository = usuariosRepository;
            _turnoRepository = turnoRepository;
        }

        public async Task<IEnumerable<ReporteMesDto>> GetTurnosPorMes(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var turnosQuery = (await _turnoService.GetTurnosSinDto()).AsQueryable();


            if (fechaDesde.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date >= fechaDesde.Value.Date);
            if (fechaHasta.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date <= fechaHasta.Value.Date);

            var query = turnosQuery
                .GroupBy(t => new { t.FechaHora.Year, t.FechaHora.Month })
                .Select(g => new ReporteMesDto
                {

                    Mes = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy", new System.Globalization.CultureInfo("es-ES")),
                    Valor = g.Count()
                })
                .OrderBy(r => r.Mes)
                .ToList();

            return query;
        }
        public async Task<IEnumerable<ReporteMesDto>> GetIngresosPorMes(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var pagosQuery = (await _pagoService.GetPagosSinDto())
                             .Where(p => p.Turno != null && p.Anulado != true && p.Turno.Terapeuta != null);

            if (fechaDesde.HasValue) pagosQuery = pagosQuery.Where(p => p.Fecha.Date >= fechaDesde.Value.Date);
            if (fechaHasta.HasValue) pagosQuery = pagosQuery.Where(p => p.Fecha.Date <= fechaHasta.Value.Date);

            var query = pagosQuery
                .GroupBy(p => new { p.Fecha.Year, p.Fecha.Month })
                .Select(g => {
                   
                    decimal totalFacturado = g.Sum(p => p.Monto ?? 0);

                    // Usamos el porcentaje fijado al momento del cobro.
                    // Si no existe (pagos anteriores al fix), usamos el actual del terapeuta.
                    decimal pagoTerapeutas = g.Sum(p =>
                        (p.Monto ?? 0) * (
                            (p.PorcentajeTerapeutaAplicado ?? p.Turno.Terapeuta.PorcentajeGanancia) / 100m
                        ));

                    decimal gananciaClinica = totalFacturado - pagoTerapeutas;

                    return new ReporteMesDto
                    {
                        Mes = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMMM yyyy", new System.Globalization.CultureInfo("es-ES")),
                        Valor = totalFacturado, 
                        TotalFacturado = totalFacturado,
                        PagoTerapeutas = pagoTerapeutas,
                        GananciaClinica = gananciaClinica
                    };
                })
                .OrderBy(r => r.Mes)
                .ToList();

            return query;
        }

        public async Task<IEnumerable<ReporteEstadoDto>> GetTurnoPorEstado(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var turnosQuery = (await _turnoService.GetTurnosSinDto()).AsQueryable();

            if (fechaDesde.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date >= fechaDesde.Value.Date);
            if (fechaHasta.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date <= fechaHasta.Value.Date);

            var query = turnosQuery.GroupBy(t => t.Estado)
                .Select(g => new ReporteEstadoDto
                {
                    Estado = g.Key,
                    Cantidad = g.Count()

                }).ToList();
            return query;
        }

        public async Task<IEnumerable<ReporteMetodoPagoDto>> GetMetodosPagoDto(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var pagosQuery = (await _pagoService.GetPagosSinDto()).AsQueryable();

            if (fechaDesde.HasValue) pagosQuery = pagosQuery.Where(p => p.Fecha.Date >= fechaDesde.Value.Date);
            if (fechaHasta.HasValue) pagosQuery = pagosQuery.Where(p => p.Fecha.Date <= fechaHasta.Value.Date);

            var query = pagosQuery.GroupBy(p => p.MetodoPago)
                .Select(g => new ReporteMetodoPagoDto
                {
                    MetodoPago = g.Key,
                    Cantidad = g.Count()
                }).ToList();
            return query;
        }

        public async Task<IEnumerable<ReporteTopPacienteDto>> GetTopPacientes(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var topPacientesTupla = await _turnoRepository.GetTopPacientesReporteAsync();

            var query = topPacientesTupla.AsQueryable();

            // Nota: GetTopPacientesReporteAsync devuelve tuplas (Paciente, Turnos).
            // El filtro de fechas se aplica a nivel de servicio sobre los turnos ya cargados.
            return topPacientesTupla.Select(p => new ReporteTopPacienteDto
            {
                Paciente = p.Paciente,
                Turnos = p.Turnos
            }).ToList();
        }

        public async Task<IEnumerable<ReporteEstadoDto>> GetTurnosPorObraSocial(DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var turnosQuery = (await _turnoService.GetTurnosSinDto()).AsQueryable();

            if (fechaDesde.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date >= fechaDesde.Value.Date);
            if (fechaHasta.HasValue) turnosQuery = turnosQuery.Where(t => t.FechaHora.Date <= fechaHasta.Value.Date);

            var query = turnosQuery
                .Where(t => t.ObraSocialId != null && t.ObraSocial != null)
                .GroupBy(t => t.ObraSocial.Nombre)
                .Select(g => new ReporteEstadoDto
                {
                    Estado = g.Key,
                    Cantidad = g.Count()
                })
                .OrderByDescending(x => x.Cantidad)
                .ToList();

            return query;
        }



        public async Task<byte[]> GenerarExcelReporteCompleto(DateTime? fechaDesde, DateTime? fechaHasta)
        {
           
            var ingresosPorMes    = await GetIngresosPorMes(fechaDesde, fechaHasta);
            var turnosPorMes      = await GetTurnosPorMes(fechaDesde, fechaHasta);
            var topPacientes      = await GetTopPacientes(fechaDesde, fechaHasta);
            var estadosTurnos     = await GetTurnoPorEstado(fechaDesde, fechaHasta);
            var metodosPago       = await GetMetodosPagoDto(fechaDesde, fechaHasta);
            var obrasSociales     = await GetTurnosPorObraSocial(fechaDesde, fechaHasta);

            var colorHeaderFin    = XLColor.FromHtml("#1F3864"); // azul oscuro
            var colorHeaderAct    = XLColor.FromHtml("#375623"); // verde oscuro
            var colorHeaderRank   = XLColor.FromHtml("#7B3F00"); // marrón oscuro
            var colorTextoBlanco  = XLColor.White;

            using (var workbook = new XLWorkbook())
            {
                
                var hojaFinanzas = workbook.Worksheets.Add("Finanzas");

                var tituloFin = hojaFinanzas.Range("A1:D1");
                tituloFin.Merge();
                tituloFin.FirstCell().Value = "REPORTE FINANCIERO - TERAGESTIÓN";
                tituloFin.Style.Font.SetBold(true).Font.FontSize = 16;
                tituloFin.Style.Font.FontColor = colorHeaderFin;

                hojaFinanzas.Cell("A2").Value = $"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}";
                hojaFinanzas.Range("A2:D2").Merge().Style.Font.SetItalic().Font.FontColor = XLColor.Gray;

                string[] headersFinanzas = { "Mes", "Facturación Bruta", "Honorarios Profesionales", "Ganancia Neta Clínica" };
                for (int i = 0; i < headersFinanzas.Length; i++)
                {
                    var cell = hojaFinanzas.Cell(4, i + 1);
                    cell.Value = headersFinanzas[i];
                    cell.Style.Font.SetBold(true).Font.FontColor = colorTextoBlanco;
                    cell.Style.Fill.BackgroundColor = colorHeaderFin;
                    cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                }

               
                int filaFin = 5;
                foreach (var item in ingresosPorMes)
                {
                    hojaFinanzas.Cell(filaFin, 1).Value = item.Mes;

                    hojaFinanzas.Cell(filaFin, 2).Value = (double)item.TotalFacturado;
                    hojaFinanzas.Cell(filaFin, 2).Style.NumberFormat.Format = "\"$\" #,##0.00";

                    hojaFinanzas.Cell(filaFin, 3).Value = (double)item.PagoTerapeutas;
                    hojaFinanzas.Cell(filaFin, 3).Style.NumberFormat.Format = "\"$\" #,##0.00";

                    hojaFinanzas.Cell(filaFin, 4).Value = (double)item.GananciaClinica;
                    hojaFinanzas.Cell(filaFin, 4).Style.NumberFormat.Format = "\"$\" #,##0.00";

                    filaFin++;
                }

                if (ingresosPorMes.Any())
                {
                    var tblFinanzas = hojaFinanzas.Range(4, 1, filaFin - 1, 4).CreateTable("TablaFinanzas");
                    tblFinanzas.Theme = XLTableTheme.TableStyleMedium2;
                    tblFinanzas.ShowTotalsRow = true;
                    tblFinanzas.Field(1).TotalsRowFunction = XLTotalsRowFunction.Sum;
                    tblFinanzas.Field(2).TotalsRowFunction = XLTotalsRowFunction.Sum;
                    tblFinanzas.Field(3).TotalsRowFunction = XLTotalsRowFunction.Sum;
                }
                else
                {
                    
                    hojaFinanzas.Cell(5, 1).Value = "Sin pagos registrados en el período seleccionado.";
                    hojaFinanzas.Cell(5, 1).Style.Font.SetItalic().Font.FontColor = XLColor.Gray;
                }
                hojaFinanzas.Columns().AdjustToContents();

                var hojaTurnos = workbook.Worksheets.Add("Actividad y Estados");

                var tituloAct = hojaTurnos.Range("A1:E1");
                tituloAct.Merge();
                tituloAct.FirstCell().Value = "REPORTE DE ACTIVIDAD MENSUAL";
                tituloAct.Style.Font.SetBold(true).Font.FontSize = 14;
                tituloAct.Style.Font.FontColor = colorHeaderAct;

               
                hojaTurnos.Cell(3, 1).Value = "Mes";
                hojaTurnos.Cell(3, 2).Value = "Cantidad de Turnos";
                StyleHeader(hojaTurnos.Cell(3, 1), colorHeaderAct);
                StyleHeader(hojaTurnos.Cell(3, 2), colorHeaderAct);

                int filaTurnos = 4;
                foreach (var item in turnosPorMes)
                {
                    hojaTurnos.Cell(filaTurnos, 1).Value = item.Mes;
                    hojaTurnos.Cell(filaTurnos, 2).Value = (int)item.Valor;
                    filaTurnos++;
                }
                if (turnosPorMes.Any())
                {
                    var tblTurnos = hojaTurnos.Range(3, 1, filaTurnos - 1, 2).CreateTable("TablaTurnos");
                    tblTurnos.Theme = XLTableTheme.TableStyleMedium14;
                }
                else
                {
                    hojaTurnos.Cell(4, 1).Value = "Sin turnos en el período.";
                    hojaTurnos.Cell(4, 1).Style.Font.SetItalic().Font.FontColor = XLColor.Gray;
                }

                hojaTurnos.Cell(3, 4).Value = "Estado del Turno";
                hojaTurnos.Cell(3, 5).Value = "Cantidad";
                StyleHeader(hojaTurnos.Cell(3, 4), colorHeaderAct);
                StyleHeader(hojaTurnos.Cell(3, 5), colorHeaderAct);

                int filaEstados = 4; 
                foreach (var item in estadosTurnos)
                {
                    hojaTurnos.Cell(filaEstados, 4).Value = item.Estado;
                    hojaTurnos.Cell(filaEstados, 5).Value = item.Cantidad;
                    filaEstados++;
                }
                if (estadosTurnos.Any())
                {
                    var tblEstados = hojaTurnos.Range(3, 4, filaEstados - 1, 5).CreateTable("TablaEstados");
                    tblEstados.Theme = XLTableTheme.TableStyleMedium14;
                }
                hojaTurnos.Columns().AdjustToContents();

              
                var hojaRankings = workbook.Worksheets.Add("Métricas Clave");

                var tituloRank = hojaRankings.Range("A1:H1");
                tituloRank.Merge();
                tituloRank.FirstCell().Value = "RANKINGS Y DISTRIBUCIÓN";
                tituloRank.Style.Font.SetBold(true).Font.FontSize = 14;
                tituloRank.Style.Font.FontColor = colorHeaderRank;

               
                hojaRankings.Cell(3, 1).Value = "Top Pacientes";
                hojaRankings.Cell(3, 2).Value = "Turnos";
                StyleHeader(hojaRankings.Cell(3, 1), colorHeaderRank);
                StyleHeader(hojaRankings.Cell(3, 2), colorHeaderRank);

                int filaPac = 4;
                foreach (var p in topPacientes)
                {
                    hojaRankings.Cell(filaPac, 1).Value = p.Paciente;
                    hojaRankings.Cell(filaPac, 2).Value = p.Turnos;
                    filaPac++;
                }
                if (topPacientes.Any())
                {
                    var tblPac = hojaRankings.Range(3, 1, filaPac - 1, 2).CreateTable("TablaTopPacientes");
                    tblPac.Theme = XLTableTheme.TableStyleMedium10;
                }

               
                hojaRankings.Cell(3, 4).Value = "Método de Pago";
                hojaRankings.Cell(3, 5).Value = "Uso";
                StyleHeader(hojaRankings.Cell(3, 4), colorHeaderRank);
                StyleHeader(hojaRankings.Cell(3, 5), colorHeaderRank);

                int filaMet = 4;
                foreach (var m in metodosPago)
                {
                    hojaRankings.Cell(filaMet, 4).Value = m.MetodoPago;
                    hojaRankings.Cell(filaMet, 5).Value = m.Cantidad;
                    filaMet++;
                }
                if (metodosPago.Any())
                {
                    var tblMet = hojaRankings.Range(3, 4, filaMet - 1, 5).CreateTable("TablaMetodos");
                    tblMet.Theme = XLTableTheme.TableStyleMedium10;
                }

               
                hojaRankings.Cell(3, 7).Value = "Obra Social";
                hojaRankings.Cell(3, 8).Value = "Turnos";
                StyleHeader(hojaRankings.Cell(3, 7), colorHeaderRank);
                StyleHeader(hojaRankings.Cell(3, 8), colorHeaderRank);

                int filaOS = 4;
                foreach (var o in obrasSociales)
                {
                    hojaRankings.Cell(filaOS, 7).Value = o.Estado;
                    hojaRankings.Cell(filaOS, 8).Value = o.Cantidad;
                    filaOS++;
                }
                if (obrasSociales.Any())
                {
                    var tblObras = hojaRankings.Range(3, 7, filaOS - 1, 8).CreateTable("TablaObrasSociales");
                    tblObras.Theme = XLTableTheme.TableStyleMedium10;
                }
                hojaRankings.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        private static void StyleHeader(IXLCell cell, XLColor bgColor)
        {
            cell.Style.Font.SetBold(true);
            cell.Style.Font.FontColor = XLColor.White;
            cell.Style.Fill.BackgroundColor = bgColor;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        public async Task<ReporteTerapeutaDto> GetRendimientoTerapeutaAsync(int terapeutaId, DateTime? fechaDesde = null, DateTime? fechaHasta = null)
        {
            var inicioPeriodo = fechaDesde ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var finPeriodo = fechaHasta ?? DateTime.MaxValue;

            var todosLosTurnos = await _turnoRepository.GetTurnosHistoricoTerapeutaAsync(terapeutaId);

            var terapeuta = await _usuarioRepository.GetById(terapeutaId);
            decimal porcentaje = terapeuta.PorcentajeGanancia / 100m;

            var turnosPeriodo = todosLosTurnos
                .Where(t => t.FechaHora.Date >= inicioPeriodo.Date && t.FechaHora.Date <= finPeriodo.Date)
                .ToList();

            int turnosAtendidos = turnosPeriodo.Count(t => t.Estado == "Atendido");

            int pacientesUnicos = turnosPeriodo
                .Where(t => t.Estado == "Atendido")
                .Select(t => t.PacienteId)
                .Distinct()
                .Count();

            int turnosFinalizados = turnosPeriodo.Count(t => t.Estado == "Atendido" || t.Estado == "Ausente");

            double tasaAsistencia = turnosFinalizados > 0
                ? Math.Round((double)turnosAtendidos / turnosFinalizados * 100, 2)
                : 0;

            var turnosPagados = turnosPeriodo.Where(t =>
                (t.Estado == "Atendido" || t.Estado == "Ausente") &&
                 t.Pagos != null &&
                 t.Pagos.Any(p => p.Anulado != true));
           
            decimal ganancias = turnosPagados.Sum(t =>
                t.Pagos
                    .Where(p => p.Anulado != true)
                    .Sum(p => t.Precio * ((p.PorcentajeTerapeutaAplicado ?? terapeuta.PorcentajeGanancia) / 100m)));

            var topPacientes = turnosPeriodo
                .Where(t => t.Estado == "Atendido")
                .GroupBy(t => new { t.Paciente.Nombre, t.Paciente.Apellido })
                .Select(g => new TopPacienteDto
                {
                    NombreCompleto = $"{g.Key.Nombre} {g.Key.Apellido}",
                    CantidadTurnos = g.Count()
                })
                .OrderByDescending(x => x.CantidadTurnos).Take(5).ToList();


            var evolucionGanancias = todosLosTurnos
                .Where(t =>
                (t.Estado == "Atendido" || t.Estado == "Ausente") &&
                 t.Pagos != null &&
                 t.Pagos.Any(p => p.Anulado != true))

                .Where(t => (!fechaDesde.HasValue || t.FechaHora.Date >= fechaDesde.Value.Date) &&
                            (!fechaHasta.HasValue || t.FechaHora.Date <= fechaHasta.Value.Date))
                .GroupBy(t => new { t.FechaHora.Year, t.FechaHora.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new ReporteMesDto
                {
                    Mes = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM yyyy", new System.Globalization.CultureInfo("es-ES")),
                    Valor = g.Sum(t => t.Precio) * porcentaje
                }).ToList();

            var distribucionEstados = turnosPeriodo
                .GroupBy(t => t.Estado)
                .Select(g => new ReporteEstadoDto
                {
                    Estado = g.Key,
                    Cantidad = g.Count()
                }).ToList();

            return new ReporteTerapeutaDto
            {
                TurnosAtendidosMes = turnosAtendidos,
                PacientesUnicosMes = pacientesUnicos,
                TasaAsistencia = tasaAsistencia,
                TopPacientes = topPacientes,
                GananciasEstimadasMes = ganancias,
                EvolucionGanancias = evolucionGanancias, 
                DistribucionEstados = distribucionEstados 
            };
        }

    }
}


