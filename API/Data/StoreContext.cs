using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Data;
using Attribute = API.Entities.Attribute;

namespace API.Data
{
    public class StoreContext : IdentityDbContext<User, Role, int>
    {
        public StoreContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<Category>? Categories { get; set; }
        public DbSet<Product>? Products { get; set; }
        public DbSet<Basket>? Baskets { get; set; }
        public DbSet<BasketItem>? BasketItems { get; set; }
        public DbSet<Attribute>? Attributes { get; set; }
        public DbSet<AttributeValue>? AttributeValues { get; set; }
        public DbSet<ProductVariant>? ProductVariants { get; set; }
        public DbSet<ProductVariantAttribute>? ProductVariantAttributes { get; set; }

        public DbSet<Order>? Orders { get; set; }
        public DbSet<OrderItem>? OrderItems { get; set; }
        public DbSet<OrderAddress>? OrderAddresses { get; set; }
        public DbSet<OrderItemAttribute>? OrderItemAttributes { get; set; }
        public DbSet<OrderStatusHistory> OrderStatusHistory { get; set; }
        public DbSet<OrderNotification>? OrderNotifications { get; set; }

        public DbSet<Payment>? Payments { get; set; }

        public DbSet<InventoryReservation>? InventoryReservations { get; set; }
        public DbSet<ShippingMethod>? ShippingMethods { get; set; }
        public DbSet<ShippingInfo>? ShippingInfos { get; set; }

        public DbSet<DigitalDownload>? DigitalDownloads { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<User>()
                .HasOne(a => a.Address)
                .WithOne()
                .HasForeignKey<UserAddress>(a => a.AdressId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Role>()
                .HasData(
                    new Role { Id = 1, Name = "Member", NormalizedName = "MEMBER" },
                    new Role { Id = 2, Name = "Admin", NormalizedName = "ADMIN" }
                );

            // Configure Order to OrderAddress relationships
            builder.Entity<Order>()
                .HasOne(o => o.ShippingAddress)
                .WithMany()
                .HasForeignKey(o => o.ShippingAddressId)
                .HasConstraintName("FK_Order_ShippingAddress")
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Order>()
                .HasOne(o => o.BillingAddress)
                .WithMany()
                .HasForeignKey(o => o.BillingAddressId)
                .HasConstraintName("FK_Order_BillingAddress")
                .OnDelete(DeleteBehavior.SetNull);

            // Configure Payment to Order relationship
            builder.Entity<Payment>()
                .HasOne(p => p.Order)
                .WithMany(o => o.Payments)
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure OrderItem relationships
            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            /*builder.Entity<OrderItem>()
                 .ToTable(tb => tb.HasTrigger("ProductStock"));*/

            builder.Entity<BasketItem>()
                .ToTable(tb => tb.HasTrigger("SubtotalBasket"));

            // Configure DigitalDownload relationships
            builder.Entity<DigitalDownload>()
                .HasOne(dd => dd.OrderItem)
                .WithMany()
                .HasForeignKey(dd => dd.OrderItemId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<DigitalDownload>()
                .HasOne(dd => dd.User)
                .WithMany()
                .HasForeignKey(dd => dd.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
