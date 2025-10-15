import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/auth/AuthContext';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
    children: ReactNode;
    requirePermissions?: string[];
    requireAllPermissions?: boolean;
    fallbackComponent?: ReactNode;
    redirectTo?: string;
}

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    isActive: boolean;
}

export default function ProtectedRoute({
    children,
    requirePermissions = [],
    requireAllPermissions = false,
    fallbackComponent,
    redirectTo = '/login'
}: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    const currentUser = user as User;

    if (!currentUser.isActive) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Suspended</h2>
                    <p className="text-gray-600">
                        Your account has been suspended. Please contact an administrator for assistance.
                    </p>
                </div>
            </div>
        );
    }

    if (requirePermissions.length > 0) {
        const hasPermission = requireAllPermissions
            ? requirePermissions.every(permission => currentUser.permissions.includes(permission))
            : requirePermissions.some(permission => currentUser.permissions.includes(permission));

        if (!hasPermission) {
            if (fallbackComponent) {
                return <>{fallbackComponent}</>;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have the required permissions to access this page.
                        </p>
                        <p className="text-sm text-gray-500">
                            Required permissions: {requirePermissions.join(', ')}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}

export function usePermissions() {
    const { user } = useAuth();
    const currentUser = user as User;

    const hasPermission = (permission: string): boolean => {
        if (!currentUser?.permissions) return false;
        return currentUser.permissions.includes(permission);
    };

    const hasAnyPermission = (permissions: string[]): boolean => {
        if (!currentUser?.permissions) return false;
        return permissions.some(permission => currentUser.permissions.includes(permission));
    };

    const hasAllPermissions = (permissions: string[]): boolean => {
        if (!currentUser?.permissions) return false;
        return permissions.every(permission => currentUser.permissions.includes(permission));
    };

    const hasRole = (role: string): boolean => {
        if (!currentUser?.role) return false;
        return currentUser.role === role;
    };

    const hasAnyRole = (roles: string[]): boolean => {
        if (!currentUser?.role) return false;
        return roles.includes(currentUser.role);
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        permissions: currentUser?.permissions || [],
        role: currentUser?.role
    };
}