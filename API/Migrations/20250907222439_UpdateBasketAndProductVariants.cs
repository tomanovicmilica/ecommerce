using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBasketAndProductVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Size",
                table: "BasketItems");

            migrationBuilder.AddColumn<int>(
                name: "ProductVariantId",
                table: "BasketItems",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BasketItems_ProductVariantId",
                table: "BasketItems",
                column: "ProductVariantId");

            migrationBuilder.AddForeignKey(
                name: "FK_BasketItems_ProductVariant_ProductVariantId",
                table: "BasketItems",
                column: "ProductVariantId",
                principalTable: "ProductVariant",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasketItems_ProductVariant_ProductVariantId",
                table: "BasketItems");

            migrationBuilder.DropIndex(
                name: "IX_BasketItems_ProductVariantId",
                table: "BasketItems");

            migrationBuilder.DropColumn(
                name: "ProductVariantId",
                table: "BasketItems");

            migrationBuilder.AddColumn<string>(
                name: "Size",
                table: "BasketItems",
                type: "text",
                nullable: true);
        }
    }
}
