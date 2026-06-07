namespace Core.DTOs.Paciente
{
    
    public class PagoHistorialDTO
    {
        public int Id { get; set; }
        public DateTime Fecha { get; set; }
        public decimal Monto { get; set; }
        public string MetodoPago { get; set; }
    }




}