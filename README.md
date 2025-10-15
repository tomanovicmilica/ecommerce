# Full-Stack E-Commerce Application

A modern, full-featured e-commerce platform built with React and ASP.NET Core, supporting both physical and digital product sales with integrated payment processing and real-time notifications.

## 🚀 Features

### Customer Features
- 🛍️ **Product Catalog** - Browse products with search, filtering, and sorting
- 🛒 **Shopping Cart** - Add products with variant selection (size, color, etc.)
- 💳 **Secure Checkout** - Multi-step checkout with Stripe payment integration
- 📦 **Order Tracking** - Real-time order status updates via SignalR
- 💾 **Digital Downloads** - Automated digital product delivery system
- ❤️ **Wishlist** - Save favorite products for later
- 👤 **User Accounts** - Profile management, order history, saved addresses
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access

### Admin Features
- 📊 **Admin Dashboard** - Overview statistics and key metrics
- 📦 **Product Management** - CRUD operations with variant support
- 📋 **Order Management** - Process orders with status workflow
- 👥 **User Management** - User roles and permissions
- 📦 **Inventory Management** - Stock level tracking and adjustments
- 📈 **Analytics** - Sales, customer, and product performance analytics
- 🔔 **Real-Time Notifications** - Live order alerts via SignalR
- ⚙️ **System Settings** - Payment, shipping, and tax configuration

## 🛠️ Technology Stack

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

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ and npm
- **.NET SDK** 8.0+
- **PostgreSQL** 14+ (for production) or SQLite (for development)
- **Git**

### Required Accounts
- **Stripe Account** (for payment processing)
- **Cloudinary Account** (for image storage)
- **EmailJS Account** (optional, for email notifications)

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecommerce-fullstack.git
cd ecommerce-fullstack
```

### 2. Backend Setup

```bash
# Navigate to API directory
cd API

# Restore NuGet packages
dotnet restore

# Update database connection string in appsettings.json or use User Secrets
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=storedb;Username=youruser;Password=yourpassword"

# Set JWT Token Key
dotnet user-secrets set "JWTSettings:TokenKey" "your_super_secret_key_at_least_32_characters_long"

# Set Stripe API Keys
dotnet user-secrets set "StripeSettings:PublishableKey" "pk_test_your_key"
dotnet user-secrets set "StripeSettings:SecretKey" "sk_test_your_key"
dotnet user-secrets set "StripeSettings:WhSecret" "whsec_your_webhook_secret"

# Set Cloudinary Settings
dotnet user-secrets set "CloudinarySettings:CloudName" "your_cloud_name"
dotnet user-secrets set "CloudinarySettings:ApiKey" "your_api_key"
dotnet user-secrets set "CloudinarySettings:ApiSecret" "your_api_secret"

# Apply database migrations
dotnet ef database update

# Run the API
dotnet run
```

The API will start at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory (from project root)
cd client

# Install dependencies
npm install

# Create .env file
# Copy .env.example to .env and update values
cp .env.example .env

# Edit .env file with your values:
# VITE_API_URL=http://localhost:5000/api
# VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
# VITE_SIGNALR_HUB_URL=http://localhost:5000/notificationHub

# Start development server
npm run dev
```

The frontend will start at `http://localhost:5173`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd API
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Production Build

**Frontend:**
```bash
cd client
npm run build
# Build output will be in client/dist/
```

**Backend:**
```bash
cd API
dotnet publish -c Release -o ./publish
```

## 📁 Project Structure

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

## 🔑 Default Credentials

After running database migrations, default admin account:
- **Email:** admin@test.com
- **Password:** Pa$$w0rd

**⚠️ Important:** Change these credentials in production!

## 🧪 Testing

### Frontend Testing
```bash
cd client
npm run test
```

### Backend Testing
```bash
cd API
dotnet test
```

## 📊 Database Migrations

### Create a new migration:
```bash
cd API
dotnet ef migrations add MigrationName
```

### Apply migrations:
```bash
dotnet ef database update
```

### Rollback migration:
```bash
dotnet ef database update PreviousMigrationName
```

## 🐳 Docker Support (Optional)

### Backend Dockerfile:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

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

## 🔒 Security Considerations

- ✅ JWT-based authentication
- ✅ Password hashing with ASP.NET Core Identity
- ✅ HTTPS enforcement in production
- ✅ CORS policy configuration
- ✅ Input validation on client and server
- ✅ SQL injection prevention (EF Core parameterized queries)
- ✅ XSS prevention (React auto-escaping)
- ✅ Secure payment processing (Stripe PCI compliance)
- ✅ Environment variables for secrets
- ✅ Role-based authorization

## 🌐 Deployment

### Frontend Deployment Options
- **Vercel** (Recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**

### Backend Deployment Options
- **Azure App Service** (Recommended for .NET)
- **AWS Elastic Beanstalk**
- **Google Cloud Run**
- **Docker Container** on any cloud provider

### Database Hosting
- **Azure Database for PostgreSQL**
- **AWS RDS for PostgreSQL**
- **Google Cloud SQL**
- **Heroku Postgres**

## 📝 Environment Variables

### Backend (appsettings.json / User Secrets)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=storedb;Username=user;Password=pass"
  },
  "JWTSettings": {
    "TokenKey": "your_secret_key_here"
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

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
VITE_SIGNALR_HUB_URL=http://localhost:5000/notificationHub
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Microsoft for ASP.NET Core and Entity Framework
- Stripe for payment processing
- Cloudinary for image hosting
- The open-source community

## 📞 Support

For support, email your.email@example.com or open an issue in the GitHub repository.

## 🗺️ Roadmap

- [ ] Product reviews and ratings
- [ ] Advanced search with Elasticsearch
- [ ] Multi-language support (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Email verification on registration
- [ ] Two-factor authentication (2FA)
- [ ] Advanced analytics dashboards
- [ ] Recommendation engine
- [ ] Social media integration
- [ ] Chat support widget
- [ ] Mobile app (React Native)

## 📸 Screenshots

_Add screenshots of your application here_

---

**⭐ If you like this project, please give it a star on GitHub!**
