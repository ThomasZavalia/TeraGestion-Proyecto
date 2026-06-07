using AutoMapper;
using Core.DTOs.ObraSocial;
using Core.Entidades;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Mapping
{
    public class ObraSocialProfile:Profile
    {
        public ObraSocialProfile()
        {
            CreateMap<ObraSocial, ObraSocialDto>().ReverseMap();
          
        }

    }
}
