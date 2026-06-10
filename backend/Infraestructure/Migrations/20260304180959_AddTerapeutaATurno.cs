using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTerapeutaATurno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TerapeutaId",
                table: "Turnos",
                type: "integer",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.CreateIndex(
                name: "IX_Turnos_TerapeutaId",
                table: "Turnos",
                column: "TerapeutaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Turnos_Usuarios_TerapeutaId",
                table: "Turnos",
                column: "TerapeutaId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Turnos_Usuarios_TerapeutaId",
                table: "Turnos");

            migrationBuilder.DropIndex(
                name: "IX_Turnos_TerapeutaId",
                table: "Turnos");

            migrationBuilder.DropColumn(
                name: "TerapeutaId",
                table: "Turnos");
        }
    }
}
