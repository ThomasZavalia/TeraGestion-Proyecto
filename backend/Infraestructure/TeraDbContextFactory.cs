using Infraestructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

using System.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
   

    public class TeraDbContextFactory : IDesignTimeDbContextFactory<TeraDbContext>
    {
       

        public TeraDbContext CreateDbContext(string[] args)
        {
          
            var basePath = Path.Combine(Directory.GetCurrentDirectory(), "../Controllers");

            var configuration = new ConfigurationBuilder()
                .SetBasePath(basePath)
                .AddJsonFile("appsettings.json", optional: false)
                .Build();

            var connectionString = configuration.GetConnectionString("DefaultConnection");

            var optionsBuilder = new DbContextOptionsBuilder<TeraDbContext>();
            optionsBuilder.UseNpgsql(connectionString);

            return new TeraDbContext(optionsBuilder.Options);
        }
    }


}

