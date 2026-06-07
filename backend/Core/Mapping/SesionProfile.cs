using AutoMapper;
using Core.DTOs.Sesion.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class SesionProfile:Profile
    {

        public SesionProfile()
        {
            CreateMap<SesionDTO, Sesion>();
            CreateMap<Sesion, SesionDTO>();
        }
    }
}
