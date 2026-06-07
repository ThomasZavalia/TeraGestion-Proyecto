using Core.Entidades;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Core.DTOs.Paciente;
using Core.DTOs.ObraSocial;

namespace Core.Mapping
{
    public class PacienteProfile:Profile
    {
        public PacienteProfile()
        {
            
            CreateMap<PacienteDTO, Paciente>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                
                .ForMember(dest => dest.ObraSocial, opt => opt.Ignore());

            CreateMap<Paciente, PacienteDTO>();


            CreateMap<ObraSocial, ObraSocialSimpleDTO>();

            CreateMap<Paciente, PacienteSimpleDto>();






            CreateMap<Sesion, SesionHistorialDTO>()
                  .ForMember(dest => dest.Fecha, opt => opt.MapFrom(src => src.FechaHoraInicio))
                  .ForMember(dest => dest.Notas, opt => opt.MapFrom(src => src.Notas))
                  .ForMember(dest => dest.TurnoId, opt => opt.MapFrom(src => src.TurnoId)); 


            CreateMap<Pago, PagoHistorialDTO>();


            CreateMap<Paciente, PacienteDetalleDTO>()
     .ForMember(dest => dest.ObraSocial, opt => opt.MapFrom(src => src.ObraSocial))
    //.ForMember(dest => dest.Sesiones, opt => opt.MapFrom(src => src.Sesiones)) 
    /*.ForMember(dest => dest.Pagos, opt => opt.MapFrom(src => src.Turnos 
        .Where(t => t.Pagos != null && t.Pagos.Any()) 
        .SelectMany(t => t.Pagos) 
        .Distinct() 
   ))*/;
        }
    }
}
