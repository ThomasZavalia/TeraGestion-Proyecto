using AutoMapper;
using Core.DTOs.Pago.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class PagoProfile:Profile
    {

        public PagoProfile()
        {
            CreateMap<PagoDto, Pago>();
            CreateMap<Pago, PagoDto>()
                 .ForMember(dest => dest.PacienteNombre, opt => opt.MapFrom(src => src.Turno.Paciente.Nombre))
                 .ForMember(dest => dest.PacienteApellido, opt => opt.MapFrom(src => src.Turno.Paciente.Apellido))
               
                 .ForMember(dest => dest.FechaTurno, opt => opt.MapFrom(src => src.Turno.FechaHora))
                .ForMember(dest => dest.TerapeutaTurno, opt => opt.MapFrom(src =>
                 string.IsNullOrWhiteSpace(src.Turno.Terapeuta.Titulo)
                     ? src.Turno.Terapeuta.Nombre + " " + src.Turno.Terapeuta.Apellido
                     : src.Turno.Terapeuta.Titulo + " " + src.Turno.Terapeuta.Nombre + " " + src.Turno.Terapeuta.Apellido));

            CreateMap<Pago, PagoDetallesDto>()
                .ForMember(dest => dest.PacienteId, opt => opt.MapFrom(src => src.Turno.Paciente.Id))
                .ForMember(dest => dest.PacienteNombre, opt => opt.MapFrom(src => src.Turno.Paciente.Nombre))
                .ForMember(dest => dest.PacienteApellido, opt => opt.MapFrom(src => src.Turno.Paciente.Apellido))
               
                .ForMember(dest => dest.FechaTurno, opt => opt.MapFrom(src => src.Turno.FechaHora))
               .ForMember(dest => dest.TerapeutaTurno, opt => opt.MapFrom(src =>
                 string.IsNullOrWhiteSpace(src.Turno.Terapeuta.Titulo)
                     ? src.Turno.Terapeuta.Nombre + " " + src.Turno.Terapeuta.Apellido
                     : src.Turno.Terapeuta.Titulo + " " + src.Turno.Terapeuta.Nombre + " " + src.Turno.Terapeuta.Apellido));
        }
    
}
}
