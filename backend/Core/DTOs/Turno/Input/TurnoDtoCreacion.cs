using Core.Entidades;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.DTOs.Turno.Input
{
    public class TurnoDtoCreacion
    {
        public int? PacienteId { get; set; } 
        public string? NombrePaciente { get; set; }
        public string? ApellidoPaciente { get; set; }

        [StringLength(8)]
        public string? DNI { get; set; }

     
        public int? ObraSocialId { get; set; } 
        public bool EsParticular { get; set; } 
        public decimal? Precio { get; set; } 
        [Required]
        public DateTime Fecha { get; set; }

        public int TerapeutaId { get; set; }



    }
}
