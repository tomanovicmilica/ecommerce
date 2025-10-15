# Backend Endpoints Needed for Admin Panel

The admin panel is currently using mock data and client-side updates. To fully integrate with the backend, implement these endpoints:

## 📋 **Orders Management**

### GET `/api/orders`
- **Purpose**: Get all orders for admin view
- **Parameters**:
  - `search` (optional): Search by order ID, customer name
  - `status` (optional): Filter by order status
  - `dateRange` (optional): Filter by date range
- **Response**: Array of Order objects with customer information

### PUT `/api/orders/{id}/status`
- **Purpose**: Update order status
- **Body**: `{ "status": "Processing|Shipped|Delivered|Cancelled" }`
- **Response**: Updated order object

## 📦 **Products Management (Admin)**

### GET `/api/products/admin`
- **Purpose**: Get all products with admin fields (already exists)
- **Parameters**:
  - `search` (optional): Search by product name
  - `category` (optional): Filter by category
  - `status` (optional): Filter by status

### PUT `/api/products/{id}/status`
- **Purpose**: Update product status
- **Body**: `{ "status": "Active|Inactive" }`
- **Response**: Updated product object

## 👥 **User Management**

### GET `/api/admin/users`
- **Purpose**: Get all users for admin management
- **Parameters**:
  - `search` (optional): Search by name, email
  - `role` (optional): Filter by role
- **Response**: Array of user objects

### PUT `/api/admin/users/{id}/role`
- **Purpose**: Update user role
- **Body**: `{ "role": "Admin|User|Manager" }`
- **Response**: Updated user object

## 📊 **Analytics & Reporting**

### GET `/api/admin/dashboard/stats`
- **Purpose**: Get dashboard statistics
- **Response**:
```json
{
  "totalOrders": 150,
  "totalRevenue": 45000,
  "totalUsers": 320,
  "totalProducts": 80,
  "ordersChange": 12.5,
  "revenueChange": 8.3,
  "usersChange": 5.1,
  "productsChange": 2.0
}
```

### GET `/api/admin/inventory/low-stock`
- **Purpose**: Get products with low stock
- **Response**: Array of products with stock levels below threshold

## 🔔 **Notifications**

### GET `/api/admin/notifications`
- **Purpose**: Get admin notifications
- **Response**: Array of notification objects

### PUT `/api/admin/notifications/{id}/read`
- **Purpose**: Mark notification as read
- **Response**: Success status

## 📥 **Export Functions**

### POST `/api/admin/export/products`
- **Purpose**: Export products data
- **Body**: Export options (format, date range, filters)
- **Response**: File download or export URL

### POST `/api/admin/export/orders`
- **Purpose**: Export orders data
- **Body**: Export options (format, date range, filters)
- **Response**: File download or export URL

## 🏷️ **Attributes Management**

### GET `/api/attributes` (already exists)
### POST `/api/attributes` (already exists)
### POST `/api/attributes/{id}/values` (already exists)

## 📈 **Advanced Analytics**

### GET `/api/admin/analytics/sales/data`
- **Parameters**: `days` (time range)
- **Response**: Sales data for charts

### GET `/api/admin/analytics/products/top`
- **Parameters**: `days`, `metric` (sales/revenue/views)
- **Response**: Top performing products

### GET `/api/admin/analytics/customers/segments`
- **Parameters**: `days`
- **Response**: Customer segmentation data

---

## 🔧 **Current Status**

✅ **Working with Mock Data**: All admin features are functional with client-side data
🔄 **Ready for Integration**: Simply uncomment API calls in components when endpoints are ready
📋 **Graceful Fallback**: Admin panel falls back to mock data when endpoints are unavailable

## 🚀 **Implementation Priority**

1. **High Priority**: Orders endpoints (most used admin feature)
2. **Medium Priority**: Dashboard stats and low stock alerts
3. **Low Priority**: Advanced analytics and export functions

When you implement these endpoints, the admin panel will automatically start using real data instead of mock data.