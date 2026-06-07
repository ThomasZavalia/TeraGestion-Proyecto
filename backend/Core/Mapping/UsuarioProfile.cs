using AutoMapper;
using Core.DTOs.Disponiblidad.Input;
using Core.DTOs.Disponiblidad.Output;
using Core.DTOs.Usuario.Input;
using Core.DTOs.Usuario.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class UsuarioProfile : Profile
    {

        public UsuarioProfile()
        {
            CreateMap<Usuario, UsuarioDto>();

            CreateMap<UsuarioPerfilDto, Usuario>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Rol, opt => opt.Ignore())
               
                .ForMember(dest => dest.PorcentajeGanancia, opt => opt.Ignore());

            CreateMap<UsuarioActualizarDto, Usuario>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Activo, opt => opt.Ignore());
           
        }

    }
}

