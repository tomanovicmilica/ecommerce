# E-Commerce API - Entity Documentation

This document provides a comprehensive overview of all database entities and their fields in the e-commerce backend API.

## Core Entities

### Product
**File:** [Entities/Product.cs](../API/Entities/Product.cs)

| Field | Type | Description |
|-------|------|-------------|
| ProductId | int | Primary key |
| Name | string? | Product name |
| Description | string? | Product description |
| Price | long | Product price (in cents) |
| PictureUrl | string? | URL to product image |
| QuantityInStock | int | Available quantity |
| CategoryId | int | Foreign key to Category |
| Category | Category? | Navigation property |
| ProductType | ProductType | Physical or Digital (enum) |
| DigitalFileUrl | string? | URL for digital download (digital products only) |
| IsInstantDelivery | bool | Auto-deliver after payment (default: false) |
| PublicId | string? | Cloudinary public ID for image |
| Variants | ICollection&lt;ProductVariant&gt; | Product variants collection |

### Category
**File:** [Entities/Category.cs](../API/Entities/Category.cs)

| Field | Type | Description |
|-------|------|-------------|
| CategoryId | int | Primary key |
| Name | string | Category name (required) |

### ProductVariant
**File:** [Entities/ProductVariant.cs](../API/Entities/ProductVariant.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| ProductId | int | Foreign key to Product |
| Product | Product | Navigation property |
| QuantityInStock | int | Variant-specific stock quantity |
| PriceOverride | decimal? | Optional price override for this variant |
| Attributes | ICollection&lt;ProductVariantAttribute&gt; | Variant attributes collection |

### Attribute
**File:** [Entities/Attribute.cs](../API/Entities/Attribute.cs)

| Field | Type | Description |
|-------|------|-------------|
| AttributeId | int | Primary key |
| Name | string | Attribute name (e.g., "Color", "Size", "Taste") |
| Values | ICollection&lt;AttributeValue&gt; | Attribute values collection |

### AttributeValue
**File:** [Entities/AttributeValue.cs](../API/Entities/AttributeValue.cs)

| Field | Type | Description |
|-------|------|-------------|
| AttributeValueId | int | Primary key |
| Value | string | Attribute value (e.g., "Red", "XL", "Chocolate") |
| AttributeId | int | Foreign key to Attribute |
| Attribute | Attribute | Navigation property |

### ProductVariantAttribute
**File:** [Entities/ProductVariantAttribute.cs](../API/Entities/ProductVariantAttribute.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| ProductVariantId | int | Foreign key to ProductVariant |
| ProductVariant | ProductVariant | Navigation property |
| AttributeValueId | int | Foreign key to AttributeValue |
| AttributeValue | AttributeValue | Navigation property |

## User Management

### User
**File:** [Entities/User.cs](../API/Entities/User.cs)

Inherits from `IdentityUser<int>`, which includes:
- Id, UserName, Email, PasswordHash, PhoneNumber, etc.

| Field | Type | Description |
|-------|------|-------------|
| Name | string? | User's first name |
| LastName | string? | User's last name |
| Address | UserAddress? | User address |

### UserAddress
**File:** [Entities/UserAddress.cs](../API/Entities/UserAddress.cs)

| Field | Type | Description |
|-------|------|-------------|
| AdressId | int | Primary key |

### Role
**File:** [Entities/Role.cs](../API/Entities/Role.cs)

Inherits from `IdentityRole<int>`, which includes:
- Id, Name, NormalizedName, ConcurrencyStamp

## Shopping Cart

### Basket
**File:** [Entities/Basket.cs](../API/Entities/Basket.cs)

| Field | Type | Description |
|-------|------|-------------|
| BasketId | int | Primary key |
| SubtotalPrice | int | Basket subtotal (in cents) |
| Date | DateTime | Creation date (default: UtcNow) |
| UserId | string? | User identifier |
| Items | List&lt;BasketItem&gt; | Basket items collection |
| PaymentIntentId | string? | Stripe payment intent ID |
| ClientSecret | string? | Stripe client secret |

### BasketItem
**File:** [Entities/BasketItem.cs](../API/Entities/BasketItem.cs)

| Field | Type | Description |
|-------|------|-------------|
| BasketItemId | int | Primary key |
| BasketId | int | Foreign key to Basket |
| Basket | Basket? | Navigation property |
| ProductId | int | Foreign key to Product |
| Product | Product? | Navigation property |
| ProductVariantId | int? | Foreign key to ProductVariant (nullable) |
| ProductVariant | ProductVariant? | Navigation property |
| Quantity | int | Item quantity |

## Order Management

### Order
**File:** [Entities/Order.cs](../API/Entities/Order.cs)

| Field | Type | Description |
|-------|------|-------------|
| OrderId | int | Primary key |
| OrderNumber | string | Unique order number (max 50 chars) |
| UserId | int? | Foreign key to User |
| User | User? | Navigation property |
| BuyerEmail | string | Buyer's email address |
| OrderDate | DateTime | Order date (default: UtcNow) |
| OrderStatus | OrderStatus | Order status (enum) |
| ContainsDigitalProducts | bool | Has digital products (default: false) |
| RequiresShipping | bool | Requires shipping (default: true) |
| Subtotal | decimal | Order subtotal |
| TaxAmount | decimal | Tax amount |
| ShippingCost | decimal | Shipping cost |
| TotalAmount | decimal | Total order amount |
| Currency | string | Currency code (default: "USD", max 3 chars) |
| PaymentIntentId | string? | Stripe payment intent ID |
| PaymentStatus | PaymentStatus | Payment status (enum) |
| ShippingAddressId | int | Foreign key to OrderAddress |
| ShippingAddress | OrderAddress | Navigation property |
| BillingAddressId | int? | Foreign key to OrderAddress |
| BillingAddress | OrderAddress? | Navigation property |
| OrderItems | ICollection&lt;OrderItem&gt; | Order items collection |
| Payments | ICollection&lt;Payment&gt; | Payments collection |
| CreatedAt | DateTime | Creation timestamp (default: UtcNow) |
| UpdatedAt | DateTime | Last update timestamp (default: UtcNow) |
| Notes | string? | Order notes (max 500 chars) |
| TrackingNumber | string? | Shipping tracking number (max 100 chars) |

### OrderItem
**File:** [Entities/OrderItem.cs](../API/Entities/OrderItem.cs)

| Field | Type | Description |
|-------|------|-------------|
| OrderItemId | int | Primary key |
| OrderId | int | Foreign key to Order |
| Order | Order | Navigation property |
| ProductId | int | Foreign key to Product |
| Product | Product | Navigation property |
| ProductVariantId | int? | Foreign key to ProductVariant |
| ProductVariant | ProductVariant? | Navigation property |
| ProductName | string | Snapshot of product name at order time |
| ProductDescription | string? | Snapshot of product description (max 1000 chars) |
| UnitPrice | decimal | Unit price at order time |
| Quantity | int | Quantity ordered |
| LineTotal | decimal | Line total (UnitPrice × Quantity) |
| ProductImageUrl | string? | Product image URL snapshot |
| Attributes | ICollection&lt;OrderItemAttribute&gt; | Order item attributes |

### OrderItemAttribute
**File:** [Entities/OrderItemAttribute.cs](../API/Entities/OrderItemAttribute.cs)

| Field | Type | Description |
|-------|------|-------------|
| OrderItemAttributeId | int | Primary key |
| OrderItemId | int | Foreign key to OrderItem |
| OrderItem | OrderItem | Navigation property |
| AttributeName | string | Attribute name snapshot (max 100 chars) |
| AttributeValue | string | Attribute value snapshot (max 100 chars) |

### OrderAddress
**File:** [Entities/OrderAddress.cs](../API/Entities/OrderAddress.cs)

| Field | Type | Description |
|-------|------|-------------|
| OrderAddressId | int | Primary key |
| UserId | int? | Foreign key to User |
| User | User? | Navigation property |
| FirstName | string | First name (max 100 chars) |
| LastName | string | Last name (max 100 chars) |
| Company | string? | Company name (max 100 chars) |
| AddressLine1 | string | Address line 1 (max 255 chars) |
| AddressLine2 | string? | Address line 2 (max 255 chars) |
| City | string | City (max 100 chars) |
| State | string | State/Province (max 100 chars) |
| PostalCode | string | Postal code (max 20 chars) |
| Country | string | Country (max 100 chars) |
| PhoneNumber | string? | Phone number (max 20 chars) |
| IsDefault | bool | Is default address |
| AddressType | AddressType | Address type (enum) |
| CreatedAt | DateTime | Creation timestamp (default: UtcNow) |
| ShippingOrders | ICollection&lt;Order&gt; | Orders using this as shipping address |
| BillingOrders | ICollection&lt;Order&gt; | Orders using this as billing address |

### OrderStatusHistory
**File:** [Entities/OrderStatusHistory.cs](../API/Entities/OrderStatusHistory.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| OrderId | int | Foreign key to Order |
| Order | Order | Navigation property |
| FromStatus | OrderStatus | Previous status (enum) |
| ToStatus | OrderStatus | New status (enum) |
| ChangedAt | DateTime | Change timestamp (default: UtcNow) |
| Notes | string? | Change notes |
| TrackingNumber | string? | Tracking number if applicable |
| UserId | int? | User who made the change |
| UpdatedBy | string | Who updated (default: "System") |

## Payment Processing

### Payment
**File:** [Entities/Payment.cs](../API/Entities/Payment.cs)

| Field | Type | Description |
|-------|------|-------------|
| PaymentId | int | Primary key |
| OrderId | int | Foreign key to Order |
| Order | Order | Navigation property |
| PaymentIntentId | string | Stripe payment intent ID |
| PaymentMethodId | string? | Stripe payment method ID |
| Amount | decimal | Payment amount |
| Currency | string | Currency code (default: "USD", max 3 chars) |
| PaymentStatus | PaymentStatus | Payment status (enum) |
| PaymentMethod | PaymentMethod | Payment method (enum) |
| StripeChargeId | string? | Stripe charge ID |
| FailureReason | string? | Failure reason if payment failed (max 500 chars) |
| ProcessedAt | DateTime? | Processing timestamp |
| RefundedAmount | decimal | Amount refunded (default: 0) |
| CreatedAt | DateTime | Creation timestamp (default: UtcNow) |

## Shipping & Delivery

### ShippingInfo
**File:** [Entities/ShippingInfo.cs](../API/Entities/ShippingInfo.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| OrderId | int | Foreign key to Order |
| Order | Order | Navigation property |
| CarrierName | string? | Shipping carrier name |
| TrackingNumber | string? | Tracking number |
| ShippedDate | DateTime? | Shipment date |
| EstimatedDeliveryDate | DateTime? | Estimated delivery date |
| ShippingCost | decimal | Shipping cost |

### ShippingMethod
**File:** [Entities/ShippingMethod.cs](../API/Entities/ShippingMethod.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| Name | string | Shipping method name |
| Description | string | Shipping method description |
| Cost | decimal | Base shipping cost |
| EstimatedDays | int | Estimated delivery days |
| IsActive | bool | Is method currently active |
| FreeShipping | decimal? | Order amount threshold for free shipping |

## Digital Products

### DigitalDownload
**File:** [Entities/DigitalDownload.cs](../API/Entities/DigitalDownload.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| OrderItemId | int | Foreign key to OrderItem |
| OrderItem | OrderItem | Navigation property |
| UserId | int | Foreign key to User |
| User | User | Navigation property |
| ProductName | string | Digital product name |
| DigitalFileUrl | string | Download URL |
| CreatedAt | DateTime | Creation timestamp (default: UtcNow) |
| DownloadedAt | DateTime? | First download timestamp |
| ExpiresAt | DateTime | Download expiration date |
| DownloadCount | int | Number of downloads (default: 0) |
| MaxDownloads | int | Maximum allowed downloads (default: 3) |
| IsCompleted | bool | Download completed flag (default: false) |
| DownloadToken | string? | Secure download token |
| IsExpired | bool | Computed property: DateTime.UtcNow > ExpiresAt |
| CanDownload | bool | Computed property: !IsExpired && DownloadCount < MaxDownloads |

## Inventory & Notifications

### InventoryReservation
**File:** [Entities/InventoryReservation.cs](../API/Entities/InventoryReservation.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| OrderId | int | Foreign key to Order |
| ProductId | int | Foreign key to Product |
| ProductVariantId | int? | Foreign key to ProductVariant |
| ReservedQuantity | int | Quantity reserved |
| ReservedAt | DateTime | Reservation timestamp |
| ExpiresAt | DateTime | Reservation expiration |
| IsReleased | bool | Has reservation been released |

### OrderNotification
**File:** [Entities/OrderNotification.cs](../API/Entities/OrderNotification.cs)

| Field | Type | Description |
|-------|------|-------------|
| Id | int | Primary key |
| OrderId | int | Foreign key to Order |
| NotificationType | string | Notification type (email, sms) |
| Recipient | string | Notification recipient |
| Subject | string | Notification subject |
| Content | string | Notification content |
| IsSent | bool | Has been sent flag |
| CreatedAt | DateTime | Creation timestamp |
| SentAt | DateTime? | Sent timestamp |

## Enumerations

### ProductType
**File:** [Entities/enums/ProductType.cs](../API/Entities/enums/ProductType.cs)

- Physical = 0
- Digital = 1

### OrderStatus
**File:** [Entities/enums/OrderStatus.cs](../API/Entities/enums/OrderStatus.cs)

- Pending
- Confirmed
- PaymentReceived
- Processing
- Shipped
- Delivered
- Cancelled
- Returned

### PaymentStatus
**File:** [Entities/enums/PaymentStatus.cs](../API/Entities/enums/PaymentStatus.cs)

- Pending
- RequiresAction
- Succeeded
- Failed
- Cancelled
- Refunded
- PartiallyRefunded

### PaymentMethod
**File:** [Entities/enums/PaymentMethod.cs](../API/Entities/enums/PaymentMethod.cs)

- Card
- BankTransfer
- DigitalWallet

### AddressType
**File:** [Entities/enums/AddressType.cs](../API/Entities/enums/AddressType.cs)

- Shipping
- Billing
- Both

## Entity Relationships

### One-to-Many Relationships
- **Category** → **Product** (One category has many products)
- **Product** → **ProductVariant** (One product has many variants)
- **Attribute** → **AttributeValue** (One attribute has many values)
- **ProductVariant** → **ProductVariantAttribute** (One variant has many attribute assignments)
- **Basket** → **BasketItem** (One basket has many items)
- **Order** → **OrderItem** (One order has many items)
- **Order** → **Payment** (One order can have many payments)
- **OrderItem** → **OrderItemAttribute** (One order item has many attributes)
- **OrderAddress** → **Order** (One address can be used in many orders)
- **Order** → **OrderStatusHistory** (One order has many status changes)

### Many-to-One Relationships
- **Product** → **Category**
- **ProductVariant** → **Product**
- **BasketItem** → **Product**, **ProductVariant**, **Basket**
- **OrderItem** → **Product**, **ProductVariant**, **Order**
- **Payment** → **Order**
- **ShippingInfo** → **Order**
- **DigitalDownload** → **OrderItem**, **User**

### Many-to-Many Relationships
- **ProductVariant** ↔ **AttributeValue** (through ProductVariantAttribute)

## Notes

1. **Price Storage**: Prices in some entities (like Product) are stored as `long` in cents, while others use `decimal` with precision 18,2
2. **Identity Integration**: User and Role entities extend ASP.NET Core Identity classes
3. **Soft References**: Many navigation properties are nullable to support optional relationships
4. **Audit Trails**: Most entities include CreatedAt/UpdatedAt timestamps
5. **Digital Product Support**: System supports both physical and digital products with separate handling
6. **Payment Integration**: Built-in Stripe integration with PaymentIntentId fields
