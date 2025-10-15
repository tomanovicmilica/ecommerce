# Full-Stack E-Commerce Application

A modern, full-featured e-commerce platform built with React and ASP.NET Core, supporting both physical and digital product sales with integrated payment processing and real-time notifications.

## Features

### Customer Features
- **Product Catalog** - Browse products with search, filtering, and sorting
- **Shopping Cart** - Add products with variant selection (size, color, etc.)
- **Secure Checkout** - Multi-step checkout with Stripe payment integration
- **Order Tracking** - Real-time order status updates via SignalR
- **Digital Downloads** - Automated digital product delivery system
- **Wishlist** - Save favorite products for later
- **User Accounts** - Profile management, order history, saved addresses
- **Secure Authentication** - JWT-based authentication with role-based access

### Admin Features
- **Admin Dashboard** - Overview statistics and key metrics
- **Product Management** - CRUD operations with variant support
- **Order Management** - Process orders with status workflow
- **User Management** - User roles and permissions
- **Inventory Management** - Stock level tracking and adjustments
- **Analytics** - Sales, customer, and product performance analytics
- **Real-Time Notifications** - Live order alerts via SignalR
- **System Settings** - Payment, shipping, and tax configuration

## Technology Stack

### Frontend
- **Framework:** React 19.1.1
- **Language:** TypeScript 5.8.3
- **Build Tool:** Vite 7.1.2
- **State Management:** Redux Toolkit 2.8.2
- **Routing:** React Router DOM 7.8.0
- **UI Framework:** Tailwind CSS 4.1.11
- **Forms:** React Hook Form 7.62.0 + Zod 4.1.8
- **Charts:** Recharts 3.2.1
- **Icons:** Lucide React 0.539.0
- **Notifications:** React Toastify 11.0.5
- **HTTP Client:** Axios 1.11.0

### Backend
- **Framework:** ASP.NET Core 8.0
- **Language:** C# (.NET 8)
- **ORM:** Entity Framework Core 9.0.8
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Authentication:** ASP.NET Core Identity + JWT Bearer
- **API Documentation:** Swagger/OpenAPI (Swashbuckle)
- **Object Mapping:** AutoMapper 12.0.1

### Integration & Services
- **Payment Processing:** Stripe.NET 48.5.0
- **Real-Time Communication:** SignalR (WebSocket)
- **Cloud Storage:** Cloudinary (Image hosting)
- **Email Service:** EmailJS

## Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **.NET SDK** 8.0+
- **PostgreSQL** 14+ (for production) or SQLite (for development)
- **Git**

### Required Accounts
- **Stripe Account** (for payment processing)
- **Cloudinary Account** (for image storage)
- **EmailJS Account** (optional, for email notifications)



## Project Structure

```
ecommerce-fullstack/
├── API/                                    # Backend (ASP.NET Core)
│   ├── Controllers/                        # API Controllers
│   ├── Services/                           # Business Logic Layer
│   ├── Entities/                           # Database Models
│   ├── Data/                               # EF Core DbContext
│   ├── Dto/                                # Data Transfer Objects
│   ├── Middleware/                         # Custom Middleware
│   ├── Hubs/                               # SignalR Hubs
│   ├── Migrations/                         # EF Core Migrations
│   ├── RequestHelpers/                     # Helper Classes
│   └── Program.cs                          # Application Entry Point
│
├── client/                                 # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── app/                            # Core App Setup
│   │   │   ├── api/                        # API Client
│   │   │   ├── components/                 # Shared Components
│   │   │   ├── hooks/                      # Custom Hooks
│   │   │   ├── layout/                     # Layout Components
│   │   │   ├── models/                     # TypeScript Interfaces
│   │   │   ├── router/                     # Route Configuration
│   │   │   └── store/                      # Redux Store
│   │   ├── features/                       # Feature Modules
│   │   │   ├── catalog/                    # Product Catalog
│   │   │   ├── basket/                     # Shopping Cart
│   │   │   ├── checkout/                   # Checkout Flow
│   │   │   ├── order/                      # Order Management
│   │   │   ├── account/                    # User Account
│   │   │   ├── wishlist/                   # Wishlist
│   │   │   ├── admin/                      # Admin Panel
│   │   │   │   ├── dashboard/              # Admin Dashboard
│   │   │   │   ├── products/               # Product Management
│   │   │   │   ├── orders/                 # Order Management
│   │   │   │   ├── inventory/              # Inventory Management
│   │   │   │   ├── analytics/              # Analytics Dashboards
│   │   │   │   └── settings/               # System Settings
│   │   │   ├── home/                       # Homepage
│   │   │   ├── about/                      # About Page
│   │   │   └── contact/                    # Contact Page
│   │   └── main.tsx                        # App Entry Point
│   ├── public/                             # Static Assets
│   ├── package.json                        # Dependencies
│   └── vite.config.ts                      # Vite Configuration
│
├── .gitignore                              # Git Ignore Rules
├── Ecomm_diplomski.sln                     # Visual Studio Solution
├── APPLICATION_ARCHITECTURE_DOCUMENTATION.md # Detailed Architecture Docs
└── README.md                               # This File
```


