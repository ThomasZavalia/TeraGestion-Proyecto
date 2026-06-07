using System;
using System.Collections.Generic;
using Core.DTOs.ObraSocial;
using Core.DTOs.Paciente;


namespace Core.DTOs.Paciente
{
    public class PacienteDetalleDTO
    {
        public int Id { get; set; }
        public string Nombre { get; set; }
        public string Apellido { get; set; }
        public string Dni { get; set; }
        public string Telefono { get; set; }
        public string Email { get; set; }
        public DateTime FechaNacimiento { get; set; }


        public ObraSocialSimpleDTO ObraSocial { get; set; }

       
       
       
        public bool TienePagosPendientes { get; set; }
        public int CantidadTurnosPendientesPago { get; set; }

    }

  
    public class TurnoPendientePagoDto
    {
        public int Id { get; set; }
        public DateTime FechaHora { get; set; }
        public string Estado { get; set; }
        public decimal Precio { get; set; }
        public string TerapeutaNombre { get; set; }
    }


}