
using Core.Entidades;
using Core.Interfaces.Repositorios;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Infraestructure;
using Core.DTOs;

namespace Infrastructure.Repositorios
{
    public class PacienteRepository : IPacienteRepository
    {
        private readonly TeraDbContext _context;

        public PacienteRepository(TeraDbContext context)
        {
            _context = context;
        }
     


       
            public async Task<Paciente> Actualizar(int id, Paciente entityConNuevosDatos)
{
    var pacienteEncontrado = await _context.Pacientes.FindAsync(id);
    
    if (pacienteEncontrado == null)
    { 
        return null; 
    }
    
    
    pacienteEncontrado.Nombre = entityConNuevosDatos.Nombre;
    pacienteEncontrado.Apellido = entityConNuevosDatos.Apellido;
    pacienteEncontrado.FechaNacimiento = entityConNuevosDatos.FechaNacimiento;
    pacienteEncontrado.ObraSocialId = entityConNuevosDatos.ObraSocialId;
    pacienteEncontrado.Telefono = entityConNuevosDatos.Telefono;
    pacienteEncontrado.Email = entityConNuevosDatos.Email;
    pacienteEncontrado.DNI = entityConNuevosDatos.DNI;
    pacienteEncontrado.Activo = entityConNuevosDatos.Activo;


            _context.Entry(pacienteEncontrado).State = EntityState.Modified;

    
    await _context.SaveChangesAsync();
    return pacienteEncontrado;
}
    
        public async Task<Paciente> Actualizar(Paciente entity)
        {
         
            return await Actualizar(entity.Id, entity);

            

        }
    
        

        public async Task<Paciente> Agregar(Paciente entity)
        {
          
            await _context.Pacientes.AddAsync(entity);
            entity.Activo = true;

            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> Eliminar(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null) return false;
            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Paciente>? GetById(int id)
        {
            return await _context.Pacientes
                                  .Include(p => p.ObraSocial) 
                                  .FirstOrDefaultAsync(p => p.Id == id);
        }



        public async Task<IEnumerable<Paciente>> ObtenerTodos()

        {

            return await _context.Pacientes
                                 .Include(p => p.ObraSocial)
                                 .ToListAsync();

        }


        public async Task<IEnumerable<Paciente>> BuscarAsync(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return new List<Paciente>();
            }

            var normalizedQuery = query.ToLower().Trim();

            return await _context.Pacientes
              
                .Where(p => p.Activo == true)
                
                .Where(p =>
                    p.Nombre.ToLower().Contains(normalizedQuery) ||
                    p.Apellido.ToLower().Contains(normalizedQuery) ||
                    p.DNI.Contains(normalizedQuery)
                )
                .OrderBy(p => p.Apellido)
                .ThenBy(p => p.Nombre)
                .Take(10)
                .ToListAsync();
        }



        public async Task<Paciente> GetDetallesByIdAsync(int id)
        {
            var paciente = await _context.Pacientes
         .Include(p => p.ObraSocial) 
         .AsNoTracking()
         .FirstOrDefaultAsync(p => p.Id == id);

            return paciente;
        }




        public async Task<IEnumerable<Paciente>> ObtenerTodosAsync(int? obraSocialId, bool? activo,bool? tienePagosPendientes)
        {
            var query = _context.Pacientes
                                .Include(p => p.ObraSocial)
                                .Include (p=>p.Turnos)
                                .AsQueryable();


            if (obraSocialId.HasValue && obraSocialId.Value > 0)
            {
                query = query.Where(p => p.ObraSocialId == obraSocialId.Value);
            }

           
            if (activo.HasValue)
            {
                query = query.Where(p => p.Activo == activo.Value);
            }


            if (tienePagosPendientes.HasValue)
            {
                var hoy = DateTime.UtcNow;

                if (tienePagosPendientes.Value)
                {
                  
                    query = query.Where(p => p.Turnos.Any(
                        t => t.Estado.ToLower() != "cancelado" && t.FechaHora < hoy && !t.Pagos.Any()
                    ));
                }
                else
                {
                    
                    query = query.Where(p => !p.Turnos.Any(
                        t => t.Estado.ToLower() != "cancelado" && t.FechaHora < hoy && !t.Pagos.Any()
                    ));
                }
            }


            return await query.OrderBy(p => p.Apellido)
                                .ThenBy(p => p.Nombre)
                                .ToListAsync();
        }

        public async Task<(IEnumerable<Paciente> pacientes, int total)> GetPacientesPaginadosYFiltradosAsync(
     int pagina, int tamanio, string? busqueda, int? obraSocialId, bool? activo, bool? tienePagosPendientes)
        {
            var query = _context.Pacientes
                .Include(p => p.ObraSocial)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(busqueda))
            {
                var b = busqueda.ToLower();
                query = query.Where(p => p.Nombre.ToLower().Contains(b) ||
                                         p.Apellido.ToLower().Contains(b) ||
                                         p.DNI.Contains(b));
            }

            if (obraSocialId.HasValue && obraSocialId.Value > 0)
            {
                query = query.Where(p => p.ObraSocialId == obraSocialId.Value);
            }

            if (activo.HasValue)
            {
                query = query.Where(p => p.Activo == activo.Value);
            }


            if (tienePagosPendientes.HasValue)
            {
                if (tienePagosPendientes.Value)
                {
                    
                    query = query.Where(p => p.Turnos.Any(t => t.Estado != "Cancelado" && !t.Pagos.Any()));
                }
                else
                {
                   
                    query = query.Where(p => !p.Turnos.Any(t => t.Estado != "Cancelado" && !t.Pagos.Any()));
                }
            }

            int totalItems = await query.CountAsync();

            var pacientesFiltrados = await query
                .OrderBy(p => p.Apellido).ThenBy(p => p.Nombre)
                .Skip((pagina - 1) * tamanio)
                .Take(tamanio)
                .ToListAsync();

            return (pacientesFiltrados, totalItems);
        }
    }



}
