using AutoMapper;
using Core.DTOs.Usuario.Input;
using Core.DTOs.Usuario.Output;
using Core.Entidades;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsuarioController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly IMapper _mapper;

        public UsuarioController(IUsuarioService usuarioService, IMapper mapper)
        {
            _usuarioService = usuarioService;
            _mapper = mapper;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUsuario(int id)
        {
            var usuarioDto = await _usuarioService.GetUsuarioById(id);
            
            return Ok(usuarioDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetUsuarios()
        {
            var usuariosDto = await _usuarioService.GetUsuarios();
            return Ok(usuariosDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CrearUsuario([FromBody] Usuario usuario) 
        {
           
            var nuevoUsuario = await _usuarioService.CrearUsuario(usuario);
            
            var nuevoUsuarioDto = _mapper.Map<UsuarioDto>(nuevoUsuario); 
            return CreatedAtAction(nameof(GetUsuario), new { id = nuevoUsuario.Id }, nuevoUsuarioDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarUsuario(int id, [FromBody] UsuarioActualizarDto dto) 
        {
            var usuarioActualizadoDto = await _usuarioService.ActualizarUsuario(id, dto);
            return Ok(usuarioActualizadoDto);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> EliminarUsuario(int id)
        {
            await _usuarioService.EliminarUsuario(id);
            
            return NoContent();
        }


       
        [HttpGet("me")] 
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Token inválido.");
            }
            var usuarioDto = await _usuarioService.GetUsuarioById(userId);
           
            return Ok(usuarioDto);
        }

        [HttpPut("me")] 
        public async Task<IActionResult> UpdateMyProfile([FromBody] UsuarioPerfilDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Token inválido.");
            }

            var usuarioActualizadoDto = await _usuarioService.ActualizarPerfilUsuario(userId, dto);
            return Ok(usuarioActualizadoDto);
        }

        [HttpPost("change-password")] 
        public async Task<IActionResult> ChangePassword([FromBody] CambiarContraseñaDto dto)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdString, out int userId))
            {
                return Unauthorized("Token inválido.");
            }

            var success = await _usuarioService.CambiarContraseña(userId, dto.ContraseñaActual, dto.ContraseñaNueva);
            if (!success)
            {
                
                return BadRequest(new { message = "La contraseña actual es incorrecta o hubo un error." });
            }
            return Ok(new { message = "Contraseña actualizada correctamente." });
        }

        [AllowAnonymous]
        [HttpGet("terapeutas")]
        public async Task<IActionResult> GetTerapeutasParaSelect()
        {
            var terapeutas = await _usuarioService.GetTerapeutasDisponibles();
            return Ok(terapeutas);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/blanquear-clave")]
        public async Task<IActionResult> BlanquearClaveAdmin(int id, [FromBody] CambiarContraseñaDto dto)
        {
            var success = await _usuarioService.BlanquearClaveAdminAsync(id, dto.ContraseñaNueva);
            if (!success) return BadRequest(new { message = "Error al resetear la clave." });

            return Ok(new { message = "Clave del usuario reseteada con éxito." });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("paginados")]
        public async Task<IActionResult> GetUsuariosPaginados(
            [FromQuery] int pagina = 1,
            [FromQuery] int tamanio = 10,
            [FromQuery] string? busqueda = null,
            [FromQuery] bool mostrarInactivos = false)
        {
            var (usuarios, total) = await _usuarioService.GetUsuariosPaginadosAsync(pagina, tamanio, busqueda, mostrarInactivos);

         
            return Ok(new { Items = usuarios, Total = total });
        }

    }
}
