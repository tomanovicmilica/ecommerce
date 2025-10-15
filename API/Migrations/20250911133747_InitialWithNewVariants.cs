using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Migrations
{
    /// <inheritdoc />
    public partial class InitialWithNewVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasketItems_ProductVariant_ProductVariantId",
                table: "BasketItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariant_Products_ProductId",
                table: "ProductVariant");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariantAttribute_AttributeValues_AttributeValueId",
                table: "ProductVariantAttribute");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariantAttribute_ProductVariant_ProductVariantId",
                table: "ProductVariantAttribute");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVariantAttribute",
                table: "ProductVariantAttribute");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVariant",
                table: "ProductVariant");

            migrationBuilder.RenameTable(
                name: "ProductVariantAttribute",
                newName: "ProductVariantAttributes");

            migrationBuilder.RenameTable(
                name: "ProductVariant",
                newName: "ProductVariants");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariantAttribute_ProductVariantId",
                table: "ProductVariantAttributes",
                newName: "IX_ProductVariantAttributes_ProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariantAttribute_AttributeValueId",
                table: "ProductVariantAttributes",
                newName: "IX_ProductVariantAttributes_AttributeValueId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariant_ProductId",
                table: "ProductVariants",
                newName: "IX_ProductVariants_ProductId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVariantAttributes",
                table: "ProductVariantAttributes",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVariants",
                table: "ProductVariants",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BasketItems_ProductVariants_ProductVariantId",
                table: "BasketItems",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariantAttributes_AttributeValues_AttributeValueId",
                table: "ProductVariantAttributes",
                column: "AttributeValueId",
                principalTable: "AttributeValues",
                principalColumn: "AttributeValueId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariantAttributes_ProductVariants_ProductVariantId",
                table: "ProductVariantAttributes",
                column: "ProductVariantId",
                principalTable: "ProductVariants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BasketItems_ProductVariants_ProductVariantId",
                table: "BasketItems");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariantAttributes_AttributeValues_AttributeValueId",
                table: "ProductVariantAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariantAttributes_ProductVariants_ProductVariantId",
                table: "ProductVariantAttributes");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductVariants_Products_ProductId",
                table: "ProductVariants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVariants",
                table: "ProductVariants");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProductVariantAttributes",
                table: "ProductVariantAttributes");

            migrationBuilder.RenameTable(
                name: "ProductVariants",
                newName: "ProductVariant");

            migrationBuilder.RenameTable(
                name: "ProductVariantAttributes",
                newName: "ProductVariantAttribute");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariants_ProductId",
                table: "ProductVariant",
                newName: "IX_ProductVariant_ProductId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariantAttributes_ProductVariantId",
                table: "ProductVariantAttribute",
                newName: "IX_ProductVariantAttribute_ProductVariantId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductVariantAttributes_AttributeValueId",
                table: "ProductVariantAttribute",
                newName: "IX_ProductVariantAttribute_AttributeValueId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVariant",
                table: "ProductVariant",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProductVariantAttribute",
                table: "ProductVariantAttribute",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BasketItems_ProductVariant_ProductVariantId",
                table: "BasketItems",
                column: "ProductVariantId",
                principalTable: "ProductVariant",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariant_Products_ProductId",
                table: "ProductVariant",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "ProductId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariantAttribute_AttributeValues_AttributeValueId",
                table: "ProductVariantAttribute",
                column: "AttributeValueId",
                principalTable: "AttributeValues",
                principalColumn: "AttributeValueId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProductVariantAttribute_ProductVariant_ProductVariantId",
                table: "ProductVariantAttribute",
                column: "ProductVariantId",
                principalTable: "ProductVariant",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
