# React TypeScript E-Commerce Frontend - Component Documentation

## Overview

This document provides a comprehensive overview of the frontend components in the e-commerce application built with React 18, TypeScript, Redux Toolkit, and Tailwind CSS.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Application](#core-application)
3. [Public Features](#public-features)
4. [User Features](#user-features)
5. [Admin Features](#admin-features)
6. [Custom Hooks](#custom-hooks)
7. [State Management](#state-management)
8. [Technology Stack](#technology-stack)

---

## Architecture Overview

### Folder Structure
```
src/
├── app/                    # Core application setup
│   ├── api/               # API agents
│   ├── components/        # Shared components
│   ├── errors/            # Error pages
│   ├── hooks/             # Custom hooks
│   ├── layout/            # Layout components
│   ├── models/            # TypeScript interfaces
│   ├── router/            # Route configuration
│   ├── store/             # Redux store
│   └── util/              # Utility functions
├── components/            # Reusable UI components
├── features/              # Feature modules
│   ├── about/
│   ├── account/
│   ├── admin/
│   ├── basket/
│   ├── catalog/
│   ├── checkout/
│   ├── contact/
│   ├── home/
│   ├── order/
│   └── wishlist/
├── hooks/                 # Additional hooks
└── services/              # External services
```

---

## Core Application

### App.tsx
**File:** [src/app/layout/App.tsx](src/app/layout/App.tsx)

Main application component with layout structure.

**Features:**
- Header/Footer layout wrapper
- Toast notification container
- SignalR real-time connection integration
- Auto-loads user authentication state on mount
- Auto-fetches basket on app startup

**State Initialization:**
- Dispatches `fetchCurrentUser()` - validates JWT token and session
- Dispatches `fetchBasketAsync()` - loads shopping cart

---

### Routes.tsx
**File:** [src/app/router/Routes.tsx](src/app/router/Routes.tsx)

Central route configuration using React Router v6.

**Route Structure:**
```
/ (App Layout)
├── /home - HomePage
├── /catalog - Product listing
├── /catalog/:productId - Product details
├── /basket - Shopping cart
├── /wishlist - User wishlist
├── /about - About page
├── /contact - Contact page
├── /login - Authentication
├── /register - User registration
│
├── Protected Routes (RequireAuth)
│   ├── /checkout - Checkout wizard
│   ├── /orders - Order history
│   └── /profile - User account
│
└── Admin Routes (RequireAuth roles=['Admin'])
    ├── /admin/dashboard - Admin overview
    ├── /admin/products - Product management
    ├── /admin/categories - Category management
    ├── /admin/inventory - Stock management
    ├── /admin/orders - Order management
    ├── /admin/users - User management
    ├── /admin/analytics/* - Analytics dashboards
    ├── /admin/settings/* - System settings
    ├── /admin/rbac/* - Role-based access control
    └── /admin/attributes - Product attributes
```

---

### Header.tsx
**File:** [src/app/layout/Header.tsx](src/app/layout/Header.tsx)

Application header with navigation and user menu.

**Features:**
- Logo and site branding
- Main navigation links (Home, Catalog, About, Contact)
- Basket icon with item count badge
- Wishlist icon with item count badge
- User authentication menu (SignedInMenu component)
- Mobile responsive hamburger menu
- Search modal integration

---

## Public Features

### HomePage
**File:** [src/features/home/HomePage.tsx](src/features/home/HomePage.tsx)

Landing page with hero section and category showcase.

**Sections:**
1. **Hero Banner**
   - Full-width background image with overlay
   - Call-to-action button to catalog
   - Gradient background effects

2. **Features Section**
   - Three-column layout with icons
   - Quality assurance, fast delivery, customer satisfaction
   - Icon animations on hover

3. **Category Slider**
   - Auto-rotating carousel (4s intervals)
   - Displays 3 categories per slide
   - Navigation arrows and dot indicators
   - Category images with overlay
   - Links to filtered catalog view

**State Management:**
- Uses `useCategory` hook for category data
- Local state for carousel current slide
- Auto-advance with useEffect timer

---

### Catalog
**File:** [src/features/catalog/Catalog.tsx](src/features/catalog/Catalog.tsx)

Product listing page with filtering and sorting.

**Features:**
- Product search bar
- Sort dropdown (by name, price ascending/descending)
- Category filter dropdown (multi-select checkboxes)
- Product type filter (Physical/Digital)
- Grid layout product cards
- Server-side pagination
- URL parameter support for deep linking (e.g., `/catalog?category=Majice`)

**Filters:**
- **Sort Options:** Name, Price (Low-High), Price (High-Low)
- **Categories:** Dynamic from backend
- **Product Types:** Physical, Digital

**State Management:**
- Redux `catalogSlice` for products and filters
- `useProducts` hook for data fetching
- URL search params for initial category selection

---

### ProductDetails
**File:** [src/features/catalog/ProductDetails.tsx](src/features/catalog/ProductDetails.tsx)

Individual product detail page.

**Features:**
- Product image gallery
- Product name, description, price
- Category and product type display
- Variant selection (size, color, etc.)
- Stock availability indicator
- Quantity selector
- Add to basket button
- Add to wishlist button
- Related/recommended products section
- Breadcrumb navigation

**State Management:**
- Fetches product by ID from Redux or API
- Uses `useVariantSelection` hook for variant logic
- Local state for selected quantity

---

## User Features

### Basket Management

#### BasketPage.tsx
**File:** [src/features/basket/BasketPage.tsx](src/features/basket/BasketPage.tsx)

Shopping cart overview page.

**Layout:**
- Left column (2/3 width): BasketTable with all items
- Right column (1/3 width): BasketSummary with totals
- Empty state with "Continue Shopping" button

---

#### BasketTable.tsx
**File:** [src/features/basket/BasketTable.tsx](src/features/basket/BasketTable.tsx)

Line items display with quantity controls.

**Features:**
- Product thumbnail image
- Product name and variant attributes
- Quantity dropdown selector (1-10 or max stock)
- Real-time stock checking per variant
- Remove item button
- Price display per item
- Line total calculation
- Handles both basket items and order items (read-only mode)

**Operations:**
- Add quantity (dispatches `addBasketItemAsync`)
- Remove quantity (dispatches `removeBasketItemAsync`)
- Fetches variant stock info from API

---

#### BasketSummary.tsx
**File:** [src/features/basket/BasketSummary.tsx](src/features/basket/BasketSummary.tsx)

Order cost summary component.

**Displays:**
- Subtotal (sum of all line totals)
- Delivery fee (0 if subtotal > 5999 RSD, else 200 RSD)
- Total amount
- Free shipping threshold message

---

### Checkout Flow

#### CheckoutPage.tsx
**File:** [src/features/checkout/CheckoutPage.tsx](src/features/checkout/CheckoutPage.tsx)

Multi-step checkout wizard with Stripe payment integration.

**Steps:**
1. **Shipping Address** - AddressForm component
2. **Review Order** - Review component with items and summary
3. **Payment** - PaymentForm component with Stripe Elements

**Features:**
- Custom stepper component showing progress
- Form validation per step (Zod schemas)
- Stripe payment intent creation
- Payment confirmation and order creation
- Auto-redirect to success page after payment
- Digital download success component for digital products
- Back button between steps
- Responsive mobile layout

**Payment Flow:**
1. User fills address form
2. Reviews order items and totals
3. Enters payment card details (Stripe Elements)
4. Submits payment
5. Creates order in backend
6. Clears basket
7. Shows success message or digital download page

**State Management:**
- `react-hook-form` with Zod validation
- Stripe hooks: `useStripe`, `useElements`
- Redux basket state
- Local state for active step, card state, order number

---

#### AddressForm.tsx
**File:** [src/features/checkout/AddressForm.tsx](src/features/checkout/AddressForm.tsx)

Shipping address collection form.

**Fields:**
- Full name (first and last name)
- Address line 1, 2, 3
- City
- ZIP/Postal code
- Country
- Save address checkbox

**Validation:** Required fields, max lengths, proper format

---

#### PaymentForm.tsx
**File:** [src/features/checkout/PaymentForm.tsx](src/features/checkout/PaymentForm.tsx)

Payment card information form using Stripe Elements.

**Elements:**
- Name on card (text input)
- Card number (Stripe CardNumberElement)
- Expiry date (Stripe CardExpiryElement)
- CVC (Stripe CardCvcElement)

**Features:**
- Real-time validation error display
- Styled Stripe elements matching app theme
- Element change handlers for validation state

---

### Order Management

#### Orders.tsx
**File:** [src/features/order/Orders.tsx](src/features/order/Orders.tsx)

User order history list.

**Columns:**
- Order number
- Total amount
- Order date
- Status badge (color-coded)
- Tracking number
- View details button

**Status Colors:**
- Delivered: Green
- Processing: Yellow
- Shipped: Blue
- Cancelled: Red
- Other: Gray

**Features:**
- Sorts orders by date (newest first)
- Empty state with helpful message
- Expandable details view (OrderDetailed component)
- Fallback total calculation if missing

---

#### OrderDetailed.tsx
**File:** [src/features/order/OrderDetailed.tsx](src/features/order/OrderDetailed.tsx)

Detailed single order view with status timeline.

**Sections:**
1. **Status Timeline**
   - Visual progress indicator with icons
   - Steps: Pending → Processing → Shipped → Delivered
   - Current status highlighted
   - Special handling for cancelled orders

2. **Order Info Banner**
   - Current status
   - Tracking number (if available)

3. **Order Items**
   - BasketTable in read-only mode

4. **Order Summary**
   - BasketSummary with totals

5. **Shipping Address**
   - Full address display

**Icons Used:**
- Package: Pending
- Clock: Processing
- Truck: Shipped
- CheckCircle: Delivered
- XCircle: Cancelled

---

### Account Management

#### Login.tsx
**File:** [src/features/account/Login.tsx](src/features/account/Login.tsx)

User authentication login form.

**Fields:**
- Email (validated)
- Password

**Features:**
- Background image with overlay
- Form validation (Zod schema)
- Error handling with toast
- Redirect to previous page or catalog after login
- Link to registration page
- Autofocus on email field

**State Management:**
- Dispatches `signInUser` thunk
- Navigates via react-router with location state

---

#### Register.tsx
**File:** [src/features/account/Register.tsx](src/features/account/Register.tsx)

New user registration form.

**Fields:**
- Username
- Email
- Password

**Password Requirements:**
- 6-20 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Features:**
- Detailed validation error display
- Password requirements info box
- API error field mapping
- Success redirect to login
- Link to login page

---

#### Profile.tsx
**File:** [src/features/account/Profile.tsx](src/features/account/Profile.tsx)

User profile editor.

**Editable Fields:**
- Name
- Last name
- Phone number

**Non-Editable:**
- Email (displayed with explanation)

**Features:**
- Pre-populated with current user data
- Cancel and save buttons
- Form validation
- Updates Redux user state on save
- Toast notifications

---

#### SecurityPage.tsx
**File:** [src/features/account/SecurityPage.tsx](src/features/account/SecurityPage.tsx)

Password change and security settings.

**Sections:**
1. **Change Password**
   - Current password
   - New password
   - Confirm password
   - Show/hide password toggles
   - Password requirements info

2. **Additional Security** (Placeholders)
   - Active sessions list
   - Two-factor authentication toggle

**Validation:**
- Password strength requirements
- Password confirmation match

---

#### AddressesPage.tsx
**File:** [src/features/account/AddressesPage.tsx](src/features/account/AddressesPage.tsx)

Manage saved shipping addresses.

**Features:**
- List all saved addresses in cards
- Default address badge
- Add new address button
- Edit address button
- Delete address button
- Set default address button
- Inline form for add/edit operations
- Country dropdown with regional options
- Empty state with call-to-action

**Address Operations:**
- Create (POST)
- Read (GET)
- Update (PUT)
- Delete (DELETE)
- Set default

---

#### DigitalDownloadsPage.tsx
**File:** [src/features/account/DigitalDownloadsPage.tsx](src/features/account/DigitalDownloadsPage.tsx)

View and download purchased digital products.

**Features:**
- List all digital downloads
- Product name and order info
- Download button with token-based security
- Expiration date display
- Download count (X of Y downloads)
- Expired status indicator
- Empty state for no downloads

**State Management:**
- Uses `useDigitalDownloads` hook
- Fetches download links from API
- Handles download token validation

---

### Wishlist

#### WishlistPage.tsx
**File:** [src/features/wishlist/WishlistPage.tsx](src/features/wishlist/WishlistPage.tsx)

User wishlist display and management.

**Features:**
- Responsive grid (1-4 columns)
- Product cards with image, name, price, category
- Remove from wishlist button per item
- Clear all wishlist button
- Link to product details
- Empty state with illustration
- Product count in header

**State Management:**
- Uses `useWishlist` custom hook
- LocalStorage persistence (per user)

---

## Admin Features

### Admin Dashboard

#### AdminDashboard.tsx
**File:** [src/features/admin/dashboard/AdminDashboard.tsx](src/features/admin/dashboard/AdminDashboard.tsx)

Admin overview with key metrics and quick actions.

**Sections:**

1. **Stats Cards**
   - Total Orders (with % change)
   - Revenue (with % change)
   - Users (with % change)
   - Products (with % change)

2. **Quick Actions**
   - Add Product button
   - View Orders button
   - Manage Users button
   - Inventory button

3. **Low Stock Alerts**
   - Products with ≤10 stock
   - Clickable to product management

4. **Performance Overview**
   - Sales goal progress bar
   - Customer satisfaction progress bar

**Features:**
- Real-time data from Admin API
- Date display in header
- Navigation to specific sections
- Responsive grid layout

---

### Product Management

#### ProductManagement.tsx
**File:** [src/features/admin/products/ProductManagement.tsx](src/features/admin/products/ProductManagement.tsx)

Admin product listing and CRUD operations.

**Table Columns:**
- Select checkbox
- Product (image + name)
- Category
- Type (Physical/Digital)
- Price
- Stock
- Status (Active/Inactive)
- Actions (View, Edit, Delete)

**Features:**
- Server-side search (debounced 500ms)
- Category filter dropdown
- Status filter (All, Active, Inactive)
- Product type filter (All, Physical, Digital)
- Bulk selection with checkbox
- Bulk actions: Activate, Deactivate, Delete, Export
- Add new product button
- Low stock highlighting (≤10)
- Export to CSV with column selection
- Status badges with colors
- Product type badges

**Product Form:**
- Create/Edit modal (ProductForm component)
- Fields: Name, Description, Price, Category, Type, Stock, Image upload
- Variant management for products with attributes

**State Management:**
- Local state for products, filters, selections
- Admin API for all CRUD operations
- Real-time updates after modifications

---

### Order Management

#### OrderManagement.tsx
**File:** [src/features/admin/orders/OrderManagement.tsx](src/features/admin/orders/OrderManagement.tsx)

Admin order listing and status management.

**Statistics Cards:**
- Pending orders count
- Processing orders count
- Shipped orders count
- Total revenue

**Table Columns:**
- Select checkbox
- Order number
- Customer email
- Order date
- Status badge
- Tracking number
- Total amount
- Actions (View, Quick status change)

**Filters:**
- Status dropdown (All, Pending, Confirmed, etc.)
- Date range picker
- Search by order number or customer email (debounced)

**Bulk Actions:**
- Update status
- Mark as shipped
- Send email notification
- Cancel orders

**Quick Actions:**
- Process button (Pending → Processing)
- Ship button (Processing → Shipped)
- Deliver button (Shipped → Delivered)

**Features:**
- Export orders to CSV
- View order details modal (OrderDetails component)
- Status workflow component integration
- Real-time order updates via SignalR

---

### Inventory Management

#### EnhancedInventoryManagement.tsx
**File:** [src/features/admin/inventory/EnhancedInventoryManagement.tsx](src/features/admin/inventory/EnhancedInventoryManagement.tsx)

Stock level management for all product variants.

**Inventory Table:**
- Product image
- Product name
- Category
- Variant attributes (size, color, etc.)
- Current stock
- Low stock indicator (≤10)
- Adjust stock button

**Features:**
- Search by product name
- Low stock filter toggle
- Stock adjustment modal with reason dropdown
- Adjustment reasons: Restock, Sale, Damaged, Correction, Return
- Real-time stock updates
- Warning for negative stock values

**State Management:**
- Fetches all products with variants
- Transforms to inventory format
- Admin API for stock adjustments

---

### User Management

#### UserManagement.tsx
**File:** [src/features/admin/users/UserManagement.tsx](src/features/admin/users/UserManagement.tsx)

Manage user accounts and permissions.

**Table Columns:**
- Select checkbox
- User ID
- Email
- Name
- Role badge
- Status badge
- Registration date
- Actions (View, Edit, Suspend)

**Filters:**
- Role dropdown (All, Customer, Admin, Manager)
- Status dropdown (All, Active, Suspended, Inactive)
- Search by email or name (debounced)

**User Metrics:**
- Total orders per user
- Total amount spent per user

**Features:**
- Bulk selection
- Status badges (Active: Green, Suspended: Red, Inactive: Gray)
- Role badges with colors
- Pagination support

---

### Analytics

#### SalesAnalytics.tsx
**File:** [src/features/admin/analytics/SalesAnalytics.tsx](src/features/admin/analytics/SalesAnalytics.tsx)

Sales data visualization dashboard.

**Metrics Cards:**
- Total revenue (with % growth)
- Total orders (with % growth)
- Total customers (with % growth)
- Average order value (with % growth)

**Charts:**

1. **Sales Trend Chart**
   - Chart types: Line, Area, Bar (toggleable)
   - X-axis: Date
   - Y-axis: Revenue
   - Responsive with tooltips

2. **Category Sales Pie Chart**
   - Shows revenue distribution by category
   - Color-coded segments
   - Legend with percentages

**Date Range Filters:**
- Last 7 days
- Last 30 days
- Last 90 days

**Library:** Recharts for all visualizations

---

#### ProductAnalytics.tsx
**File:** [src/features/admin/analytics/ProductAnalytics.tsx](src/features/admin/analytics/ProductAnalytics.tsx)

Product performance metrics.

**Sections:**
- Top selling products table
- Revenue by product chart
- Stock levels overview
- Category performance comparison

---

#### CustomerAnalytics.tsx
**File:** [src/features/admin/analytics/CustomerAnalytics.tsx](src/features/admin/analytics/CustomerAnalytics.tsx)

Customer behavior analytics.

**Sections:**
- New customers over time chart
- Customer lifetime value distribution
- Customer segmentation
- Repeat purchase rate

---

### Settings & Configuration

#### SystemSettings.tsx
**File:** [src/features/admin/settings/SystemSettings.tsx](src/features/admin/settings/SystemSettings.tsx)

General system configuration.

**Settings:**
- Site name
- Site description
- Contact email
- Maintenance mode toggle
- Max upload size

---

#### PaymentSettings.tsx
**File:** [src/features/admin/settings/PaymentSettings.tsx](src/features/admin/settings/PaymentSettings.tsx)

Payment gateway configuration.

**Settings:**
- Stripe API keys
- Payment methods enabled/disabled
- Currency settings
- Refund policy

---

#### ShippingSettings.tsx
**File:** [src/features/admin/settings/ShippingSettings.tsx](src/features/admin/settings/ShippingSettings.tsx)

Shipping method management.

**Features:**
- List all shipping methods
- Add/Edit/Delete shipping methods
- Fields: Name, Description, Cost, Estimated Days, Active status
- Free shipping threshold per method

---

#### TaxSettings.tsx
**File:** [src/features/admin/settings/TaxSettings.tsx](src/features/admin/settings/TaxSettings.tsx)

Tax rate configuration.

**Settings:**
- Tax rate percentage
- Tax-inclusive pricing toggle
- Tax exemptions

---

### Attributes Management

#### AttributeManagement.tsx
**File:** [src/features/admin/attributes/AttributeManagement.tsx](src/features/admin/attributes/AttributeManagement.tsx)

Manage product attributes (Size, Color, etc.).

**Attribute Operations:**
- List all attributes
- Add new attribute
- Edit attribute name
- Delete attribute
- Manage attribute values

**Attribute Value Operations:**
- Add values to attribute (e.g., "Red", "Blue" for Color)
- Edit value names
- Delete values
- Reorder values

**Use Case:**
- Define "Size" attribute with values: S, M, L, XL
- Define "Color" attribute with values: Red, Blue, Green
- Assign to products to create variants

---

## Custom Hooks

### useProducts
**File:** [src/app/hooks/useProducts.tsx](src/app/hooks/useProducts.tsx)

Abstracts product catalog fetching logic.

**Returns:**
- `products` - Array of products
- `productsLoaded` - Boolean loading state
- `filtersLoaded` - Boolean filter state
- `categories` - Category list
- `metaData` - Pagination metadata

**Auto-fetches:**
- Products if not loaded
- Filters/categories if not loaded

**Usage:**
```typescript
const { products, productsLoaded, categories, metaData } = useProducts();
```

---

### useWishlist
**File:** [src/app/hooks/useWishlist.tsx](src/app/hooks/useWishlist.tsx)

Wishlist operations with localStorage persistence.

**Returns:**
- `wishlistItems` - Array of products in wishlist
- `wishlistCount` - Number of items
- `addProductToWishlist(product)` - Add function
- `removeProductFromWishlist(productId)` - Remove function
- `toggleProductInWishlist(product)` - Toggle function
- `clearAllWishlist()` - Clear function
- `isInWishlist(productId)` - Check function

**Features:**
- User-specific storage (per email or guest)
- Auto-save to localStorage
- Auto-load on mount

**Usage:**
```typescript
const { wishlistItems, toggleProductInWishlist, isInWishlist } = useWishlist();
const inWishlist = isInWishlist(productId);
```

---

### useOrder
**File:** [src/app/hooks/useOrder.tsx](src/app/hooks/useOrder.tsx)

Order utility functions.

**Returns:**
- `isSubmitting` - Boolean submit state
- `error` - Error message
- `submitOrder(orderData)` - Submit function
- `calculateOrderTotal(items, deliveryFee)` - Calculation
- `validateAddress(address)` - Validation function

---

### useCategory
**File:** [src/app/hooks/useCategory.tsx](src/app/hooks/useCategory.tsx)

Category data fetching.

**Returns:**
- `categories` - Category list
- `categoriesLoaded` - Boolean state

**Auto-fetches:** Categories from Redux or API

---

### useVariantSelection
**File:** [src/app/hooks/useVariantSelection.tsx](src/app/hooks/useVariantSelection.tsx)

Product variant selection logic.

**Returns:**
- `selectedVariant` - Currently selected variant
- `selectedAttributes` - Map of attribute selections
- `selectAttribute(attributeId, valueId)` - Selection function
- `availableVariants` - Variants matching current selection
- `isValidSelection` - Boolean valid state

**Logic:**
- Tracks user's attribute selections (e.g., Size: L, Color: Red)
- Finds matching product variant
- Returns stock info for selected variant

---

### useDigitalDownloads
**File:** [src/app/hooks/useDigitalDownloads.tsx](src/app/hooks/useDigitalDownloads.tsx)

Digital download management.

**Returns:**
- `downloads` - List of digital downloads
- `isLoading` - Loading state
- `downloadFile(downloadId)` - Trigger download function

**Features:**
- Fetches user's digital downloads
- Validates download tokens
- Tracks download count and expiration

---

### useBasketItem
**File:** [src/app/hooks/useBasketItem.tsx](src/app/hooks/useBasketItem.tsx)

Basket item utility functions.

**Returns:**
- `getItemStock(productId, variantId)` - Stock checker
- `canAddMore(basketItem)` - Stock availability
- `getItemAttributes(variantId)` - Attribute info

---

### useUserHistory
**File:** [src/app/hooks/useUserHistory.tsx](src/app/hooks/useUserHistory.tsx)

User browsing history tracking.

**Returns:**
- `history` - List of viewed products
- `addToHistory(product)` - Add function
- `clearHistory()` - Clear function

---

### useProductVariants
**File:** [src/app/hooks/useProductVariants.tsx](src/app/hooks/useProductVariants.tsx)

Product variant utilities.

**Returns:**
- `getVariantByAttributes(productId, attributes)` - Find variant
- `getVariantStock(variantId)` - Stock info
- `formatVariantName(variant)` - Display name

---

## State Management

### Redux Store Configuration
**File:** [src/app/store/configureStore.ts](src/app/store/configureStore.ts)

**Combined Slices:**
- `catalog` - Product catalog
- `category` - Categories
- `basket` - Shopping cart
- `account` - User authentication
- `userHistory` - Browsing history
- `wishlist` - Wishlist

**TypeScript Hooks:**
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

### catalogSlice
**File:** [src/features/catalog/catalogSlice.ts](src/features/catalog/catalogSlice.ts)

Product catalog state with pagination and filtering.

**State Shape:**
```typescript
{
  products: EntityState<Product>,
  productsLoaded: boolean,
  filtersLoaded: boolean,
  categories: Category[],
  metaData: { currentPage, pageSize, totalCount, totalPages },
  productParams: {
    pageNumber: number,
    pageSize: number,
    orderBy: string,
    searchTerm: string,
    categories: string[],
    productTypes: string[]
  }
}
```

**Async Thunks:**
- `fetchProductsAsync` - Fetch paginated products with filters
- `fetchProductAsync` - Fetch single product by ID
- `fetchFilters` - Fetch categories and filter options

**Actions:**
- `setProductParams` - Update filter params
- `setPageNumber` - Change current page
- `setMetaData` - Update pagination metadata
- `resetProductParams` - Reset to defaults
- `setProduct` - Upsert product
- `removeProduct` - Delete product

**Entity Adapter:**
Uses Redux Toolkit's `createEntityAdapter` for normalized storage.

---

### basketSlice
**File:** [src/features/basket/basketSlice.ts](src/features/basket/basketSlice.ts)

Shopping cart state management.

**State Shape:**
```typescript
{
  basket: Basket | null,
  status: 'idle' | 'pending'
}

interface Basket {
  basketId: number,
  items: BasketItem[],
  subtotalPrice: number,
  paymentIntentId?: string,
  clientSecret?: string
}
```

**Async Thunks:**
- `fetchBasketAsync` - Fetch basket from server
- `addBasketItemAsync({ productId, quantity, attributeValueIds })` - Add item
- `removeBasketItemAsync({ productId, quantity, productVariantId })` - Remove item

**Actions:**
- `setBasket` - Direct basket update
- `clearBasket` - Empty basket

**Persistence:** Uses cookie-based session (buyerId)

---

### accountSlice
**File:** [src/features/account/accountSlice.ts](src/features/account/accountSlice.ts)

User authentication and profile state.

**State Shape:**
```typescript
{
  user: User | null
}

interface User {
  email: string,
  token: string,
  roles: string[]
}
```

**Async Thunks:**
- `signInUser({ username, password })` - Login
- `fetchCurrentUser()` - Validate session and refresh user data

**Actions:**
- `setUser` - Update user data (profile updates)
- `signOut` - Clear user and redirect

**Features:**
- JWT token parsing to extract roles
- localStorage persistence
- Auto-load user on app start
- Basket integration during login

---

### wishlistSlice
**File:** [src/features/wishlist/wishlistSlice.ts](src/features/wishlist/wishlistSlice.ts)

Wishlist state management.

**State Shape:**
```typescript
{
  items: Product[]
}
```

**Actions:**
- `addToWishlist(product)` - Add product (duplicate check)
- `removeFromWishlist(productId)` - Remove product
- `toggleWishlist(product)` - Smart add/remove
- `clearWishlist()` - Empty wishlist
- `loadWishlistFromStorage(items)` - Hydrate from localStorage

---

### categorySlice
**File:** [src/features/catalog/categorySlice.ts](src/features/catalog/categorySlice.ts)

Category state management.

**State Shape:**
```typescript
{
  categories: EntityState<Category>,
  categoriesLoaded: boolean
}
```

**Async Thunks:**
- `fetchCategoriesAsync` - Fetch all categories

**Entity Adapter:** Normalized storage

---

### userHistorySlice
**File:** [src/features/userHistory/userHistorySlice.ts](src/features/userHistory/userHistorySlice.ts)

User browsing history state.

**State Shape:**
```typescript
{
  viewedProducts: Product[],
  maxHistorySize: number
}
```

**Actions:**
- `addProductToHistory(product)` - Add viewed product (FIFO)
- `clearHistory()` - Clear all history

---

## Technology Stack

### Core Libraries
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

### State Management
- **Redux Toolkit** - Global state management
- **React Redux** - React bindings for Redux
- **Redux Thunk** - Async middleware (included in RTK)

### Routing
- **React Router v6** - Client-side routing

### Forms & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Toastify** - Toast notifications

### Data Visualization
- **Recharts** - Chart library for analytics

### Payment Processing
- **@stripe/stripe-js** - Stripe SDK
- **@stripe/react-stripe-js** - React components for Stripe

### Real-time Communication
- **@microsoft/signalr** - SignalR client for real-time updates

### HTTP Client
- **Axios** - HTTP requests

### Date Handling
- **date-fns** - Date utility library

---

## Key Design Patterns

### 1. Feature-Based Architecture
Components organized by feature/domain rather than technical role.

### 2. Custom Hooks for Logic Reuse
Business logic abstracted into custom hooks (useProducts, useWishlist, etc.).

### 3. Redux Slices for State
Each feature has its own Redux slice with actions and reducers.

### 4. Entity Adapter Pattern
Normalized state shape using Redux Toolkit's `createEntityAdapter`.

### 5. Optimistic UI Updates
Immediate UI feedback before API confirmation (e.g., basket updates).

### 6. Protected Routes
Role-based route protection using RequireAuth component.

### 7. Server-Side Filtering/Pagination
Filtering and pagination handled by backend API to support large datasets.

### 8. Component Composition
Small, reusable components composed into larger features.

### 9. TypeScript Interfaces
Strong typing for all data models and API responses.

### 10. Error Boundary Pattern
Global error handling with toast notifications.

---

## API Integration

### Agent Pattern
**File:** [src/app/api/agent.ts](src/app/api/agent.ts)

Centralized API client using Axios.

**Endpoints:**
- `Catalog` - Product operations
- `Basket` - Cart operations
- `Account` - Auth and profile
- `Orders` - Order management
- `Admin` - Admin operations
- `Category` - Category operations
- `Attributes` - Product attributes
- `Payment` - Stripe integration
- `DigitalDownloads` - Digital product downloads

**Features:**
- Request/response interceptors
- JWT token injection
- Error handling
- Response transformation

---

## Responsive Design

### Breakpoints (Tailwind)
- `sm` - 640px (mobile landscape)
- `md` - 768px (tablet)
- `lg` - 1024px (desktop)
- `xl` - 1280px (large desktop)

### Mobile-First Approach
All components designed mobile-first with responsive modifiers.

---

## Accessibility

### Features
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals
- Color contrast compliance
- Alt text for images

---

## Performance Optimizations

### Techniques Used
- Code splitting via React Router
- Lazy loading of routes
- Memoization with useMemo/useCallback
- Debounced search inputs (500ms)
- Pagination for large lists
- Image optimization and lazy loading
- Optimistic UI updates
- Entity adapter normalization (prevents duplicate data)

---

## Internationalization

### Current Language
- Serbian (Cyrillic and Latin)

### Implementation
- Hardcoded strings (ready for i18n library integration)
- Currency formatting (RSD)
- Date formatting (Serbian locale)

---

## Summary Statistics

- **Total Components:** 30+ feature components
- **Custom Hooks:** 10+
- **Redux Slices:** 6
- **Routes:** 25+
- **Admin Pages:** 15+
- **Lines of Code:** ~10,000+

---

## Future Enhancements

### Planned Features
- Server-side rendering (SSR) with Next.js
- Progressive Web App (PWA) capabilities
- Advanced search with Elasticsearch
- Product reviews and ratings
- Multi-language support (i18n)
- Advanced analytics dashboards
- Email notification system
- SMS notifications
- Social media integration
- Chat support widget
- Product comparison feature
- Advanced filtering (price range slider, multi-attribute)

---

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Lint code
npm run lint
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
VITE_SIGNALR_HUB_URL=http://localhost:5000/hub/notifications
```

---

**Last Updated:** 2025-10-09
**Version:** 1.0.0
