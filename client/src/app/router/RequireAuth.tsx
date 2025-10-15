import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/configureStore";
import { toast } from "react-toastify";
import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

interface Props {
    roles?: string[];
    permissions?: string[];
    requireAllPermissions?: boolean;
}

export default function RequireAuth({roles, permissions = [], requireAllPermissions = false}: Props) {
    const {user} = useAppSelector(state => state.account);
    const location = useLocation();

    // Check role-based access and show toast in useEffect
    const hasRoleAccess = !roles || roles.some(r => user?.roles?.includes(r));

    useEffect(() => {
        // Only show toast if user exists but doesn't have required role
        if (user && roles && !hasRoleAccess) {
            toast.error('Not authorised to access this area');
        }
    }, [user, roles, hasRoleAccess]);

    if(!user) {
        return <Navigate to='login' state={{from: location}} />
    }

    // Check if user account is active
    if (user.isActive === false) {
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

    // Check role-based access
    if (roles && !hasRoleAccess) {
        return <Navigate to='/catalog' />
    }

    // Check permission-based access
    if (permissions.length > 0) {
        const userPermissions = user.permissions || [];
        const hasPermission = requireAllPermissions
            ? permissions.every(permission => userPermissions.includes(permission))
            : permissions.some(permission => userPermissions.includes(permission));

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600 mb-4">
                            You don't have the required permissions to access this page.
                        </p>
                        <p className="text-sm text-gray-500">
                            Required permissions: {permissions.join(', ')}
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

    return <Outlet />
}