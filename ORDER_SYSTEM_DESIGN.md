# E-commerce Order System Design

## Frontend TypeScript Interfaces

### Core Order Interfaces

```typescript
interface Order {
  orderId: number;
  orderNumber: string; // human-readable order reference
  userId?: number; // null for guest orders
  buyerEmail: string;
  orderDate: Date;
  orderStatus: OrderStatusEnum;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string; // for Stripe
  
  // Stripe integration
  paymentIntentId?: string;
  paymentStatus: PaymentStatusEnum;
  
  // Addresses
  shippingAddressId: number;
  billingAddressId?: number; // optional if same as shipping
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  productVariantId?: number;
  productName: string; // snapshot at time of order
  productDescription?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  
  // Product snapshot data
  productImageUrl?: string;
  attributes?: OrderItemAttribute[];
}

interface Address {
  addressId: number;
  userId?: number; // null for one-time addresses
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
  addressType: AddressTypeEnum; // shipping, billing, both
}
```

### Supporting Interfaces

```typescript
interface Payment {
  paymentId: number;
  orderId: number;
  paymentIntentId: string; // Stripe payment intent ID
  paymentMethodId?: string; // Stripe payment method ID
  amount: number;
  currency: string;
  paymentStatus: PaymentStatusEnum;
  paymentMethod: PaymentMethodEnum; // card, bank_transfer, etc.
  stripeChargeId?: string;
  failureReason?: string;
  processedAt?: Date;
  refundedAmount?: number;
}

interface OrderItemAttribute {
  orderItemAttributeId: number;
  orderItemId: number;
  attributeName: string;
  attributeValue: string;
}
```

### Enums

```typescript
enum OrderStatusEnum {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

enum PaymentStatusEnum {
  PENDING = 'pending',
  REQUIRES_ACTION = 'requires_action',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

enum PaymentMethodEnum {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet'
}

enum AddressTypeEnum {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both'
}
```

## Backend C# Entities

### Core Order Entities

#### Order.cs
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class Order
    {
        [Key]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(50)]
        public string OrderNumber { get; set; } = string.Empty;

        public int? UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(255)]
        public string BuyerEmail { get; set; } = string.Empty;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TaxAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        // Stripe integration
        public string? PaymentIntentId { get; set; }
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

        // Addresses
        public int ShippingAddressId { get; set; }
        public OrderAddress ShippingAddress { get; set; } = null!;

        public int? BillingAddressId { get; set; }
        public OrderAddress? BillingAddress { get; set; }

        // Navigation properties
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(500)]
        public string? Notes { get; set; }

        public decimal GetTotal()
        {
            return Subtotal + TaxAmount + ShippingCost;
        }
    }
}
```

#### OrderItem.cs
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class OrderItem
    {
        [Key]
        public int OrderItemId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public int? ProductVariantId { get; set; }
        public ProductVariant? ProductVariant { get; set; }

        // Snapshot data at time of order
        [Required]
        [MaxLength(255)]
        public string ProductName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ProductDescription { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal LineTotal { get; set; }

        public string? ProductImageUrl { get; set; }

        // Navigation properties
        public ICollection<OrderItemAttribute> Attributes { get; set; } = new List<OrderItemAttribute>();

        public void CalculateLineTotal()
        {
            LineTotal = UnitPrice * Quantity;
        }
    }
}
```

#### OrderAddress.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class OrderAddress
    {
        [Key]
        public int OrderAddressId { get; set; }

        public int? UserId { get; set; }
        public User? User { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Company { get; set; }

        [Required]
        [MaxLength(255)]
        public string AddressLine1 { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? AddressLine2 { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PostalCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public bool IsDefault { get; set; }

        public AddressType AddressType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Order> ShippingOrders { get; set; } = new List<Order>();
        public ICollection<Order> BillingOrders { get; set; } = new List<Order>();
    }
}
```

#### Payment.cs
```csharp
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    public class Payment
    {
        [Key]
        public int PaymentId { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        [Required]
        public string PaymentIntentId { get; set; } = string.Empty;

        public string? PaymentMethodId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "USD";

        public PaymentStatus PaymentStatus { get; set; }

        public PaymentMethod PaymentMethod { get; set; }

        public string? StripeChargeId { get; set; }

        [MaxLength(500)]
        public string? FailureReason { get; set; }

        public DateTime? ProcessedAt { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal RefundedAmount { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
```

#### OrderItemAttribute.cs
```csharp
using System.ComponentModel.DataAnnotations;

namespace API.Entities
{
    public class OrderItemAttribute
    {
        [Key]
        public int OrderItemAttributeId { get; set; }

        public int OrderItemId { get; set; }
        public OrderItem OrderItem { get; set; } = null!;

        [Required]
        [MaxLength(100)]
        public string AttributeName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string AttributeValue { get; set; } = string.Empty;
    }
}
```

### Enums

#### OrderStatus.cs
```csharp
namespace API.Entities
{
    public enum OrderStatus
    {
        Pending,
        Confirmed,
        Processing,
        Shipped,
        Delivered,
        Cancelled,
        Returned
    }
}
```

#### PaymentStatus.cs
```csharp
namespace API.Entities
{
    public enum PaymentStatus
    {
        Pending,
        RequiresAction,
        Succeeded,
        Failed,
        Cancelled,
        Refunded,
        PartiallyRefunded
    }
}
```

#### PaymentMethod.cs
```csharp
namespace API.Entities
{
    public enum PaymentMethod
    {
        Card,
        BankTransfer,
        DigitalWallet
    }
}
```

#### AddressType.cs
```csharp
namespace API.Entities
{
    public enum AddressType
    {
        Shipping,
        Billing,
        Both
    }
}
```

## Entity Framework Configuration Example

#### OrderConfiguration.cs
```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace API.Data.Config
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.OrderId);

            builder.Property(o => o.OrderNumber)
                .IsRequired()
                .HasMaxLength(50);

            builder.HasIndex(o => o.OrderNumber)
                .IsUnique();

            builder.HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(o => o.ShippingAddress)
                .WithMany(a => a.ShippingOrders)
                .HasForeignKey(o => o.ShippingAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.BillingAddress)
                .WithMany(a => a.BillingOrders)
                .HasForeignKey(o => o.BillingAddressId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(o => o.OrderItems)
                .WithOne(oi => oi.Order)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
```

## Additional Components for Complete System

### Order Tracking/History
```csharp
public class OrderStatusHistory
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public OrderStatus FromStatus { get; set; }
    public OrderStatus ToStatus { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public int? UserId { get; set; } // Who made the change
}
```

### Shipping Information
```csharp
public class ShippingInfo
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string? CarrierName { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ShippedDate { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }
    public decimal ShippingCost { get; set; }
}
```

### Inventory Management
```csharp
public class InventoryReservation
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int? ProductVariantId { get; set; }
    public int ReservedQuantity { get; set; }
    public DateTime ReservedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsReleased { get; set; }
}
```

### Essential Services Interfaces

#### Order Service
```csharp
public interface IOrderService
{
    Task<Order> CreateOrderFromBasketAsync(int basketId, OrderAddress shippingAddress, OrderAddress? billingAddress);
    Task<Order> GetOrderByIdAsync(int orderId);
    Task<IEnumerable<Order>> GetOrdersByUserAsync(int userId);
    Task<Order> UpdateOrderStatusAsync(int orderId, OrderStatus newStatus);
    Task<bool> CancelOrderAsync(int orderId);
}
```

#### Payment Service
```csharp
public interface IPaymentService
{
    Task<PaymentIntent> CreatePaymentIntentAsync(Order order);
    Task<Payment> ProcessPaymentAsync(string paymentIntentId);
    Task<Payment> RefundPaymentAsync(int paymentId, decimal amount);
    Task<bool> ValidateWebhookAsync(string payload, string signature);
}
```

### Notification System
```csharp
public class OrderNotification
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public string NotificationType { get; set; } = string.Empty; // email, sms
    public string Recipient { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsSent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? SentAt { get; set; }
}
```

### Configuration Entities

#### Tax Configuration
```csharp
public class TaxConfiguration
{
    public int Id { get; set; }
    public string Country { get; set; } = string.Empty;
    public string? State { get; set; }
    public decimal TaxRate { get; set; }
    public bool IsActive { get; set; }
}
```

#### Shipping Methods
```csharp
public class ShippingMethod
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Cost { get; set; }
    public int EstimatedDays { get; set; }
    public bool IsActive { get; set; }
    public decimal? FreeShippingThreshold { get; set; }
}
```

### Optional Features

#### Coupons/Discounts
```csharp
public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountAmount { get; set; }
    public bool IsPercentage { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidTo { get; set; }
    public int? UsageLimit { get; set; }
    public int TimesUsed { get; set; }
    public decimal? MinimumOrderAmount { get; set; }
}

public class OrderCoupon
{
    public int OrderId { get; set; }
    public int CouponId { get; set; }
    public decimal DiscountApplied { get; set; }
}
```

#### Return/Refund Management
```csharp
public class OrderReturn
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public string Reason { get; set; } = string.Empty;
    public ReturnStatus Status { get; set; }
    public decimal RefundAmount { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public ICollection<OrderReturnItem> Items { get; set; } = new List<OrderReturnItem>();
}
```

## Implementation Priority

### Must-have for MVP:
- Order, OrderItem, OrderAddress, Payment entities
- Basic OrderService and PaymentService
- Stripe webhook handling
- Order status updates

### Should-have for production:
- OrderStatusHistory for tracking
- ShippingInfo for delivery tracking
- InventoryReservation to prevent overselling
- Email notifications
- Tax calculation

### Nice-to-have for enhanced features:
- Coupon system
- Return/refund management
- Advanced shipping options
- SMS notifications

## Stripe Integration Considerations

The design is fully compatible with Stripe:
- **paymentIntentId** in Order links to Stripe's Payment Intent
- **Payment** entity stores all Stripe-related data
- **PaymentStatusEnum** matches Stripe payment statuses
- **currency** field supports international transactions
- **Address** structure works with Stripe's address validation

This structure provides comprehensive order tracking, payment processing, and maintains data integrity while supporting both registered users and guest checkouts.