import { useState, useEffect } from 'react';
import { Shield, Users, AlertCircle } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { useAppSelector } from '../../../app/store/configureStore';

export default function RolePermissions() {
    const { user } = useAppSelector(state => state.account);

    return (
        <AdminLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Role Permissions</h1>
                        <p className="text-gray-600 mt-1">View role-based access control information</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Current User Info */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Users className="w-5 h-5 text-brown mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Your Current Access</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <p className="text-gray-900">{user?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    user?.roles?.includes('Admin')
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    {user?.roles?.[0] || 'Member'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Role Descriptions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Shield className="w-5 h-5 text-brown mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Role Descriptions</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Admin</h3>
                                <p className="text-red-700 mb-3">
                                    Full access to all administrative features and user management.
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm text-red-600">• Manage all products and categories</p>
                                    <p className="text-sm text-red-600">• View and manage all orders</p>
                                    <p className="text-sm text-red-600">• Access analytics and reports</p>
                                    <p className="text-sm text-red-600">• Manage user accounts and roles</p>
                                    <p className="text-sm text-red-600">• Configure system settings</p>
                                    <p className="text-sm text-red-600">• Access inventory management</p>
                                </div>
                            </div>

                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <h3 className="text-lg font-semibold text-blue-800 mb-2">Member</h3>
                                <p className="text-blue-700 mb-3">
                                    Standard customer access for shopping and account management.
                                </p>
                                <div className="space-y-1">
                                    <p className="text-sm text-blue-600">• Browse and purchase products</p>
                                    <p className="text-sm text-blue-600">• Manage shopping cart and wishlist</p>
                                    <p className="text-sm text-blue-600">• View order history</p>
                                    <p className="text-sm text-blue-600">• Update profile information</p>
                                    <p className="text-sm text-blue-600">• Manage shipping addresses</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Access Control Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <div>
                                <h3 className="text-sm font-medium text-yellow-800">Access Control Information</h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    This system uses ASP.NET Identity for role-based access control.
                                    Admin users have full access to all features, while Members have access to customer-facing features only.
                                    Role assignments can be managed through the User Management section.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}