import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../layout/App";
import Catalog from "../../features/catalog/Catalog";
import AboutPage from "../../features/about/AboutPage";
import ContactPage from "../../features/contact/ContactPage";
import ProductDetails from "../../features/catalog/ProductDetails";
import BasketPage from "../../features/basket/BasketPage";
import WishlistPage from "../../features/wishlist/WishlistPage";
import Login from "../../features/account/Login";
import Register from "../../features/account/Register";
import NotFound from "../errors/NotFound";
import ServerError from "../errors/ServerError";
import AccountLayout from "../../features/account/AccountLayout";
import RequireAuth from "./RequireAuth";
import CheckoutWrapper from "../../features/checkout/CheckoutWrapper";
import Orders from "../../features/order/Orders";
import AdminDashboard from "../../features/admin/dashboard/AdminDashboard";
import ProductManagement from "../../features/admin/products/ProductManagement";
import OrderManagement from "../../features/admin/orders/OrderManagement";
import UserManagement from "../../features/admin/users/UserManagement";
import CategoryManagement from "../../features/admin/categories/CategoryManagement";
import InventoryManagement from "../../features/admin/inventory/InventoryManagement";
import SalesAnalytics from "../../features/admin/analytics/SalesAnalytics";
import ProductAnalytics from "../../features/admin/analytics/ProductAnalytics";
import CustomerAnalytics from "../../features/admin/analytics/CustomerAnalytics";
import SystemSettings from "../../features/admin/settings/SystemSettings";
import PaymentSettings from "../../features/admin/settings/PaymentSettings";
import ShippingSettings from "../../features/admin/settings/ShippingSettings";
import TaxSettings from "../../features/admin/settings/TaxSettings";
import UserRoles from "../../features/admin/rbac/UserRoles";
import RolePermissions from "../../features/admin/rbac/RolePermissions";
import AttributeManagement from "../../features/admin/attributes/AttributeManagement";
import HomePage from "../../features/home/HomePage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {index: true, element: <Navigate replace to='/home' />},
             {element: <RequireAuth />, children: [
                {path: 'checkout', element: <CheckoutWrapper />},
                {path: 'orders', element: <Orders />},  
                {path: 'profile', element: <AccountLayout />}
            ]}, 
            {element: <RequireAuth roles={['Admin']} />, children: [
                {path: 'admin', element: <AdminDashboard />},
                {path: 'admin/dashboard', element: <AdminDashboard />},
                {path: 'admin/products', element: <ProductManagement />},
                {path: 'admin/categories', element: <CategoryManagement />},
                {path: 'admin/inventory', element: <InventoryManagement />},
                {path: 'admin/orders', element: <OrderManagement />},
                {path: 'admin/users', element: <UserManagement />},
                {path: 'admin/analytics', element: <SalesAnalytics />},
                {path: 'admin/analytics/sales', element: <SalesAnalytics />},
                {path: 'admin/analytics/products', element: <ProductAnalytics />},
                {path: 'admin/analytics/customers', element: <CustomerAnalytics />},
                {path: 'admin/settings', element: <SystemSettings />},
                {path: 'admin/settings/system', element: <SystemSettings />},
                {path: 'admin/settings/payment', element: <PaymentSettings />},
                {path: 'admin/settings/shipping', element: <ShippingSettings />},
                {path: 'admin/settings/tax', element: <TaxSettings />},
                {path: 'admin/rbac', element: <UserRoles />},
                {path: 'admin/rbac/users', element: <UserRoles />},
                {path: 'admin/rbac/permissions', element: <RolePermissions />},
                {path: 'admin/attributes', element: <AttributeManagement />}
            ]},
            {path: 'catalog', element: <Catalog />},
            {path: 'catalog/:productId', element: <ProductDetails />},
            {path: 'home', element: <HomePage />},
            {path: 'about', element: <AboutPage />},
            {path: 'contact', element: <ContactPage />},
            {path: 'basket', element: <BasketPage />},
            {path: 'wishlist', element: <WishlistPage />},
            {path: 'server-error', element: <ServerError />},
            {path: 'not-found', element: <NotFound />},
            {path: 'login', element: <Login />},
            {path: 'register', element: <Register />},
            {path: '*', element: <Navigate replace to='/not-found' />}
        ]
    }])