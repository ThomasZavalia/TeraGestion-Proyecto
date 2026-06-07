using Core.DTOs;
using Core.DTOs.Usuario.Input;
using Core.Entidades;
using Core.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;



namespace Controllers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUsuarioService _usuarioService;
        private readonly IConfiguration _configuration;
        public AuthController(IUsuarioService usuarioService, IConfiguration configuration)
        {
            _usuarioService = usuarioService;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var usuario = await _usuarioService.ValidarCredenciales(loginDto.Username, loginDto.Password);

            if (usuario == null)
            {
                return BadRequest(new { error = "Usuario o contraseña incorrectos." });
            }

            var token = GenerateJwtToken(usuario);

            var userDto = new
            {
                Id = usuario.Id,
                Username = usuario.Username,
                Email = usuario.Email,
                Rol = usuario.Rol
            };

            return Ok(new { token = token, user = userDto });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            var existingUser = await _usuarioService.GetByName(registerDto.Username);
            if (existingUser != null)
            {
                return BadRequest("El nombre de usuario ya existe");
            }

            var nuevoUsuario = new Usuario
            {
                Username = registerDto.Username,
                PasswordHash = registerDto.Password,
                Rol = "User",
                Email = registerDto.Email
            };

            var creadoUsuario = await _usuarioService.CrearUsuario(nuevoUsuario);
            if (creadoUsuario == null)
            {
                return StatusCode(500, "Error al crear el usuario");
            }

            return Ok("Usuario registrado exitosamente");
        }


        private string GenerateJwtToken(Usuario usuario)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                new Claim(ClaimTypes.Name, usuario.Username),
                new Claim(ClaimTypes.Role, usuario.Rol),
                new Claim(ClaimTypes.Email, usuario.Email ?? "")
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Jwt:Key"])
            );
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] OlvidoClaveDto dto)
        {
            var usuario = await _usuarioService.SolicitarRecuperacionClave(dto.Email);

            if (usuario == null)
            {
               
                var random = new Random();
                await Task.Delay(random.Next(1000, 3000));

                return Ok(new { message = "Si el correo existe, se ha enviado un enlace de recuperación." });
            }

            return Ok(new { message = "Si el email existe, se han enviado las instrucciones." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ReiniciarClaveDto dto)
        {
            if (dto.NuevaPassword != dto.ConfirmarPassword)
                return BadRequest("Las contraseñas no coinciden.");

            var resultado = await _usuarioService.RestablecerClave(dto.Token, dto.NuevaPassword);

            if (!resultado)
                return BadRequest("El enlace de recuperación es inválido o ha expirado.");

            return Ok(new { message = "Contraseña restablecida exitosamente." });
        }
    }
    
}

