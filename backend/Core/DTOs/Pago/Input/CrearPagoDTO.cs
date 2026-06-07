namespace Core.DTOs.Pago.Input
{
    public class CrearPagoDTO
    {
        public decimal Monto { get; set; }
        public string MetodoPago { get; set; }
        public int TurnoId { get; set; }
    }

}