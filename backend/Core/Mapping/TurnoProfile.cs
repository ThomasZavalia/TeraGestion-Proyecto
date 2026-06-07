using AutoMapper;
using Core.DTOs.Paciente;
using Core.DTOs.Turno.Input;
using Core.DTOs.Turno.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class TurnoProfile:Profile
    {

        public TurnoProfile()
        {
            CreateMap<TurnoDto, Turno>();
            CreateMap<Turno, TurnoDto>()
                .ForMember(dest => dest.EstaPagado, opt => opt.MapFrom(src => src.Pagos != null && src.Pagos.Any()));


            CreateMap<Turno, TurnoCalendarioDto>()
     .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))

     .ForMember(dest => dest.Start, opt => opt.MapFrom(src => src.FechaHora))
     .ForMember(dest => dest.FechaHora, opt => opt.MapFrom(src => src.FechaHora)) 
    .ForMember(dest => dest.End, opt => opt.MapFrom(src =>
        src.FechaHora.AddMinutes(src.Duracion > 0 ? src.Duracion : 40)))

    .ForMember(dest => dest.Duracion, opt => opt.MapFrom(src => src.Duracion))


     .ForMember(dest => dest.Title, opt => opt.MapFrom(src =>
         $"{src.Paciente.Nombre} {src.Paciente.Apellido}"))

     .ForMember(dest => dest.Estado, opt => opt.MapFrom(src => src.Estado)) 
     .ForMember(dest => dest.Precio, opt => opt.MapFrom(src => src.Precio))
     .ForMember(dest => dest.PacienteId, opt => opt.MapFrom(src => src.PacienteId))
     .ForMember(dest => dest.ObraSocialId, opt => opt.MapFrom(src => src.ObraSocialId))
      .ForMember(dest => dest.TerapeutaNombre,
                       opt => opt.MapFrom(src => src.Terapeuta.Nombre))
            .ForMember(dest => dest.TerapeutaApellido,
                       opt => opt.MapFrom(src => src.Terapeuta.Apellido))
            .ForMember(dest => dest.EstaPagado, opt => opt.MapFrom(src => src.Pagos != null && src.Pagos.Any(p => p.Anulado != true)));





            CreateMap<Turno, TurnoDetalleDto>()
                .ForMember(dest => dest.PacienteNombre, opt => opt.MapFrom(src => $"{src.Paciente.Nombre} {src.Paciente.Apellido}"))
                .ForMember(dest => dest.TerapeutaNombreCompleto, opt => opt.MapFrom(src =>
        src.Terapeuta != null ? $"{src.Terapeuta.Nombre} {src.Terapeuta.Apellido}" : "Sin asignar"))
            .ForMember(dest => dest.EstaPagado, opt => opt.MapFrom(src => src.Pagos != null && src.Pagos.Any(p => p.Anulado != true)))
           .ForMember(dest => dest.TerapeutaNombreCompletoProfesional, opt => opt.MapFrom(src =>
    string.IsNullOrWhiteSpace(src.Terapeuta.Titulo)
        ? src.Terapeuta.Nombre + " " + src.Terapeuta.Apellido
        : src.Terapeuta.Titulo + " " + src.Terapeuta.Nombre + " " + src.Terapeuta.Apellido));
        }
        }
    }

