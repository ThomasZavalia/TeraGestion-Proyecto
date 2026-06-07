using Infraestructure; // Tu DbContext
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Controllers.Middlewares 
{
    public class CheckUsuarioActivoMiddleware
    {
        private readonly RequestDelegate _next;

        public CheckUsuarioActivoMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, TeraDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userIdString = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (int.TryParse(userIdString, out int userId))
                {
                    var usuarioActivo = await dbContext.Usuarios
                        .AsNoTracking() 
                        .AnyAsync(u => u.Id == userId && u.Activo == true);

                    if (!usuarioActivo)
                    {
                        context.Response.StatusCode = 401; 
                        await context.Response.WriteAsync("Tu cuenta ha sido bloqueada por el Administrador.");
                        return; 
                    }
                }
            }

            await _next(context);
        }
    }
}