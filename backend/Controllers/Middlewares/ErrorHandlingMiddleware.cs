using System.Net;
using System.Text.Json;

namespace Controllers.Middlewares
{
    public class ErrorHandlingMiddleware
    {

        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;
        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }
        public async Task Invoke(HttpContext context) 
        {
            try
            {
                await _next(context);
            }
            catch (ArgumentException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.BadRequest);
            }
            catch (KeyNotFoundException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.NotFound);
            }
            catch (UnauthorizedAccessException ex)
            {
                await HandleExceptionAsync(context, ex, HttpStatusCode.Unauthorized);
            }
            catch (Exception ex)
            {
            
                _logger.LogError(ex, "Unhandled exception");

                await HandleExceptionAsync(context, ex, HttpStatusCode.InternalServerError, hideDetails: !_env.IsDevelopment());
            }

        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception ex, HttpStatusCode statusCode, bool hideDetails = false)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = new
            {
                error = hideDetails ? "Error interno del servidor" : ex.Message,
                type = ex.GetType().Name
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }

    }
}
