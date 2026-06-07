using AutoMapper;
using Core.DTOs.Disponiblidad.Input;
using Core.DTOs.Disponiblidad.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class DisponibilidadProfile : Profile
    {
        public DisponibilidadProfile()
        {
            CreateMap<Disponibilidad, DisponibilidadDto>()
                .ForMember(dest => dest.DiaNombre, opt => opt.MapFrom(src => FormatDayOfWeekSpanish(src.DiaSemana)))
                .ForMember(dest => dest.HoraInicio, opt => opt.MapFrom(src => src.HoraInicio.HasValue ? src.HoraInicio.Value.ToString(@"hh\:mm") : null))
                .ForMember(dest => dest.HoraFin, opt => opt.MapFrom(src => src.HoraFin.HasValue ? src.HoraFin.Value.ToString(@"hh\:mm") : null));

            CreateMap<DisponibilidadDiaDto, Disponibilidad>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UsuarioId, opt => opt.Ignore())
                .ForMember(dest => dest.Usuario, opt => opt.Ignore())
             
                .ForMember(dest => dest.HoraInicio, opt => opt.MapFrom(src => ParseTimeSpan(src.HoraInicio)))
                .ForMember(dest => dest.HoraFin, opt => opt.MapFrom(src => ParseTimeSpan(src.HoraFin)));
        }

        private string FormatDayOfWeekSpanish(DayOfWeek dia)
        {
            return CultureInfo.GetCultureInfo("es-ES").DateTimeFormat.GetDayName(dia);
        }

        private TimeSpan? ParseTimeSpan(string timeString)
        {
            if (string.IsNullOrWhiteSpace(timeString)) return null;
            if (TimeSpan.TryParseExact(timeString, @"hh\:mm", CultureInfo.InvariantCulture, out TimeSpan result))
            {
                return result;
            }
            return null;
        }
    }

}
