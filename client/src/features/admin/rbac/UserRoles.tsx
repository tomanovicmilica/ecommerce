import { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, Shield, Users, AlertCircle, Search, X } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import { toast } from 'react-toastify';
import agent from '../../../app/api/agent';
import type { AdminUser, Role } from "../../../app/models/user";


export default function UserRoles() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'roles' | 'users'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateRole, setShowCreateRole] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');

    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [users, searchTerm]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                agent.Admin.getUsers(),
                agent.Admin.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error: any) {
            console.error('Failed to load data:', error);
            if (error?.status === 401) {
                toast.error('You need admin privileges to access this feature. Please log in as an admin user.');
            } else if (error?.status === 403) {
                toast.error('Access denied. Admin role required.');
            } else {
                toast.error('Failed to load data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await agent.Admin.updateUserRole(userId, newRole);
            toast.success('User role updated successfully');
            await loadData(); // Reload data
        } catch (error) {
            console.error('Failed to update user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName.trim()) {
            toast.error('Role name is required');
            return;
        }

        try {
            await agent.Admin.createRole(newRoleName);
            toast.success('Role created successfully');
            setNewRoleName('');
            setShowCreateRole(false);
            await loadData();
        } catch (error) {
            console.error('Failed to create role:', error);
            toast.error('Failed to create role');
        }
    };

    const handleDeleteRole = async (roleId: number, roleName: string) => {
        if (roleName === 'Admin' || roleName === 'Member') {
            toast.error('Cannot delete system roles');
            return;
        }

        if (confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
            try {
                await agent.Admin.deleteRole(roleId);
                toast.success('Role deleted successfully');
                await loadData();
            } catch (error: any) {
                console.error('Failed to delete role:', error);
                toast.error(error?.data?.message || 'Failed to delete role');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje korisnicima i ulogama </h1>
                        <p className="text-gray-600 mt-1">Upravljajte korisničkim nalozima i njihovim dodeljenim ulogama</p>
                    </div>

                    <button
                        onClick={() => setShowCreateRole(true)}
                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Kreiraj ulogu
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'users'
                                    ? 'border-light-grey text-brown'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Users className="w-4 h-4 inline mr-2" />
                            Korisnici ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'roles'
                                    ? 'border-light-grey text-brown'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <Shield className="w-4 h-4 inline mr-2" />
                            Uloge ({roles.length})
                        </button>
                    </nav>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Pretraži korisnike..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                    />
                                </div>

                                {/* Users Table */}
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Korisnik
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Uloga
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Porudžbine
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ukupno potrošeno
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Datum kreiranja
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.firstName} {user.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                            <div className="text-xs text-gray-400">@{user.userName}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={user.roles[0] || 'Member'}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                                        >
                                                            {roles.map(role => (
                                                                <option key={role.id} value={role.name}>
                                                                    {role.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {user.orderCount}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatCurrency(user.totalSpent)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(user.joinDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                            user.isActive
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {user.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'roles' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {roles.map((role) => (
                                        <div key={role.id} className="bg-white rounded-lg shadow-md p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {role.userCount} user{role.userCount !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                                <div className="flex space-x-1">
                                                    {role.name !== 'Admin' && role.name !== 'Member' && (
                                                        <button
                                                            onClick={() => handleDeleteRole(role.id, role.name)}
                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`px-3 py-2 rounded-lg text-center text-sm font-medium ${
                                                role.name === 'Admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : role.name === 'Member'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {role.name === 'Admin' && 'System Administrator'}
                                                {role.name === 'Member' && 'Regular Member'}
                                                {role.name !== 'Admin' && role.name !== 'Member' && 'Custom Role'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Create Role Modal */}
                {showCreateRole && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Kreiraj novu ulogu</h3>
                                    <button
                                        onClick={() => {
                                            setShowCreateRole(false);
                                            setNewRoleName('');
                                        }}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Naziv uloge *
                                        </label>
                                        <input
                                            type="text"
                                            value={newRoleName}
                                            onChange={(e) => setNewRoleName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                            placeholder="Upiši naziv uloge"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowCreateRole(false);
                                            setNewRoleName('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreateRole}
                                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Kreiraj ulogu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}