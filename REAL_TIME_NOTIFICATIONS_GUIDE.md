# Real-Time Notifications Implementation Guide

## 🎯 **Goal**
Implement real-time notifications using SignalR to provide instant updates for order status changes, new orders, and admin alerts.

## 🔧 **Technical Requirements**

### **Backend (.NET API):**
1. **SignalR Hub** - Manages real-time connections
2. **Notification Service** - Sends notifications when events happen
3. **Event Triggers** - Code that detects when to send notifications

### **Frontend (React):**
1. **SignalR Client** - Connects to the backend hub
2. **Notification Context** - Manages notifications in React
3. **Toast Integration** - Shows the notifications visually

## 📋 **Implementation Steps**

### **Phase 1: Backend Setup**

#### **Step 1: Create SignalR Hub**
**File:** `API/Hubs/NotificationHub.cs`
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public async Task JoinUserGroup()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }
        }

        public async Task JoinAdminGroup()
        {
            var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
            if (userRoles != null && (userRoles.Contains("Admin") || userRoles.Contains("Manager")))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Auto-join user to their personal group
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");
            }

            // Auto-join admins to admin group
            var userRoles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value);
            if (userRoles != null && (userRoles.Contains("Admin") || userRoles.Contains("Manager")))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
            }

            await base.OnConnectedAsync();
        }
    }
}
```

#### **Step 2: Create Notification Service**
**File:** `API/Services/INotificationService.cs`
```csharp
using API.Entities;

namespace API.Services
{
    public interface INotificationService
    {
        Task SendOrderStatusUpdate(int userId, int orderId, string newStatus, string customerName);
        Task SendNewOrderAlert(Order order);
        Task SendLowStockAlert(int productId, string productName, int stockLevel);
        Task SendInventoryAlert(string message);
    }
}
```

**File:** `API/Services/NotificationService.cs`
```csharp
using API.Services;
using Microsoft.AspNetCore.SignalR;
using API.Hubs;
using API.Entities;

namespace API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendOrderStatusUpdate(int userId, int orderId, string newStatus, string customerName)
        {
            var notification = new
            {
                Type = "OrderStatusUpdate",
                OrderId = orderId,
                Status = newStatus,
                CustomerName = customerName,
                Timestamp = DateTime.UtcNow,
                Message = $"Order #{orderId} status updated to {newStatus}"
            };

            // Send to specific user
            await _hubContext.Clients.Group($"User_{userId}")
                .SendAsync("OrderStatusUpdated", notification);

            // Send to admins for tracking
            await _hubContext.Clients.Group("Admins")
                .SendAsync("OrderStatusChanged", notification);
        }

        public async Task SendNewOrderAlert(Order order)
        {
            var notification = new
            {
                Type = "NewOrder",
                OrderId = order.OrderId,
                CustomerName = order.ShippingAddress?.FirstName + " " + order.ShippingAddress?.LastName,
                Total = order.Subtotal + order.ShippingCost,
                Timestamp = DateTime.UtcNow,
                Message = $"New order #{order.OrderId} received"
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("NewOrderReceived", notification);
        }

        public async Task SendLowStockAlert(int productId, string productName, int stockLevel)
        {
            var notification = new
            {
                Type = "LowStock",
                ProductId = productId,
                ProductName = productName,
                StockLevel = stockLevel,
                Timestamp = DateTime.UtcNow,
                Message = $"Low stock alert: {productName} has only {stockLevel} items left"
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("LowStockAlert", notification);
        }

        public async Task SendInventoryAlert(string message)
        {
            var notification = new
            {
                Type = "Inventory",
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            await _hubContext.Clients.Group("Admins")
                .SendAsync("InventoryAlert", notification);
        }
    }
}
```

#### **Step 3: Configure SignalR in Program.cs**
Add to `API/Program.cs`:
```csharp
// Add SignalR service
builder.Services.AddSignalR();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Map SignalR hub
app.MapHub<NotificationHub>("/notificationHub");
```

#### **Step 4: Update CORS for SignalR**
Update CORS in `API/Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Important for SignalR
    });
});
```

### **Phase 2: Frontend Setup**

#### **Step 1: Install SignalR Client**
```bash
cd client
npm install @microsoft/signalr
```

#### **Step 2: Create SignalR Service**
**File:** `client/src/services/signalrService.ts`
```typescript
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { toast } from 'react-toastify';

export class SignalRService {
    private connection: HubConnection | null = null;
    private isConnected = false;

    public async startConnection(token: string): Promise<void> {
        if (this.connection) {
            return;
        }

        this.connection = new HubConnectionBuilder()
            .withUrl('http://localhost:5089/notificationHub', {
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        try {
            await this.connection.start();
            this.isConnected = true;
            console.log('SignalR Connected');

            this.setupEventHandlers();
        } catch (error) {
            console.error('SignalR Connection Error:', error);
        }
    }

    private setupEventHandlers(): void {
        if (!this.connection) return;

        // Order status updates for customers
        this.connection.on('OrderStatusUpdated', (notification) => {
            toast.success(`🎉 ${notification.Message}`, {
                position: 'top-right',
                autoClose: 5000,
            });
        });

        // New order alerts for admins
        this.connection.on('NewOrderReceived', (notification) => {
            toast.info(`📦 New Order: ${notification.CustomerName} - $${notification.Total}`, {
                position: 'top-right',
                autoClose: 8000,
            });
        });

        // Low stock alerts for admins
        this.connection.on('LowStockAlert', (notification) => {
            toast.warning(`⚠️ ${notification.Message}`, {
                position: 'top-right',
                autoClose: 10000,
            });
        });

        // Order status changes for admin tracking
        this.connection.on('OrderStatusChanged', (notification) => {
            toast.info(`📋 Order #${notification.OrderId} → ${notification.Status}`, {
                position: 'top-right',
                autoClose: 4000,
            });
        });
    }

    public async stopConnection(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
            this.isConnected = false;
            console.log('SignalR Disconnected');
        }
    }

    public getConnectionState(): string {
        return this.connection?.state || 'Disconnected';
    }
}

export const signalRService = new SignalRService();
```

#### **Step 3: Create React Hook**
**File:** `client/src/hooks/useSignalR.ts`
```typescript
import { useEffect, useContext } from 'react';
import { signalRService } from '../services/signalrService';
import { StoreContext } from '../context/StoreContext';

export const useSignalR = () => {
    const { user } = useContext(StoreContext);

    useEffect(() => {
        if (user?.token) {
            signalRService.startConnection(user.token);
        }

        return () => {
            signalRService.stopConnection();
        };
    }, [user?.token]);

    return {
        connectionState: signalRService.getConnectionState(),
        isConnected: signalRService.getConnectionState() === 'Connected'
    };
};
```

### **Phase 3: Integration**

#### **Step 1: Update Order Service**
Modify existing order status update methods to send notifications:
```csharp
// In OrderService.cs
public async Task<Order> UpdateOrderStatusAsync(int orderId, string newStatus)
{
    var order = await _context.Orders
        .Include(o => o.ShippingAddress)
        .FirstOrDefaultAsync(o => o.OrderId == orderId);

    if (order == null)
        throw new Exception("Order not found");

    order.OrderStatus = Enum.Parse<OrderStatus>(newStatus);
    await _context.SaveChangesAsync();

    // Send real-time notification
    await _notificationService.SendOrderStatusUpdate(
        order.UserId,
        order.OrderId,
        newStatus,
        $"{order.ShippingAddress?.FirstName} {order.ShippingAddress?.LastName}"
    );

    return order;
}
```

#### **Step 2: Add to App Component**
**File:** `client/src/App.tsx`
```typescript
import { useSignalR } from './hooks/useSignalR';

function App() {
    const { isConnected } = useSignalR();

    // Rest of your app component
    return (
        <div className="App">
            {/* Your existing app content */}

            {/* Optional: Connection status indicator */}
            <div className="fixed bottom-4 right-4 z-50">
                {isConnected ? (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        🟢 Live
                    </div>
                ) : (
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        🔴 Offline
                    </div>
                )}
            </div>
        </div>
    );
}
```

## 🎯 **Expected Results**

### **For Customers:**
- Instant toast notifications when order status changes
- No need to refresh page or check email
- Real-time updates: "Order shipped", "Order delivered", etc.

### **For Admins:**
- Instant alerts for new orders
- Low stock warnings
- Live order status tracking
- Real-time dashboard updates

## 🧪 **Testing**

1. **Admin changes order status** → Customer gets instant toast
2. **New order placed** → Admin gets instant notification
3. **Stock goes low** → Admin gets warning alert
4. **Connection lost** → Automatic reconnection

## 🚀 **Future Enhancements**

1. **Push notifications** for mobile devices
2. **Email fallback** for offline users
3. **Notification history** and management
4. **Custom notification preferences**
5. **Real-time dashboard metrics**

---

*Implementation Guide - Ready for Development*
*Estimated Time: 2-3 hours for full implementation*