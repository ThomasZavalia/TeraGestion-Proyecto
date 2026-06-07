using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Hubs
{
    public class NotificacionesHub:Hub
    {
        public override Task OnConnectedAsync()
        {
           
            var userId = Context.UserIdentifier;
            Console.WriteLine($"[SIGNALR CONECTADO] ConnectionId: {Context.ConnectionId} - UserID Detectado: {userId ?? "ANÓNIMO (ERROR)"}");

            return base.OnConnectedAsync();
        }
    }
}
