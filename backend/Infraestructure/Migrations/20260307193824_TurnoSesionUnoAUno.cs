using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TurnoSesionUnoAUno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sesiones_TurnoId",
                table: "Sesiones");

            migrationBuilder.CreateIndex(
                name: "IX_Sesiones_TurnoId",
                table: "Sesiones",
                column: "TurnoId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sesiones_TurnoId",
                table: "Sesiones");

            migrationBuilder.CreateIndex(
                name: "IX_Sesiones_TurnoId",
                table: "Sesiones",
                column: "TurnoId");
        }
    }
}
