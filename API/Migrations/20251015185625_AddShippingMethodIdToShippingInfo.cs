using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class AddShippingMethodIdToShippingInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ShippingMethodId",
                table: "ShippingInfos",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_ShippingInfos_ShippingMethodId",
                table: "ShippingInfos",
                column: "ShippingMethodId");

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingInfos_ShippingMethods_ShippingMethodId",
                table: "ShippingInfos",
                column: "ShippingMethodId",
                principalTable: "ShippingMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShippingInfos_ShippingMethods_ShippingMethodId",
                table: "ShippingInfos");

            migrationBuilder.DropIndex(
                name: "IX_ShippingInfos_ShippingMethodId",
                table: "ShippingInfos");

            migrationBuilder.DropColumn(
                name: "ShippingMethodId",
                table: "ShippingInfos");
        }
    }
}
