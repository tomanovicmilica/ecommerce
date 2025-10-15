# E-Commerce Application - Complete Architecture Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Application Overview](#application-overview)
3. [Architecture Overview](#architecture-overview)
4. [Frontend Architecture](#frontend-architecture)
5. [Backend Architecture](#backend-architecture)
6. [Technology Stack](#technology-stack)
7. [Application Features](#application-features)
8. [Data Flow and Communication](#data-flow-and-communication)
9. [Security Architecture](#security-architecture)
10. [Deployment and Infrastructure](#deployment-and-infrastructure)

---

## Executive Summary

This document provides a comprehensive description of the e-commerce application architecture, including detailed information about the technologies used, architectural patterns implemented, and the operational flow of the application. The system is built as a modern, full-stack web application using a client-server architecture with a React-based frontend and ASP.NET Core backend.

**Application Type:** Full-Stack E-Commerce Web Application

**Architecture Pattern:** Client-Server Architecture with RESTful API and Real-Time Communication

**Primary Technologies:**
- **Frontend:** React 19 with TypeScript, Redux Toolkit, Tailwind CSS
- **Backend:** ASP.NET Core 8.0 with Entity Framework Core
- **Database:** PostgreSQL (production), SQLite (development)
- **Payment Processing:** Stripe API
- **Real-Time Communication:** SignalR
- **Cloud Storage:** Cloudinary (image hosting)

---

## Application Overview

### Purpose
The application is a full-featured e-commerce platform designed to support both physical and digital product sales. It provides a complete shopping experience for customers and comprehensive management tools for administrators.

### Key Capabilities
1. **Product Management** - Support for both physical and digital products with variants
2. **Shopping Experience** - Shopping cart, wishlist, product search and filtering
3. **Order Processing** - Complete checkout flow with payment integration
4. **User Management** - Authentication, authorization, and user profiles
5. **Admin Dashboard** - Comprehensive administrative tools for managing the store
6. **Real-Time Notifications** - Live order status updates via SignalR
7. **Analytics** - Sales, customer, and product performance analytics
8. **Digital Product Delivery** - Automated digital download management

---

## Architecture Overview

### High-Level Architecture

The application follows a **three-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│                  (React SPA - Client Side)                   │
│  - UI Components                                             │
│  - State Management (Redux)                                  │
│  - Client-side Routing                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/HTTPS (REST API)
                        │ WebSocket (SignalR)
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                     Business Logic Layer                     │
│                 (ASP.NET Core Web API)                       │
│  - Controllers                                               │
│  - Services (Business Logic)                                 │
│  - DTOs & AutoMapper                                         │
│  - Middleware (Error Handling, Authentication)               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Entity Framework Core
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      Data Access Layer                       │
│            (Entity Framework Core + PostgreSQL)              │
│  - DbContext                                                 │
│  - Entity Models                                             │
│  - Migrations                                                │
│  - Database Triggers                                         │
└─────────────────────────────────────────────────────────────┘
```

### Communication Patterns

1. **RESTful API Communication**
   - Client makes HTTP requests to backend endpoints
   - JSON data format for request/response payloads
   - JWT-based authentication with Bearer tokens

2. **Real-Time Communication**
   - SignalR WebSocket connections for live updates
   - Server-to-client push notifications
   - Automatic reconnection handling

3. **External Service Integration**
   - Stripe API for payment processing
   - Cloudinary API for image storage and management
   - EmailJS for email notifications

---

## Frontend Architecture

### Technology Stack - Frontend

#### Core Framework and Language
- **React 19.1.1** - Modern UI framework with concurrent features
- **TypeScript 5.8.3** - Static type checking and enhanced developer experience
- **Vite 7.1.2** - Fast build tool and development server with HMR (Hot Module Replacement)

#### State Management
- **Redux Toolkit 2.8.2** - Predictable state container with simplified Redux logic
- **React Redux 9.2.0** - Official React bindings for Redux
- **Redux Thunk** - Async middleware (included in Redux Toolkit)

#### Routing
- **React Router DOM 7.8.0** - Declarative client-side routing
- Protected routes with role-based access control
- Nested routing for admin and user account sections

#### Forms and Validation
- **React Hook Form 7.62.0** - Performant form state management
- **Zod 4.1.8** - TypeScript-first schema validation
- **@hookform/resolvers 5.2.2** - Validation resolver for React Hook Form

#### UI and Styling
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **@tailwindcss/vite 4.1.11** - Vite plugin for Tailwind
- **Lucide React 0.539.0** - Modern icon library with 1000+ icons
- **React Toastify 11.0.5** - Toast notification system

#### Payment Integration
- **@stripe/stripe-js 7.9.0** - Stripe SDK for JavaScript
- **@stripe/react-stripe-js 4.0.2** - React components for Stripe Elements

#### Real-Time Communication
- **@microsoft/signalr 9.0.6** - SignalR client library for WebSocket connections

#### HTTP Client
- **Axios 1.11.0** - Promise-based HTTP client with interceptors

#### Data Visualization
- **Recharts 3.2.1** - Composable charting library for admin analytics

#### Utilities
- **lodash.debounce 4.0.8** - Debounce function for search inputs

#### Development Tools
- **ESLint 9.33.0** - Code linting and quality enforcement
- **TypeScript ESLint 8.39.1** - TypeScript-specific ESLint rules
- **@vitejs/plugin-react 5.0.0** - React plugin for Vite with Fast Refresh

### Frontend Architecture Patterns

#### 1. Feature-Based Folder Structure
The application is organized by features/domains rather than technical layers:

```
src/
├── app/                          # Core application setup
│   ├── api/                      # API client configuration
│   │   └── agent.ts              # Axios instance with interceptors
│   ├── components/               # Shared/reusable components
│   │   ├── CheckBoxGroup.tsx     # Multi-checkbox component
│   │   ├── RadioButton.tsx       # Radio button component
│   │   └── Pagination.tsx        # Pagination component
│   ├── errors/                   # Error pages
│   │   ├── NotFound.tsx          # 404 page
│   │   └── ServerError.tsx       # 500 page
│   ├── hooks/                    # Custom React hooks
│   │   ├── useProducts.tsx       # Product fetching logic
│   │   ├── useCategory.tsx       # Category data hook
│   │   ├── useWishlist.tsx       # Wishlist management
│   │   ├── useOrder.tsx          # Order utilities
│   │   └── useVariantSelection.tsx # Product variant logic
│   ├── layout/                   # Layout components
│   │   ├── App.tsx               # Root application component
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Footer.tsx            # Page footer
│   │   └── SignedInMenu.tsx      # User dropdown menu
│   ├── models/                   # TypeScript interfaces
│   │   ├── product.ts            # Product type definitions
│   │   ├── basket.ts             # Basket/cart interfaces
│   │   └── user.ts               # User types
│   ├── router/                   # Routing configuration
│   │   ├── Routes.tsx            # Central route definitions
│   │   └── RequireAuth.tsx       # Protected route wrapper
│   ├── store/                    # Redux store
│   │   └── configureStore.ts    # Store configuration
│   └── util/                     # Utility functions
│       └── util.ts               # Helper functions
│
├── features/                     # Feature modules
│   ├── catalog/                  # Product catalog feature
│   │   ├── Catalog.tsx           # Product listing page
│   │   ├── ProductDetails.tsx    # Product detail page
│   │   ├── ProductCard.tsx       # Product card component
│   │   ├── ProductList.tsx       # Product grid
│   │   ├── ProductSearch.tsx     # Search component
│   │   ├── catalogSlice.ts       # Redux slice for catalog
│   │   └── categorySlice.ts      # Redux slice for categories
│   │
│   ├── basket/                   # Shopping cart feature
│   │   ├── BasketPage.tsx        # Cart page
│   │   ├── BasketTable.tsx       # Cart items table
│   │   ├── BasketSummary.tsx     # Order summary
│   │   └── basketSlice.ts        # Redux slice for basket
│   │
│   ├── checkout/                 # Checkout process
│   │   ├── CheckoutPage.tsx      # Multi-step checkout wizard
│   │   ├── AddressForm.tsx       # Shipping address form
│   │   ├── Review.tsx            # Order review step
│   │   └── PaymentForm.tsx       # Stripe payment form
│   │
│   ├── order/                    # Order management
│   │   ├── Orders.tsx            # Order history list
│   │   └── OrderDetailed.tsx     # Single order details
│   │
│   ├── account/                  # User account
│   │   ├── Login.tsx             # Login page
│   │   ├── Register.tsx          # Registration page
│   │   ├── Profile.tsx           # Profile editor
│   │   ├── AddressesPage.tsx     # Address management
│   │   ├── SecurityPage.tsx      # Password change
│   │   ├── DigitalDownloadsPage.tsx # Digital products
│   │   └── accountSlice.ts       # Redux slice for auth
│   │
│   ├── wishlist/                 # Wishlist feature
│   │   ├── WishlistPage.tsx      # Wishlist display
│   │   └── wishlistSlice.ts      # Redux slice for wishlist
│   │
│   ├── admin/                    # Admin panel
│   │   ├── dashboard/            # Admin dashboard
│   │   │   ├── AdminDashboard.tsx # Main dashboard
│   │   │   ├── StatsCard.tsx     # Metric cards
│   │   │   └── RecentActivity.tsx # Activity feed
│   │   ├── products/             # Product management
│   │   │   ├── ProductManagement.tsx # Product CRUD
│   │   │   └── ProductForm.tsx   # Create/edit form
│   │   ├── orders/               # Order management
│   │   │   ├── OrderManagement.tsx # Order list
│   │   │   └── OrderDetails.tsx  # Order detail view
│   │   ├── inventory/            # Inventory management
│   │   │   └── InventoryManagement.tsx
│   │   ├── users/                # User management
│   │   │   └── UserManagement.tsx
│   │   ├── categories/           # Category management
│   │   │   └── CategoryManagement.tsx
│   │   ├── attributes/           # Product attributes
│   │   │   └── AttributeManagement.tsx
│   │   ├── analytics/            # Analytics dashboards
│   │   │   ├── SalesAnalytics.tsx
│   │   │   ├── ProductAnalytics.tsx
│   │   │   └── CustomerAnalytics.tsx
│   │   └── settings/             # System settings
│   │       ├── SystemSettings.tsx
│   │       ├── PaymentSettings.tsx
│   │       └── ShippingSettings.tsx
│   │
│   ├── home/                     # Landing page
│   │   └── HomePage.tsx          # Homepage with hero
│   ├── about/                    # About page
│   │   └── AboutPage.tsx
│   └── contact/                  # Contact page
│       └── ContactPage.tsx
│
├── components/                   # Additional shared components
│   ├── auth/                     # Auth-related components
│   │   └── ProtectedRoute.tsx    # Route guard
│   └── Search/                   # Search components
│       └── SearchModal.tsx       # Global search modal
│
└── services/                     # External service integrations
    └── emailService.ts           # EmailJS integration
```

#### 2. State Management Architecture

**Redux Store Structure:**

```typescript
{
  catalog: {
    products: EntityAdapter<Product>,      // Normalized products
    productsLoaded: boolean,
    filtersLoaded: boolean,
    categories: Category[],
    metaData: PaginationMetadata,
    productParams: {
      pageNumber: number,
      pageSize: number,
      orderBy: string,
      searchTerm: string,
      categories: string[],
      productTypes: string[]
    }
  },

  category: {
    categories: EntityAdapter<Category>,   // Normalized categories
    categoriesLoaded: boolean
  },

  basket: {
    basket: Basket | null,
    status: 'idle' | 'pending'
  },

  account: {
    user: User | null                      // JWT token, email, roles
  },

  userHistory: {
    viewedProducts: Product[],
    maxHistorySize: number
  },

  wishlist: {
    items: Product[]
  }
}
```

**Key Redux Patterns:**
- **Entity Adapter Pattern** - Normalized state for products and categories
- **Async Thunks** - Async actions with createAsyncThunk
- **Slice Pattern** - Self-contained feature modules with actions and reducers
- **Middleware Configuration** - Custom middleware for serialization handling

#### 3. Component Architecture Patterns

**Custom Hooks for Logic Reuse:**
- `useProducts()` - Fetches and caches product data
- `useCategory()` - Category data management
- `useWishlist()` - Wishlist operations with localStorage
- `useVariantSelection()` - Product variant selection logic
- `useOrder()` - Order utility functions
- `useBasketItem()` - Basket item utilities
- `useDigitalDownloads()` - Digital download management

**Protected Route Pattern:**
```typescript
<Route element={<RequireAuth roles={['Admin']} />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>
```

**Composition Pattern:**
- Small, focused components composed into larger features
- Separation of presentational and container components
- Props drilling minimized via Redux and custom hooks

#### 4. API Integration Pattern

**Centralized API Agent:**
```typescript
// src/app/api/agent.ts
const agent = {
  Catalog: {
    list: () => requests.get('products'),
    details: (id: number) => requests.get(`products/${id}`),
    create: (product: Product) => requests.post('products', product)
  },
  Basket: {
    get: () => requests.get('basket'),
    addItem: (productId: number, quantity: number) =>
      requests.post(`basket?productId=${productId}&quantity=${quantity}`)
  },
  // ... other endpoints
}
```

**Features:**
- Axios interceptors for JWT token injection
- Request/response logging
- Error handling and transformation
- Cookie-based session management (buyerId)

#### 5. Routing Architecture

**Route Structure:**
```
/ (Public Layout)
├── /home                       # Landing page
├── /catalog                    # Product listing
├── /catalog/:id                # Product details
├── /basket                     # Shopping cart
├── /wishlist                   # User wishlist
├── /about                      # About page
├── /contact                    # Contact page
├── /login                      # Login page
├── /register                   # Registration page
│
├── Protected Routes (Authenticated Users)
│   ├── /checkout               # Checkout wizard
│   ├── /orders                 # Order history
│   └── /account/*              # Account management
│       ├── /profile            # Profile settings
│       ├── /addresses          # Address management
│       ├── /security           # Password change
│       └── /downloads          # Digital downloads
│
└── Admin Routes (Admin Role)
    └── /admin/*
        ├── /dashboard          # Admin overview
        ├── /products           # Product management
        ├── /categories         # Category management
        ├── /inventory          # Stock management
        ├── /orders             # Order management
        ├── /users              # User management
        ├── /attributes         # Attribute management
        ├── /analytics/*        # Analytics dashboards
        ├── /settings/*         # System settings
        └── /rbac/*             # Role management
```

#### 6. Frontend Performance Optimizations

1. **Code Splitting** - React.lazy() for route-based code splitting
2. **Memoization** - useMemo and useCallback for expensive operations
3. **Debouncing** - Search inputs debounced (500ms)
4. **Pagination** - Server-side pagination for large datasets
5. **Entity Normalization** - Redux entity adapters prevent data duplication
6. **Optimistic Updates** - Immediate UI feedback before API confirmation
7. **Image Optimization** - Lazy loading and Cloudinary transformations

---

## Backend Architecture

### Technology Stack - Backend

#### Core Framework
- **ASP.NET Core 8.0** - Cross-platform, high-performance web framework
- **C# with .NET 8** - Modern, type-safe programming language
- **Entity Framework Core 9.0.8** - ORM (Object-Relational Mapper)

#### Database
- **PostgreSQL** (via Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4) - Production database
- **SQLite** (via Microsoft.EntityFrameworkCore.Sqlite 9.0.8) - Development database

#### Authentication & Authorization
- **ASP.NET Core Identity** (Microsoft.AspNetCore.Identity.EntityFrameworkCore 8.0.19)
- **JWT Bearer Authentication** (Microsoft.AspNetCore.Authentication.JwtBearer 8.0.19)
- **System.IdentityModel.Tokens.Jwt 8.14.0** - JWT token generation and validation

#### API Documentation
- **Swashbuckle.AspNetCore 6.6.2** - Swagger/OpenAPI documentation

#### Payment Processing
- **Stripe.net 48.5.0** - Stripe payment gateway integration

#### Cloud Storage
- **CloudinaryDotNet 1.27.7** - Cloud-based image storage and manipulation

#### Object Mapping
- **AutoMapper 12.0.1** - Object-to-object mapping
- **AutoMapper.Extensions.Microsoft.DependencyInjection 12.0.0** - DI integration

#### Real-Time Communication
- **SignalR** (built into ASP.NET Core) - WebSocket-based real-time communication

### Backend Architecture Patterns

#### 1. Layered Architecture

```
API/
├── Controllers/                  # Presentation Layer
│   ├── BaseApiController.cs      # Base controller with common functionality
│   ├── ProductsController.cs     # Product endpoints
│   ├── BasketController.cs       # Shopping cart endpoints
│   ├── OrderController.cs        # Order endpoints
│   ├── AccountController.cs      # Authentication endpoints
│   ├── CategoryController.cs     # Category endpoints
│   ├── AttributesController.cs   # Product attributes endpoints
│   ├── AdminController.cs        # Admin operations
│   ├── PaymentsController.cs     # Payment processing
│   ├── DigitalDownloadsController.cs # Digital delivery
│   ├── AnalyticsController.cs    # Analytics data
│   └── ErrorController.cs        # Error handling
│
├── Services/                     # Business Logic Layer
│   ├── TokenService.cs           # JWT token generation
│   ├── PaymentService.cs         # Payment processing logic
│   ├── OrderService.cs           # Order business logic
│   ├── ImageService.cs           # Image upload/management
│   ├── NotificationService.cs    # Real-time notifications
│   ├── DigitalDeliveryService.cs # Digital product delivery
│   ├── IPaymentService.cs        # Payment interface
│   ├── IOrderService.cs          # Order interface
│   └── INotificationService.cs   # Notification interface
│
├── Data/                         # Data Access Layer
│   ├── StoreContext.cs           # EF Core DbContext
│   ├── DbInitializer.cs          # Database seeding
│   └── Migrations/               # EF Core migrations
│
├── Entities/                     # Domain Models
│   ├── Product.cs                # Product entity
│   ├── Category.cs               # Category entity
│   ├── ProductVariant.cs         # Product variant entity
│   ├── Attribute.cs              # Attribute entity
│   ├── AttributeValue.cs         # Attribute value entity
│   ├── ProductVariantAttribute.cs # Variant-attribute join
│   ├── Basket.cs                 # Shopping cart entity
│   ├── BasketItem.cs             # Cart item entity
│   ├── Order.cs                  # Order entity
│   ├── OrderItem.cs              # Order line item entity
│   ├── OrderAddress.cs           # Order address entity
│   ├── OrderItemAttribute.cs     # Order item attribute snapshot
│   ├── OrderStatusHistory.cs     # Order status tracking
│   ├── Payment.cs                # Payment entity
│   ├── User.cs                   # User entity (extends IdentityUser)
│   ├── UserAddress.cs            # User address entity
│   ├── Role.cs                   # Role entity (extends IdentityRole)
│   ├── DigitalDownload.cs        # Digital download entity
│   ├── InventoryReservation.cs   # Inventory reservation entity
│   ├── ShippingMethod.cs         # Shipping method entity
│   ├── ShippingInfo.cs           # Shipping information entity
│   └── OrderNotification.cs      # Notification entity
│
├── Dto/                          # Data Transfer Objects
│   ├── CreateProductDto.cs       # Product creation DTO
│   ├── UpdateProductDto.cs       # Product update DTO
│   ├── CreateOrderDto.cs         # Order creation DTO
│   ├── LoginDto.cs               # Login credentials DTO
│   ├── RegisterDto.cs            # Registration DTO
│   └── UserDto.cs                # User response DTO
│
├── RequestHelpers/               # Helper Classes
│   ├── MappingProfiles.cs        # AutoMapper profiles
│   ├── PagedList.cs              # Pagination helper
│   └── PaginationParams.cs       # Pagination parameters
│
├── Middleware/                   # Custom Middleware
│   └── ExceptionMiddleware.cs    # Global error handling
│
├── Hubs/                         # SignalR Hubs
│   └── NotificationHub.cs        # Real-time notification hub
│
└── Program.cs                    # Application entry point and configuration
```

#### 2. Database Architecture

**Entity Relationship Diagram (Key Relationships):**

```
Category ────────┬──< Product >──┬──── ProductVariant ────┬──< ProductVariantAttribute >──── AttributeValue
                 │                │                        │
                 │                │                        └──── Attribute ────< AttributeValue
                 │                │
                 │                ├──< BasketItem >──── Basket
                 │                │
                 │                └──< OrderItem >──── Order ────┬──── OrderAddress
                                                                  │
User ────────────┬──── UserAddress                               ├──── Payment
                 │                                                │
                 ├──── Order                                      └──── OrderStatusHistory
                 │
                 ├──── DigitalDownload ────< OrderItem
                 │
                 └──── Role (Many-to-Many via Identity)
```

**Database Context Configuration:**
```csharp
public class StoreContext : IdentityDbContext<User, Role, int>
{
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
}
```

**Key Database Features:**
1. **Database Triggers:**
   - `SubtotalBasket` - Automatically updates basket subtotal when basket items change
   - Ensures data consistency at the database level

2. **Cascade Delete Behavior:**
   - User → UserAddress: Cascade
   - Order → OrderItems: Cascade
   - Order → Payments: Cascade
   - DigitalDownload → OrderItem: Cascade

3. **Soft Delete Support:**
   - Status-based soft deletes (e.g., OrderStatus.Cancelled)
   - Maintains data integrity for reporting

4. **Audit Trail:**
   - CreatedAt, UpdatedAt timestamps on most entities
   - OrderStatusHistory tracks all order status changes

#### 3. Service Layer Architecture

**1. Token Service**
- JWT token generation with role claims
- Token validation and parsing
- Configurable token expiration

**2. Payment Service (Stripe Integration)**
```csharp
public interface IPaymentService
{
    Task<PaymentIntent> CreateOrUpdatePaymentIntent(Basket basket);
    Task<PaymentIntent> CreatePaymentIntentAsync(Order order);
    Task<Payment> ProcessPaymentAsync(string paymentIntentId);
    Task<Payment> RefundPaymentAsync(int paymentId, decimal amount);
    Task<bool> ValidateWebhookAsync(string payload, string signature);
}
```

**Key Capabilities:**
- Create/update Stripe payment intents
- Process successful payments
- Handle refunds (full and partial)
- Validate Stripe webhooks
- Payment status tracking

**3. Order Service**
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

**Key Capabilities:**
- Convert basket to order with address snapshots
- Order status management with history tracking
- Digital download creation on order completion
- Real-time notification triggers
- Business rule enforcement (e.g., cancellation restrictions)

**4. Notification Service (SignalR)**
```csharp
public interface INotificationService
{
    Task SendOrderStatusUpdate(int userId, int orderId, string status, string customerName);
    Task SendAdminNotification(string message, string type);
    Task SendNewOrderAlert(int orderId, string customerName, decimal totalAmount);
}
```

**Key Capabilities:**
- User-specific notifications via SignalR groups
- Admin broadcast notifications
- Order status change notifications
- New order alerts to admins

**5. Image Service (Cloudinary Integration)**
- Image upload to Cloudinary
- Image deletion from Cloudinary
- Automatic URL generation
- Public ID management

**6. Digital Delivery Service**
- Digital product download link generation
- Download token generation and validation
- Download count tracking
- Expiration management

#### 4. Controller Architecture

**Base API Controller:**
```csharp
[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    // Common functionality for all controllers
}
```

**Key Controllers:**

1. **ProductsController** - Product CRUD operations
   - GET /api/products - List products with filtering/pagination
   - GET /api/products/{id} - Get product details
   - POST /api/products - Create product (Admin only)
   - PUT /api/products/{id} - Update product (Admin only)
   - DELETE /api/products/{id} - Delete product (Admin only)

2. **BasketController** - Shopping cart operations
   - GET /api/basket - Get current basket
   - POST /api/basket - Add item to basket
   - DELETE /api/basket - Remove item from basket

3. **OrderController** - Order management
   - GET /api/orders - Get user orders
   - GET /api/orders/{id} - Get order details
   - POST /api/orders - Create order from basket
   - PUT /api/orders/{id}/status - Update order status (Admin)

4. **AccountController** - Authentication and user management
   - POST /api/account/login - User login
   - POST /api/account/register - User registration
   - GET /api/account/currentUser - Get current user
   - PUT /api/account - Update user profile

5. **AdminController** - Admin operations
   - GET /api/admin/dashboard - Dashboard statistics
   - GET /api/admin/users - User management
   - POST /api/admin/products/bulk - Bulk product operations

6. **PaymentsController** - Payment processing
   - POST /api/payments - Create payment intent
   - POST /api/payments/webhook - Stripe webhook handler

7. **AnalyticsController** - Analytics data
   - GET /api/analytics/sales - Sales analytics
   - GET /api/analytics/customers - Customer analytics
   - GET /api/analytics/products - Product performance

#### 5. Authentication & Authorization

**JWT Configuration:**
```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["JWTSettings:TokenKey"]!))
        };

        // SignalR JWT support
        opt.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) &&
                    path.StartsWithSegments("/notificationHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
```

**Identity Configuration:**
```csharp
builder.Services.AddIdentityCore<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
})
.AddRoles<Role>()
.AddEntityFrameworkStores<StoreContext>();
```

**Role-Based Authorization:**
- Member - Regular customers
- Admin - Full system access

**Authorization Attributes:**
```csharp
[Authorize(Roles = "Admin")]
public async Task<ActionResult> DeleteProduct(int id)
{
    // Admin-only operation
}
```

#### 6. Middleware Architecture

**Exception Middleware:**
```csharp
app.UseMiddleware<ExceptionMiddleware>();
```

**Features:**
- Global exception handling
- Consistent error response format
- Logging integration
- Development vs. production error details

**Request Pipeline Order:**
```csharp
app.UseMiddleware<ExceptionMiddleware>();  // Error handling
app.UseRouting();                          // Route matching
app.UseCors("CorsPolicy");                 // CORS
app.UseAuthentication();                   // JWT validation
app.UseAuthorization();                    // Role checking
app.MapControllers();                      // API endpoints
app.MapHub<NotificationHub>("/notificationHub"); // SignalR
```

#### 7. Real-Time Communication with SignalR

**NotificationHub:**
```csharp
[Authorize]
public class NotificationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Auto-join user to personal group
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
        }

        // Auto-join admins to admin group
        var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
        if (userRoles != null && userRoles.Contains("Admin"))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
        }
    }
}
```

**Notification Patterns:**
- User-specific groups: `User_{userId}`
- Admin broadcast group: `Admins`
- Automatic group joining on connection
- JWT authentication via query string for WebSocket

#### 8. Data Transfer Objects (DTOs)

**Purpose:**
- Separate internal entity structure from API contract
- Control data exposure (security)
- Optimize payload size
- Version API independently from database

**AutoMapper Configuration:**
```csharp
public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<Product, ProductDto>();
        CreateMap<CreateProductDto, Product>();
        CreateMap<UpdateProductDto, Product>();
        CreateMap<Order, OrderDto>();
        CreateMap<User, UserDto>();
    }
}
```

---

## Technology Stack

### Complete Technology Matrix

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend - Core** | | | |
| UI Framework | React | 19.1.1 | Component-based UI library |
| Language | TypeScript | 5.8.3 | Type-safe JavaScript |
| Build Tool | Vite | 7.1.2 | Fast dev server and bundler |
| **Frontend - State** | | | |
| State Management | Redux Toolkit | 2.8.2 | Predictable state container |
| React Bindings | React Redux | 9.2.0 | Redux-React integration |
| **Frontend - Routing** | | | |
| Router | React Router DOM | 7.8.0 | Client-side routing |
| **Frontend - Forms** | | | |
| Form Library | React Hook Form | 7.62.0 | Form state management |
| Validation | Zod | 4.1.8 | Schema validation |
| **Frontend - UI** | | | |
| CSS Framework | Tailwind CSS | 4.1.11 | Utility-first styling |
| Icons | Lucide React | 0.539.0 | Icon library |
| Notifications | React Toastify | 11.0.5 | Toast notifications |
| Charts | Recharts | 3.2.1 | Data visualization |
| **Frontend - Integration** | | | |
| HTTP Client | Axios | 1.11.0 | API requests |
| Payments | Stripe React | 4.0.2 | Payment UI components |
| Real-time | SignalR Client | 9.0.6 | WebSocket client |
| Email | EmailJS | 4.4.1 | Email service |
| **Backend - Core** | | | |
| Framework | ASP.NET Core | 8.0 | Web API framework |
| Language | C# | .NET 8 | Backend language |
| ORM | Entity Framework Core | 9.0.8 | Database access |
| **Backend - Database** | | | |
| Production DB | PostgreSQL | Latest | Relational database |
| Dev DB | SQLite | Latest | Development database |
| **Backend - Authentication** | | | |
| Identity | ASP.NET Core Identity | 8.0.19 | User management |
| JWT | JWT Bearer | 8.0.19 | Token authentication |
| **Backend - Integration** | | | |
| Payments | Stripe.NET | 48.5.0 | Payment processing |
| Cloud Storage | Cloudinary | 1.27.7 | Image hosting |
| Real-time | SignalR | Built-in | WebSocket server |
| Mapping | AutoMapper | 12.0.1 | Object mapping |
| API Docs | Swashbuckle | 6.6.2 | Swagger/OpenAPI |
| **Infrastructure** | | | |
| Version Control | Git | Latest | Source control |
| Container | Docker | (optional) | Containerization |

---

## Application Features

### Public Features (Unauthenticated Users)

#### 1. Product Catalog
- **Product Browsing**
  - Grid view with product cards
  - Product images, names, prices, categories
  - Stock availability indicators
  - Product type badges (Physical/Digital)

- **Search and Filtering**
  - Text search (debounced, 500ms)
  - Category filter (multi-select)
  - Product type filter (Physical/Digital)
  - Sort options: Name, Price (Low-High), Price (High-Low)
  - URL parameter support for deep linking

- **Product Details**
  - Full product information
  - Image gallery
  - Variant selection (size, color, etc.)
  - Stock availability per variant
  - Quantity selector
  - Add to cart button
  - Add to wishlist button
  - Recommended products section

- **Pagination**
  - Server-side pagination
  - Configurable page size
  - Page navigation controls
  - Total item count display

#### 2. Shopping Cart (Basket)
- **Cart Management**
  - Add products to cart
  - Update quantities (with stock validation)
  - Remove items
  - View line item totals
  - View cart subtotal
  - Delivery fee calculation (free over threshold)
  - Cart persistence via cookies (buyerId)

- **Cart Display**
  - Product thumbnails
  - Product names and variant details
  - Quantity dropdowns (with stock limits)
  - Price per item
  - Line totals
  - Cart summary with delivery fee

#### 3. Wishlist
- **Wishlist Features**
  - Add products to wishlist
  - Remove from wishlist
  - Clear all items
  - LocalStorage persistence (per user)
  - Wishlist count badge in header
  - Quick view of wishlist items

#### 4. Authentication
- **User Registration**
  - Username, email, password fields
  - Password strength requirements:
    - 6-20 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
  - Detailed validation error messages
  - Auto-redirect to login on success

- **User Login**
  - Email and password authentication
  - JWT token generation
  - Redirect to previous page or catalog
  - Error handling with toast notifications
  - Basket merge on login

### Authenticated User Features

#### 5. Checkout Process
- **Multi-Step Checkout Wizard**
  - Step 1: Shipping Address
    - Form fields: Name, Address, City, ZIP, Country
    - Save address option
    - Form validation
  - Step 2: Order Review
    - Item list with quantities and prices
    - Order summary with totals
    - Edit cart link
  - Step 3: Payment
    - Stripe payment form
    - Card number, expiry, CVC fields
    - Name on card
    - Real-time validation

- **Stripe Integration**
  - Payment intent creation
  - Secure payment processing
  - 3D Secure support (SCA compliance)
  - Payment confirmation
  - Order creation on success

- **Order Completion**
  - Order number generation
  - Order confirmation message
  - Email notification (via EmailJS)
  - Digital download delivery for digital products
  - Cart clearing after successful order

#### 6. Order Management
- **Order History**
  - List of all user orders
  - Order number, date, total, status
  - Status badges (color-coded)
  - Tracking number display
  - View details button

- **Order Details**
  - Order status timeline with progress indicator
  - Steps: Pending → Processing → Shipped → Delivered
  - Current status highlighting
  - Order items with images and quantities
  - Order summary with totals
  - Shipping address display
  - Tracking number (if available)

#### 7. User Account Management
- **Profile Management**
  - Edit name and last name
  - Edit phone number
  - Email display (non-editable)
  - Form validation
  - Update confirmation

- **Address Management**
  - List saved addresses
  - Add new address
  - Edit existing addresses
  - Delete addresses
  - Set default address
  - Address type (Shipping/Billing/Both)

- **Security Settings**
  - Change password
  - Current password verification
  - New password with strength requirements
  - Password confirmation
  - Show/hide password toggles

- **Digital Downloads**
  - List of purchased digital products
  - Download buttons with token validation
  - Download count tracking (X of Y)
  - Expiration date display
  - Expired status indicator
  - Maximum download limit enforcement

#### 8. User History
- **Browsing History**
  - Recently viewed products
  - LocalStorage persistence
  - Maximum history size limit (FIFO)

### Admin Features (Admin Role Required)

#### 9. Admin Dashboard
- **Overview Statistics**
  - Total orders with percentage change
  - Total revenue with growth indicator
  - User count with change percentage
  - Product count with change percentage
  - Date display in header

- **Quick Actions**
  - Add new product button
  - View orders button
  - Manage users button
  - Inventory management button

- **Low Stock Alerts**
  - Products with ≤10 stock
  - Clickable links to product management
  - Stock level indicators

- **Performance Metrics**
  - Sales goal progress bar
  - Customer satisfaction score
  - Visual progress indicators

#### 10. Product Management
- **Product CRUD Operations**
  - Create new products
  - Edit existing products
  - Delete products (soft delete)
  - Activate/deactivate products

- **Product Table**
  - Product image thumbnails
  - Name, category, type, price, stock
  - Status badges (Active/Inactive)
  - Low stock highlighting (≤10)
  - Actions: View, Edit, Delete

- **Search and Filtering**
  - Text search (debounced)
  - Category filter dropdown
  - Status filter (All, Active, Inactive)
  - Product type filter (All, Physical, Digital)

- **Bulk Operations**
  - Select multiple products (checkbox)
  - Bulk activate/deactivate
  - Bulk delete
  - Export to CSV with column selection

- **Product Form**
  - Name, description, price
  - Category selection
  - Product type (Physical/Digital)
  - Stock quantity
  - Image upload (Cloudinary)
  - Digital file URL (for digital products)
  - Instant delivery toggle
  - Variant management

#### 11. Category Management
- **Category CRUD**
  - Create new categories
  - Edit category names
  - Delete categories (with product check)
  - List all categories

- **Category Display**
  - Category list with product counts
  - Edit and delete actions
  - Inline editing

#### 12. Attribute Management
- **Product Attributes**
  - Create attributes (e.g., Size, Color, Material)
  - Edit attribute names
  - Delete attributes

- **Attribute Values**
  - Add values to attributes (e.g., S, M, L for Size)
  - Edit value names
  - Delete values
  - Reorder values

- **Variant Generation**
  - Assign attributes to products
  - Automatic variant generation from attribute combinations
  - Per-variant stock management
  - Per-variant price overrides (optional)

#### 13. Inventory Management
- **Stock Control**
  - View all product variants with stock levels
  - Search by product name
  - Low stock filter toggle
  - Adjust stock quantities

- **Stock Adjustment**
  - Adjustment modal with reason dropdown
  - Reasons: Restock, Sale, Damaged, Correction, Return
  - Quantity input with validation
  - Negative stock warnings
  - Real-time stock updates

#### 14. Order Management
- **Order Dashboard**
  - Order statistics cards:
    - Pending orders count
    - Processing orders count
    - Shipped orders count
    - Total revenue

- **Order Table**
  - Order number, customer email, date
  - Status badges (color-coded)
  - Tracking number
  - Total amount
  - Actions: View, Update status

- **Filtering and Search**
  - Status filter dropdown
  - Date range picker
  - Search by order number or customer email (debounced)

- **Order Details Modal**
  - Full order information
  - Order items with images
  - Customer information
  - Shipping address
  - Payment status
  - Order status history with timestamps

- **Order Status Management**
  - Status workflow component
  - Quick status change buttons:
    - Process (Pending → Processing)
    - Ship (Processing → Shipped)
    - Deliver (Shipped → Delivered)
  - Tracking number input
  - Status history tracking
  - Real-time notifications to customers

- **Bulk Operations**
  - Select multiple orders
  - Bulk status update
  - Mark as shipped
  - Send email notifications
  - Cancel orders

- **Export**
  - Export orders to CSV
  - Configurable column selection

#### 15. User Management
- **User Table**
  - User ID, email, name
  - Role badges (Member, Admin)
  - Status badges (Active, Suspended, Inactive)
  - Registration date
  - Actions: View, Edit, Suspend

- **User Metrics**
  - Total orders per user
  - Total amount spent per user

- **Filtering**
  - Role filter (All, Customer, Admin, Manager)
  - Status filter (All, Active, Suspended, Inactive)
  - Search by email or name (debounced)

- **Bulk Operations**
  - Select multiple users
  - Bulk status updates
  - Role assignment

#### 16. Analytics Dashboards

**Sales Analytics**
- **Metrics Cards**
  - Total revenue with % growth
  - Total orders with % growth
  - Total customers with % growth
  - Average order value with % growth

- **Sales Trend Chart**
  - Chart types: Line, Area, Bar (toggleable)
  - X-axis: Date
  - Y-axis: Revenue
  - Interactive tooltips
  - Responsive design

- **Category Sales Distribution**
  - Pie chart showing revenue by category
  - Color-coded segments
  - Legend with percentages

- **Date Range Filters**
  - Last 7 days
  - Last 30 days
  - Last 90 days
  - Custom date range (future)

**Product Analytics**
- Top selling products table
- Revenue by product chart
- Stock levels overview
- Category performance comparison

**Customer Analytics**
- New customers over time chart
- Customer lifetime value distribution
- Customer segmentation
- Repeat purchase rate

#### 17. System Settings

**General Settings**
- Site name and description
- Contact email
- Maintenance mode toggle
- Maximum upload size

**Payment Settings**
- Stripe API key configuration
- Payment methods (enable/disable)
- Currency settings
- Refund policy

**Shipping Settings**
- Shipping methods management
- Add/Edit/Delete shipping methods
- Fields: Name, Description, Cost, Estimated Days
- Free shipping threshold per method
- Active/Inactive status

**Tax Settings**
- Tax rate percentage
- Tax-inclusive pricing toggle
- Tax exemptions

#### 18. Role-Based Access Control (RBAC)

**Role Management**
- Create custom roles
- Edit role names and descriptions
- Delete roles (with user check)

**Permission Assignment**
- Assign permissions to roles
- Permission categories:
  - Product Management
  - Order Management
  - User Management
  - Analytics Access
  - Settings Configuration

**User-Role Assignment**
- Assign roles to users
- View user roles
- Role hierarchy enforcement

### System-Wide Features

#### 19. Real-Time Notifications

**Customer Notifications (SignalR)**
- Order status change notifications
- Real-time updates pushed to user's browser
- Toast notification display
- Notification badge in header

**Admin Notifications (SignalR)**
- New order alerts
- Low stock warnings
- User registration notifications
- Broadcast messages to all admins

**SignalR Groups**
- User-specific: `User_{userId}`
- Admin broadcast: `Admins`
- Automatic group joining on connection

#### 20. Error Handling

**Frontend Error Handling**
- Global error boundary
- Toast error notifications
- Network error detection
- Retry mechanisms for failed requests

**Backend Error Handling**
- Exception middleware
- Consistent error response format
- Logging integration
- Development vs. production error details

**Error Types**
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

#### 21. Search Functionality

**Product Search**
- Full-text search across product names and descriptions
- Debounced input (500ms)
- Real-time results
- Search highlighting (future)

**Global Search Modal**
- Quick search from anywhere
- Keyboard shortcut support (Ctrl+K)
- Recent searches (future)
- Search suggestions (future)

#### 22. Image Management

**Image Upload**
- Drag-and-drop support
- File type validation (JPEG, PNG, WebP)
- Size limits enforcement
- Preview before upload

**Cloudinary Integration**
- Automatic image optimization
- CDN delivery
- Responsive image URLs
- Transformation support (resize, crop, etc.)

**Image Storage**
- Public ID tracking
- Deletion on product removal
- Orphaned image cleanup

#### 23. Email Notifications

**EmailJS Integration**
- Order confirmation emails
- Shipping notifications
- Account verification (future)
- Password reset (future)

**Email Templates**
- Responsive HTML templates
- Dynamic content injection
- Branding consistency

#### 24. Performance Features

**Frontend Performance**
- Code splitting by route
- Lazy loading of components
- Image lazy loading
- Debounced search and inputs
- Optimistic UI updates
- Request deduplication
- Response caching

**Backend Performance**
- Database query optimization
- Eager/lazy loading strategies
- Pagination for large datasets
- Index optimization
- Connection pooling
- Response compression

#### 25. Responsive Design

**Mobile-First Approach**
- All pages responsive from 320px+
- Touch-friendly UI elements
- Mobile navigation menu
- Swipeable carousels
- Adaptive layouts

**Breakpoints**
- sm: 640px (mobile landscape)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (large desktop)

#### 26. Accessibility Features

**WCAG Compliance Efforts**
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Alt text for images
- Form labels and error messages
- Screen reader support

---

## Data Flow and Communication

### 1. User Authentication Flow

```
Client (Login Form)
    │
    ├── POST /api/account/login { username, password }
    │
    ▼
Backend (AccountController)
    │
    ├── UserManager.FindByNameAsync()
    ├── UserManager.CheckPasswordAsync()
    │
    ▼
TokenService
    │
    ├── Generate JWT with claims (userId, email, roles)
    │
    ▼
Backend Response
    │
    ├── { email, token, roles[] }
    │
    ▼
Frontend (accountSlice)
    │
    ├── Store user in Redux state
    ├── Store token in localStorage
    ├── Set Axios default Authorization header
    │
    ▼
Client (Redirect to previous page or catalog)
```

### 2. Product Catalog Flow

```
Client (Catalog Page Mount)
    │
    ├── useProducts() hook checks Redux state
    │
    ├── If not loaded, dispatch fetchProductsAsync()
    │
    ▼
Frontend (catalogSlice thunk)
    │
    ├── GET /api/products?pageNumber=1&pageSize=12&orderBy=name&categories=[]
    │
    ▼
Backend (ProductsController)
    │
    ├── Apply filters (category, type, search)
    ├── Apply sorting
    ├── Apply pagination
    │
    ▼
Database (StoreContext)
    │
    ├── SELECT with WHERE, ORDER BY, SKIP, TAKE
    ├── Include related entities (Category)
    │
    ▼
Backend Response
    │
    ├── Products array
    ├── Pagination metadata (currentPage, totalPages, totalCount)
    ├── X-Pagination header
    │
    ▼
Frontend (catalogSlice reducer)
    │
    ├── Store products in entity adapter (normalized)
    ├── Store metadata
    ├── Set productsLoaded = true
    │
    ▼
Client (Catalog Component)
    │
    └── Render ProductCard components with data
```

### 3. Add to Cart Flow

```
Client (ProductDetails - Add to Cart Button)
    │
    ├── User selects variant and quantity
    ├── dispatch addBasketItemAsync({ productId, quantity, attributeValueIds })
    │
    ▼
Frontend (basketSlice thunk)
    │
    ├── POST /api/basket?productId=1&quantity=2&attributeValueIds=3,4
    ├── Include buyerId cookie in request
    │
    ▼
Backend (BasketController)
    │
    ├── Get or create basket by buyerId cookie
    ├── Find product and validate stock
    ├── Find matching variant by attribute values
    ├── Check variant stock availability
    │
    ├── If item exists in basket
    │   └── Update quantity (respecting stock limits)
    │
    ├── Else
    │   └── Create new BasketItem
    │
    ├── Database trigger updates basket subtotal
    │
    ▼
Database (StoreContext)
    │
    ├── INSERT or UPDATE BasketItem
    ├── Trigger: SubtotalBasket executes
    │   └── Calculates new basket subtotal
    │
    ▼
Backend Response
    │
    ├── Complete basket with items, subtotal, paymentIntentId
    ├── Set buyerId cookie in response
    │
    ▼
Frontend (basketSlice reducer)
    │
    ├── Update basket state
    ├── Update basket count in header badge
    │
    ▼
Client (Toast Notification)
    │
    └── Show "Item added to cart" success message
```

### 4. Checkout and Payment Flow

```
Client (Checkout - Step 1: Address Form)
    │
    ├── User fills shipping address
    ├── Form validation (Zod schema)
    ├── Next button → Move to Step 2
    │
    ▼
Client (Checkout - Step 2: Review)
    │
    ├── Display order items and totals
    ├── Next button → Move to Step 3
    │
    ▼
Client (Checkout - Step 3: Payment)
    │
    ├── useEffect: Create or update payment intent
    │
    ├── POST /api/payments/create-intent
    │   └── Body: { basketId, totalAmount }
    │
    ▼
Backend (PaymentsController)
    │
    ├── Get basket from database
    ├── Calculate total (subtotal + delivery)
    │
    ▼
PaymentService
    │
    ├── If no paymentIntentId on basket
    │   └── Stripe: Create new PaymentIntent
    │
    ├── Else
    │   └── Stripe: Update existing PaymentIntent amount
    │
    ├── Save paymentIntentId and clientSecret to basket
    │
    ▼
Backend Response
    │
    ├── { clientSecret }
    │
    ▼
Client (PaymentForm - Stripe Elements)
    │
    ├── Load Stripe Elements with clientSecret
    ├── User enters card details
    ├── User clicks "Place Order"
    │
    ├── stripe.confirmCardPayment(clientSecret, { card element })
    │
    ▼
Stripe API
    │
    ├── Process payment
    ├── 3D Secure challenge (if required)
    │
    ▼
Client (Payment Confirmation)
    │
    ├── If payment succeeded
    │   │
    │   ├── POST /api/orders
    │   │   └── Body: { basketId, shippingAddress, billingAddress }
    │   │
    │   ▼
    │ Backend (OrderController)
    │   │
    │   ├── Call OrderService.CreateOrderFromBasketAsync()
    │   │
    │   ▼
    │ OrderService
    │   │
    │   ├── Get basket with items
    │   ├── Create OrderAddress entities (snapshots)
    │   ├── Save addresses to get IDs
    │   │
    │   ├── Create OrderItem entities from BasketItems
    │   │   └── Snapshot: productName, description, price, imageUrl
    │   │
    │   ├── Calculate order totals
    │   │   └── Subtotal, shipping, tax, total
    │   │
    │   ├── Generate order number (ORD-YYYYMMDD-XXXX)
    │   │
    │   ├── Create Order entity
    │   │   └── Status: Pending
    │   │   └── PaymentStatus: Pending
    │   │
    │   ├── Save order to database
    │   ├── Delete basket from database
    │   │
    │   ▼
    │ Database (Transactions)
    │   │
    │   ├── INSERT Order, OrderItems, OrderAddress
    │   ├── DELETE Basket, BasketItems
    │   ├── COMMIT transaction
    │   │
    │   ▼
    │ Backend Response
    │   │
    │   ├── Order object with orderNumber
    │   │
    │   ▼
    │ Client (Success)
    │   │
    │   ├── Clear basket in Redux
    │   ├── Navigate to success page or digital download page
    │   └── Show success toast with order number
    │
    └── If payment failed
        └── Show error toast with Stripe error message
```

### 5. Admin Order Status Update Flow with Real-Time Notifications

```
Admin Client (Order Management - Update Status Button)
    │
    ├── Admin clicks "Ship" button for order
    ├── PUT /api/orders/{orderId}/status
    │   └── Body: { newStatus: "Shipped", trackingNumber: "1234567890" }
    │
    ▼
Backend (OrderController)
    │
    ├── [Authorize(Roles = "Admin")] validation
    │
    ├── Call OrderService.UpdateOrderStatusAsync(orderId, newStatus)
    │
    ▼
OrderService
    │
    ├── Get order with items and address from database
    ├── Store oldStatus = order.OrderStatus
    ├── Update order.OrderStatus = newStatus
    │
    ├── If newStatus == Delivered && order.ContainsDigitalProducts
    │   │
    │   └── CreateDigitalDownloadsAsync(order)
    │       │
    │       ├── For each digital product in order
    │       │   │
    │       │   └── Create DigitalDownload entity
    │       │       └── ExpiresAt = 30 days from now
    │       │       └── MaxDownloads = 3
    │       │
    │       └── Save DigitalDownloads to database
    │
    ├── Create OrderStatusHistory entry
    │   └── FromStatus, ToStatus, ChangedAt, Notes
    │
    ├── Save changes to database
    │
    ▼
NotificationService (via INotificationService)
    │
    ├── SendOrderStatusUpdate(userId, orderId, newStatus, customerName)
    │
    ▼
SignalR NotificationHub
    │
    ├── _hubContext.Clients.Group($"User_{userId}")
    ├── .SendAsync("ReceiveOrderUpdate", notificationData)
    │
    ▼
Customer Client (SignalR Connection)
    │
    ├── hubConnection.on("ReceiveOrderUpdate", (data) => { ... })
    │
    ├── Display toast notification
    │   └── "Order #ORD-20250101-1234 status updated to Shipped"
    │
    └── If on orders page
        └── Refresh order list or update specific order in state
```

### 6. Digital Download Flow

```
Customer Client (DigitalDownloadsPage)
    │
    ├── useEffect: Fetch digital downloads
    ├── GET /api/digitaldownloads
    │
    ▼
Backend (DigitalDownloadsController)
    │
    ├── [Authorize] validation
    ├── Get userId from JWT claims
    │
    ├── Query: DigitalDownloads WHERE UserId = userId
    ├── Include: OrderItem, Product
    │
    ▼
Database
    │
    ├── SELECT with joins
    │
    ▼
Backend Response
    │
    ├── Array of DigitalDownload objects
    │   └── { id, productName, downloadToken, expiresAt, downloadCount, maxDownloads }
    │
    ▼
Client (DigitalDownloadsPage)
    │
    ├── Render download list
    ├── For each download
    │   │
    │   ├── Show product name
    │   ├── Show expiration date
    │   ├── Show download count (X of Y)
    │   │
    │   └── Download button (if not expired and downloads remaining)
    │
    ▼
User clicks Download Button
    │
    ├── POST /api/digitaldownloads/{id}/download
    │
    ▼
Backend (DigitalDownloadsController)
    │
    ├── Get DigitalDownload by id and userId
    ├── Validate: IsExpired == false
    ├── Validate: DownloadCount < MaxDownloads
    │
    ├── Increment DownloadCount
    ├── Update DownloadedAt if first download
    ├── Save changes
    │
    ▼
DigitalDeliveryService
    │
    ├── Generate secure download URL
    │   └── Could be pre-signed S3 URL or temporary token
    │
    ▼
Backend Response
    │
    ├── { downloadUrl: "https://..." }
    │
    ▼
Client
    │
    ├── window.open(downloadUrl) or initiate file download
    │
    └── Update download count in UI
```

### 7. Real-Time Notification System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Client Applications                      │
│                                                               │
│  Customer Clients (N)          Admin Clients (M)             │
│  ┌──────────────────┐          ┌──────────────────┐         │
│  │  User_1 (SignalR)│          │  Admins (SignalR)│         │
│  │  User_2 (SignalR)│          │  Admins (SignalR)│         │
│  │  User_3 (SignalR)│          │  Admins (SignalR)│         │
│  └────────┬─────────┘          └────────┬─────────┘         │
│           │                              │                    │
└───────────┼──────────────────────────────┼───────────────────┘
            │                              │
            │   WebSocket Connections      │
            │   (wss://api/notificationHub)│
            │                              │
┌───────────▼──────────────────────────────▼───────────────────┐
│                    SignalR Hub (Server)                       │
│                   NotificationHub.cs                          │
│                                                               │
│  Groups:                                                      │
│  ├─ User_1 → ConnectionId(s)                                 │
│  ├─ User_2 → ConnectionId(s)                                 │
│  ├─ User_3 → ConnectionId(s)                                 │
│  └─ Admins → ConnectionId(s) for all admin users             │
│                                                               │
│  Methods:                                                     │
│  ├─ OnConnectedAsync() - Auto-join groups                    │
│  ├─ OnDisconnectedAsync() - Cleanup                          │
│  ├─ JoinUserGroup() - Manual group join                      │
│  └─ JoinAdminGroup() - Manual admin group join               │
│                                                               │
└───────────▲──────────────────────────────▲───────────────────┘
            │                              │
            │                              │
┌───────────┴──────────────────────────────┴───────────────────┐
│                     Backend Services                          │
│                                                               │
│  NotificationService (INotificationService)                   │
│  ├─ SendOrderStatusUpdate(userId, orderId, status, name)     │
│  │   └─ Clients.Group($"User_{userId}").SendAsync(...)       │
│  │                                                            │
│  ├─ SendNewOrderAlert(orderId, customerName, total)          │
│  │   └─ Clients.Group("Admins").SendAsync(...)               │
│  │                                                            │
│  └─ SendAdminNotification(message, type)                     │
│      └─ Clients.Group("Admins").SendAsync(...)               │
│                                                               │
│  OrderService                                                 │
│  └─ UpdateOrderStatusAsync()                                 │
│      └─ Calls NotificationService.SendOrderStatusUpdate()    │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**SignalR Event Flow:**

1. **Client Connection:**
   - Client opens WebSocket: `wss://api/notificationHub?access_token=JWT_TOKEN`
   - JWT token validated via query parameter
   - `OnConnectedAsync()` executes
   - User automatically joined to `User_{userId}` group
   - Admins automatically joined to `Admins` group

2. **Server-to-Client Messages:**
   - Backend service calls NotificationService method
   - NotificationService uses IHubContext to send to specific group
   - SignalR Hub pushes message to all connections in group
   - Client event handlers receive and process message

3. **Client Event Handlers:**
   ```typescript
   hubConnection.on("ReceiveOrderUpdate", (data) => {
     toast.info(`Order ${data.orderNumber} is now ${data.status}`);
     // Optionally update local state
   });

   hubConnection.on("ReceiveNewOrder", (data) => {
     toast.success(`New order from ${data.customerName}`);
     // Refresh admin order list
   });
   ```

---

## Security Architecture

### 1. Authentication Security

**JWT (JSON Web Token) Authentication:**
- Token-based stateless authentication
- Token contains encrypted user claims (userId, email, roles)
- Token expiration enforced (configurable lifetime)
- Token stored in localStorage on client
- Automatic inclusion in API requests via Axios interceptor

**Token Structure:**
```json
{
  "sub": "user@example.com",
  "nameid": "123",
  "email": "user@example.com",
  "role": ["Member"],
  "nbf": 1234567890,
  "exp": 1234571490,
  "iat": 1234567890
}
```

**Token Validation:**
- Issuer signing key validation
- Lifetime validation (expiration check)
- Signature verification
- Claims validation

**Password Security:**
- ASP.NET Core Identity password hashing (PBKDF2)
- Configurable password requirements:
  - Minimum length
  - Required character types (uppercase, lowercase, digit, special)
- Password confirmation on change
- Secure password reset flow (future)

### 2. Authorization Security

**Role-Based Access Control (RBAC):**
- Two primary roles: Member, Admin
- Controller-level authorization: `[Authorize(Roles = "Admin")]`
- Frontend route guards: `<RequireAuth roles={['Admin']} />`
- Claims-based authorization for fine-grained control

**Authorization Checks:**
```csharp
// Backend
[Authorize(Roles = "Admin")]
public async Task<ActionResult> DeleteProduct(int id) { ... }

// Frontend
<Route element={<RequireAuth roles={['Admin']} />}>
  <Route path="/admin/*" element={<AdminLayout />} />
</Route>
```

### 3. API Security

**CORS (Cross-Origin Resource Sharing):**
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

**HTTPS Enforcement:**
- HTTPS redirection middleware (production)
- Secure cookie flags
- HSTS (HTTP Strict Transport Security)

**Request Validation:**
- Model validation with data annotations
- DTO validation before processing
- Input sanitization to prevent XSS
- SQL injection prevention via parameterized queries (EF Core)

### 4. Payment Security

**Stripe Security Best Practices:**
- PCI DSS compliance via Stripe
- No card data stored in application database
- Stripe Elements for secure card input
- Payment intents for SCA (Strong Customer Authentication)
- Webhook signature validation for payment confirmations

**Sensitive Data Handling:**
- Stripe API keys in environment variables/user secrets
- No logging of payment details
- Secure transmission (HTTPS only)

### 5. Data Security

**Database Security:**
- Connection strings in secure configuration (user secrets, environment variables)
- Parameterized queries (EF Core prevents SQL injection)
- Encrypted connections to database (SSL/TLS)
- Role-based database access

**Sensitive Data Protection:**
- Passwords hashed (never stored in plain text)
- JWT tokens encrypted
- API keys in secure storage (not in source control)
- User secrets for development environment

**Data Validation:**
- Client-side validation (Zod schemas)
- Server-side validation (model validation)
- Type safety (TypeScript, C# strong typing)

### 6. Session Security

**Cookie Security:**
- HttpOnly cookies for buyerId (basket session)
- Secure flag in production
- SameSite attribute for CSRF protection

**Session Management:**
- JWT token expiration enforcement
- Automatic logout on token expiration
- Refresh token flow (future enhancement)

### 7. SignalR Security

**WebSocket Security:**
- JWT authentication required for SignalR connections
- Token validation on connection
- User-specific groups prevent unauthorized access
- Admin group restricted to Admin role

**Connection Security:**
```csharp
opt.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) &&
            path.StartsWithSegments("/notificationHub"))
        {
            context.Token = accessToken;
        }
        return Task.CompletedTask;
    }
};
```

### 8. Frontend Security

**XSS (Cross-Site Scripting) Prevention:**
- React automatic escaping of rendered content
- DOMPurify for user-generated HTML (if needed)
- Content Security Policy headers (CSP)

**CSRF (Cross-Site Request Forgery) Prevention:**
- SameSite cookie attribute
- JWT in Authorization header (not in cookie)
- CORS policy restrictions

**Dependency Security:**
- Regular dependency updates
- NPM audit for vulnerabilities
- Lockfiles to prevent supply chain attacks

### 9. Error Handling Security

**Information Disclosure Prevention:**
- Generic error messages to users
- Detailed errors logged server-side only
- Different error detail levels for development vs. production
- No stack traces exposed to client in production

**Exception Middleware:**
```csharp
if (env.IsDevelopment())
{
    response.Message = exception.Message;
    response.Details = exception.StackTrace;
}
else
{
    response.Message = "Internal server error";
}
```

### 10. Security Best Practices Implemented

✅ **Authentication:**
- JWT token-based authentication
- Secure password hashing
- Password strength requirements

✅ **Authorization:**
- Role-based access control
- Route-level protection
- API endpoint authorization

✅ **Data Protection:**
- HTTPS enforcement
- Encrypted database connections
- Secure configuration management

✅ **Payment Security:**
- PCI DSS compliance via Stripe
- No card data storage
- Webhook validation

✅ **Input Validation:**
- Client and server-side validation
- SQL injection prevention
- XSS prevention

✅ **Session Management:**
- Secure cookies
- Token expiration
- CSRF protection

✅ **Error Handling:**
- No sensitive data in errors
- Appropriate logging

### Security Enhancements for Future Consideration

🔄 **Planned Enhancements:**
- Two-factor authentication (2FA)
- Refresh token implementation
- Rate limiting and throttling
- Account lockout after failed login attempts
- Password reset via email
- Email verification on registration
- Security headers (CSP, X-Frame-Options, etc.)
- WAF (Web Application Firewall) integration
- DDoS protection
- Regular security audits and penetration testing

---

## Deployment and Infrastructure

### Development Environment

**Frontend Development:**
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**Backend Development:**
```bash
# Navigate to API directory
cd API

# Restore NuGet packages
dotnet restore

# Run database migrations
dotnet ef database update

# Start API server (http://localhost:5000)
dotnet run
```

**Environment Variables:**

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
VITE_SIGNALR_HUB_URL=http://localhost:5000/notificationHub
```

Backend (appsettings.json / User Secrets):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=storedb;Username=postgres;Password=xxxxx"
  },
  "JWTSettings": {
    "TokenKey": "super_secret_key_at_least_32_characters_long"
  },
  "StripeSettings": {
    "PublishableKey": "pk_test_xxxxx",
    "SecretKey": "sk_test_xxxxx",
    "WhSecret": "whsec_xxxxx"
  },
  "CloudinarySettings": {
    "CloudName": "xxxxx",
    "ApiKey": "xxxxx",
    "ApiSecret": "xxxxx"
  }
}
```

### Database Setup

**Development Database (SQLite):**
```bash
# Create migration
dotnet ef migrations add InitialCreate

# Apply migration
dotnet ef database update
```

**Production Database (PostgreSQL):**
```bash
# Install PostgreSQL
# Create database
createdb storedb

# Update connection string in appsettings.json
# Run migrations
dotnet ef database update --context StoreContext
```

**Database Initialization:**
- Automatic migration on app startup
- Database seeding with initial data (categories, roles)
- DbInitializer.Initialize() creates admin user and sample data

### Production Deployment

**Frontend Deployment Options:**

1. **Static Site Hosting (Recommended):**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Azure Static Web Apps

2. **Build Process:**
   ```bash
   npm run build
   # Output: dist/ folder with static files
   ```

3. **Environment Configuration:**
   - Set production API URL
   - Configure production Stripe keys
   - Enable production error reporting

**Backend Deployment Options:**

1. **Cloud Platforms:**
   - **Azure App Service** (Recommended for .NET)
     - Automatic scaling
     - Built-in CI/CD
     - Integrated logging

   - **AWS Elastic Beanstalk**
     - Easy deployment
     - Load balancing
     - Health monitoring

   - **Google Cloud Run**
     - Containerized deployment
     - Automatic scaling
     - Pay-per-use pricing

2. **Containerization (Docker):**
   ```dockerfile
   FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
   WORKDIR /app
   EXPOSE 80
   EXPOSE 443

   FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
   WORKDIR /src
   COPY ["API/API.csproj", "API/"]
   RUN dotnet restore "API/API.csproj"
   COPY . .
   WORKDIR "/src/API"
   RUN dotnet build "API.csproj" -c Release -o /app/build

   FROM build AS publish
   RUN dotnet publish "API.csproj" -c Release -o /app/publish

   FROM base AS final
   WORKDIR /app
   COPY --from=publish /app/publish .
   ENTRYPOINT ["dotnet", "API.dll"]
   ```

3. **Database Hosting:**
   - **Azure Database for PostgreSQL**
   - **AWS RDS for PostgreSQL**
   - **Google Cloud SQL**
   - Managed PostgreSQL providers (Heroku, DigitalOcean)

### CI/CD Pipeline

**GitHub Actions Example:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd client && npm ci
      - name: Build
        run: cd client && npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup .NET
        uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '8.0.x'
      - name: Restore dependencies
        run: dotnet restore API/API.csproj
      - name: Build
        run: dotnet build API/API.csproj --configuration Release
      - name: Publish
        run: dotnet publish API/API.csproj --configuration Release --output ./publish
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'your-app-name'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: ./publish
```

### Infrastructure Requirements

**Minimum Server Requirements:**
- CPU: 2 cores
- RAM: 4 GB
- Storage: 20 GB SSD
- Network: 100 Mbps

**Recommended Production Setup:**
- CPU: 4+ cores
- RAM: 8+ GB
- Storage: 50+ GB SSD
- Load balancer for high availability
- CDN for static assets (Cloudinary for images)
- Database replication for redundancy

### Monitoring and Logging

**Application Monitoring:**
- Application Insights (Azure)
- AWS CloudWatch
- Google Cloud Logging
- Sentry for error tracking

**Logging:**
- Structured logging with ILogger
- Log levels: Debug, Information, Warning, Error, Critical
- Log aggregation (ELK stack, Splunk, Datadog)

**Health Checks:**
- Database connectivity check
- External service health (Stripe, Cloudinary)
- API endpoint health checks
- SignalR connection health

### Backup and Disaster Recovery

**Database Backups:**
- Automated daily backups
- Point-in-time recovery
- Backup retention policy (30 days)
- Backup testing and restoration procedures

**Application Backups:**
- Source code in Git repository
- Configuration in secure storage
- Cloudinary image backup
- Regular disaster recovery drills

### Performance Optimization

**Frontend Optimization:**
- Code splitting and lazy loading
- Image optimization (Cloudinary)
- CDN usage
- Browser caching headers
- Gzip/Brotli compression

**Backend Optimization:**
- Database query optimization
- Response caching
- Connection pooling
- Async/await for I/O operations
- Load balancing
- Horizontal scaling

---

## Application Operation

### User Journey - Customer Purchase Flow

1. **Landing & Discovery**
   - User visits homepage
   - Views featured categories and hero section
   - Navigates to product catalog

2. **Product Search & Selection**
   - Browses products by category
   - Uses search and filters
   - Views product details
   - Selects product variant (size, color)
   - Adds product to cart

3. **Cart Management**
   - Reviews cart items
   - Updates quantities
   - Checks delivery fee and total
   - Proceeds to checkout

4. **Checkout Process**
   - Step 1: Enters shipping address
   - Step 2: Reviews order items and totals
   - Step 3: Enters payment details (Stripe)
   - Confirms order

5. **Order Confirmation**
   - Receives order number
   - Email confirmation sent
   - Digital products: Redirected to download page
   - Physical products: Redirected to order tracking

6. **Post-Purchase**
   - Tracks order status in real-time (SignalR notifications)
   - Downloads digital products (if applicable)
   - Leaves review (future feature)

### Admin Journey - Order Management Flow

1. **Dashboard Overview**
   - Views key metrics (orders, revenue, users)
   - Checks low stock alerts
   - Sees recent activity

2. **Order Management**
   - Receives real-time notification of new order (SignalR)
   - Views order details
   - Checks customer information
   - Reviews order items

3. **Order Processing**
   - Updates order status to "Processing"
   - Prepares items for shipment
   - Updates inventory

4. **Shipping**
   - Updates status to "Shipped"
   - Enters tracking number
   - Customer receives real-time notification (SignalR)
   - Email notification sent to customer

5. **Delivery**
   - Updates status to "Delivered"
   - Digital products: System creates download links
   - Customer receives completion notification

6. **Analytics & Reporting**
   - Views sales analytics
   - Analyzes product performance
   - Reviews customer metrics
   - Exports data for further analysis

---

## Conclusion

This e-commerce application represents a modern, full-stack implementation using industry-standard technologies and architectural patterns. The system is designed with scalability, maintainability, and security as core principles.

**Key Architectural Strengths:**
- Clean separation of concerns (frontend/backend)
- Feature-based organization for maintainability
- Comprehensive state management with Redux
- Real-time capabilities with SignalR
- Secure payment processing with Stripe
- Role-based access control
- Responsive and accessible design
- Digital and physical product support

**Technology Highlights:**
- React 19 with TypeScript for type-safe frontend
- ASP.NET Core 8 with Entity Framework Core
- PostgreSQL for production reliability
- JWT-based authentication
- RESTful API design
- WebSocket real-time communication

**Production-Ready Features:**
- Comprehensive error handling
- Logging and monitoring integration
- Security best practices
- Performance optimizations
- Responsive design
- Accessibility considerations
- Automated testing ready

This application serves as a solid foundation for an e-commerce platform and can be extended with additional features such as product reviews, advanced analytics, multi-language support, and enhanced recommendation systems.

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-15
**Author:** System Architecture Documentation
