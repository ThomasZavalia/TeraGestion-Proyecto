using AutoMapper;
using ClosedXML.Excel;
using Core.DTOs;
using Core.DTOs.Paciente;
using Core.DTOs.Pago.Output;
using Core.Entidades;
using Core.Interfaces;
using Core.Interfaces.Repositorios;
using Core.Interfaces.Services;
using Infrastructure.Repositorios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class PagoService : IPagoService
    {
        private readonly IPagosRepository _pagoRepository;
        private readonly IMapper _mapper;
        private readonly ITurnoRepository _turnoRepository;
        private readonly IAuditoriaService _auditoriaService;
        public PagoService(IPagosRepository pagoRepository,IMapper mapper, ITurnoRepository turnoRepository,IAuditoriaService auditoriaService)
        {
            _pagoRepository = pagoRepository;
            _mapper = mapper;
            _turnoRepository = turnoRepository;
            _auditoriaService = auditoriaService;
        }




        public async Task<Pago> ActualizarPago(Pago pago)
        {
            throw new NotImplementedException();
        }




        public async Task<PagoDto> CrearPago(PagoDto pagoDto)
        {
            if (pagoDto.Monto <= 0)
            {
                throw new ArgumentException("El monto debe ser mayor que cero.");
            }

            if (string.IsNullOrWhiteSpace(pagoDto.MetodoPago))
            {
                throw new ArgumentException("El método de pago no puede estar vacío.");
            }

            var nuevoPago = _mapper.Map<Pago>(pagoDto);

            var pagoCreado = await _pagoRepository.Agregar(nuevoPago);
            return _mapper.Map<PagoDto>(pagoCreado);
        }




        public async Task<bool> EliminarPago(int id)
        {
            var pagoExistente = await GetPago(id);
            if (pagoExistente == null)
            {
                throw new KeyNotFoundException("Pago no encontrado.");
            }

            return await _pagoRepository.Eliminar(id);
        }



        public async Task<PagoDto> GetPago(int id)
        {
            if (id <= 0)
            {
                throw new ArgumentException("El ID debe ser un número positivo.");
            }

            var pago = await _pagoRepository.GetById(id);

            if (pago == null)
            {
                throw new KeyNotFoundException("Pago no encontrado.");
            }

            return _mapper.Map<PagoDto>(pago);
        }




        public async Task<IEnumerable<PagoDto>> GetPagos()
        {
            var todosLosPagos = await _pagoRepository.ObtenerTodos();
            var pagosDto = _mapper.Map<IEnumerable<PagoDto>>(todosLosPagos);
            return pagosDto;
        }
        public async  Task<IEnumerable<Pago>> GetPagosSinDto()
        {
            return await _pagoRepository.ObtenerTodos();
        }

        public async Task<IEnumerable<PagoDetallesDto>> GetPagosAsync(DateTime? fechaDesde, DateTime? fechaHasta, int? pacienteId)
        {
            var pagos = await _pagoRepository.GetPagosFiltradosAsync(fechaDesde, fechaHasta, pacienteId);
           
            return _mapper.Map<IEnumerable<PagoDetallesDto>>(pagos);
        }

        public async Task<PagedResult<PagoDto>> GetPagosPaginadosAsync(
    int pagina, int tamanio, string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago)
        {
            var (pagos, totalItems) = await _pagoRepository.GetPagosPaginadosYFiltradosAsync(
                pagina, tamanio, busqueda, fechaDesde, fechaHasta, metodoPago);

            var pagosDto = _mapper.Map<IEnumerable<PagoDto>>(pagos);

            int totalPages = (int)Math.Ceiling(totalItems / (double)tamanio);

            return new PagedResult<PagoDto>
            {
                Items = pagosDto,
                TotalItems = totalItems,
                TotalPages = totalPages,
                CurrentPage = pagina
            };
        }

        public async Task<bool> AnularPagoAsync(int id)
        {
            var pago = await _pagoRepository.GetById(id);
            if (pago == null || pago.Anulado == true) return false;

            var turno = await _turnoRepository.GetById(pago.TurnoId);
            if (turno == null) return false;

            try
            {
                pago.Anulado = true;
                await _pagoRepository.Actualizar(pago);

               
                await _auditoriaService.RegistrarAsync(
             "Anulación",
             "Pagos",
             "Pago",
             pago.Id,
             $"Anuló el pago #{pago.Id} de ${pago.Monto}."
              );
            

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al anular pago: {ex.Message}");
                return false;
            }
        }




        public async Task<byte[]> ExportarExcelAsync(string? busqueda, DateTime? fechaDesde, DateTime? fechaHasta, string? metodoPago)
        {
            var (pagos, _) = await _pagoRepository.GetPagosPaginadosYFiltradosAsync(
                1, int.MaxValue, busqueda, fechaDesde, fechaHasta, metodoPago);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Pagos Registrados");

            worksheet.Cell("A1").Value = "REPORTE DE PAGOS - TERAGESTIÓN";
            worksheet.Range("A1:G1").Merge().Style.Font.SetBold().Font.FontSize = 16;
            worksheet.Range("A1:G1").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            worksheet.Cell("A2").Value = $"Generado el: {DateTime.Now:dd/MM/yyyy HH:mm}";
            worksheet.Range("A2:G2").Merge().Style.Font.SetItalic();

            int startRow = 4;
            worksheet.Cell(startRow, 1).Value = "Fecha del Pago";
            worksheet.Cell(startRow, 2).Value = "Fecha del Turno";
            worksheet.Cell(startRow, 3).Value = "Profesional";
            worksheet.Cell(startRow, 4).Value = "Paciente";
            worksheet.Cell(startRow, 5).Value = "DNI";
            worksheet.Cell(startRow, 6).Value = "Monto";
            worksheet.Cell(startRow, 7).Value = "Método de Pago";

            int row = startRow + 1;
            decimal totalMonto = 0; 

            foreach (var pago in pagos)
            {
                worksheet.Cell(row, 1).Value = pago.Fecha.ToString("dd/MM/yyyy HH:mm");
                worksheet.Cell(row, 2).Value = pago.Turno.FechaHora.ToString("dd/MM/yyyy HH:mm");
                worksheet.Cell(row, 3).Value = string.IsNullOrWhiteSpace(pago.Turno.Terapeuta.Titulo)
                    ? $"{pago.Turno.Terapeuta.Nombre} {pago.Turno.Terapeuta.Apellido}"
                    : $"{pago.Turno.Terapeuta.Titulo} {pago.Turno.Terapeuta.Nombre} {pago.Turno.Terapeuta.Apellido}";
                worksheet.Cell(row, 4).Value = $"{pago.Turno.Paciente.Nombre} {pago.Turno.Paciente.Apellido}";
                worksheet.Cell(row, 5).Value = pago.Turno.Paciente.DNI;

                worksheet.Cell(row, 6).Value = pago.Monto ?? 0;
                worksheet.Cell(row, 6).Style.NumberFormat.Format = "$ #,##0.00";
                totalMonto += pago.Monto ?? 0;

                worksheet.Cell(row, 7).Value = pago.MetodoPago;
                row++;
            }

            if (pagos.Any())
            {
                var tableRange = worksheet.Range(startRow, 1, row - 1, 7);
                var excelTable = tableRange.CreateTable("TablaPagos");
                excelTable.Theme = XLTableTheme.TableStyleMedium2; 
            }
        
            worksheet.Cell(row + 1, 5).Value = "TOTAL FACTURADO:";
            worksheet.Cell(row + 1, 5).Style.Font.SetBold().Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            worksheet.Cell(row + 1, 6).Value = totalMonto;
            worksheet.Cell(row + 1, 6).Style.NumberFormat.Format = "$ #,##0.00";
            worksheet.Cell(row + 1, 6).Style.Font.SetBold();

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<PagedResult<PagoHistorialDTO>> GetPagosPaginadosAsync(
    int pacienteId, int pagina, int tamanio, DateTime? desde, DateTime? hasta, string? metodoPago)
        {
            var (items, totalItems) = await _pagoRepository.GetPaginadosPorPacienteAsync(
                pacienteId, pagina, tamanio, desde, hasta, metodoPago);

            var dtos = _mapper.Map<List<PagoHistorialDTO>>(items.ToList());

            return new PagedResult<PagoHistorialDTO>
            {
                Items = dtos,
                TotalItems = totalItems,
                CurrentPage = pagina,
                TotalPages = (int)Math.Ceiling(totalItems / (double)tamanio)
            };
        }

    }
}
