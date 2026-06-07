using AutoMapper;
using Core.DTOs.Ausencia.Output;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class AusenciaProfile:Profile
    {
        public AusenciaProfile()
        {
            CreateMap<Ausencia, AusenciaDto>().ReverseMap();
        }
    }
}
