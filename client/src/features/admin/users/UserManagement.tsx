import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, UserX, MoreHorizontal, Mail, Shield } from 'lucide-react';
import Table from '../../../app/components/ui/Table';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import AdminLayout from '../layout/AdminLayout';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Customer' | 'Admin' | 'Manager';
    status: 'Active' | 'Suspended' | 'Inactive';
    registrationDate: string;
    lastLogin?: string;
    orderCount: number;
    totalSpent: number;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Debounce search and filter changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedRole, selectedStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (selectedRole) params.append('role', selectedRole);
            if (selectedStatus) params.append('status', selectedStatus);

            const response = await agent.Admin.getUsers(params);

            // Transform API response to match our User interface
            const transformedUsers: User[] = response.map((user: any) => ({
                id: user.id,
                email: user.email,
                firstName: user.firstName || 'Unknown',
                lastName: user.lastName || 'User',
                role: user.roles && user.roles.length > 0 ? user.roles[0] : 'Customer',
                status: 'Active', // Default status - backend might not have this field
                registrationDate: user.registrationDate || new Date().toISOString(),
                lastLogin: user.lastLogin,
                orderCount: user.orderCount || 0,
                totalSpent: user.totalSpent || 0
            }));

            setUsers(transformedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load users');

            // Fallback to empty array on error
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    // Use users directly since filtering is now done server-side
    const filteredUsers = users;

    const handleSelectUser = (userId: number) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800';
            case 'Suspended':
                return 'bg-red-100 text-red-800';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800';
            case 'Manager':
                return 'bg-blue-100 text-blue-800';
            case 'Customer':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'Admin':
            case 'Manager':
                return <Shield className="w-4 h-4 mr-1" />;
            default:
                return null;
        }
    };

    const updateUserRole = async (userId: number, newRole: string) => {
        try {
            await agent.Admin.updateUserRole(userId, newRole);
            toast.success('User role updated successfully');
            fetchUsers(); // Refresh the users list
        } catch (error) {
            console.error('Failed to update user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const sendEmail = (userId: number) => {
        // TODO: Implement email functionality
        console.log('Sending email to user:', userId);
    };

    if (loading) return <LoadingComponent />;

    const headers = [
        <input
            key="select-all"
            type="checkbox"
            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
            onChange={handleSelectAll}
            className="rounded border-gray-300"
        />,
        "Korisnik",
        "Uloga",
        "Status",
        "Porudžbine",
        "Ukupno potrošeno",
        "Prethodno ulogovan",
        "Akcije"
    ];

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Upravljanje korisnicima</h1>
                    <p className="text-gray-600 mt-1">{users.length} korisnika ukupno</p>
                </div>
                <div className="flex space-x-3">
                    <button className="inline-flex items-center px-4 py-2 bg-light-grey text-white rounded-lg hover:bg-beige transition-colors">
                        <Mail className="w-5 h-5 mr-2" />
                        Bulk Email
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors">
                        <Shield className="w-5 h-5 mr-2" />
                        Dodaj admina
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pretraži korisnike..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                    >
                        <option value="">Sve uloge</option>
                        <option value="Customer">Kupac</option>
                        <option value="Manager">Menadžer</option>
                        <option value="Admin">Admin</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                    >
                        <option value="">Svi statusi</option>
                        <option value="Active">Aktivan</option>
                        <option value="Suspended">Suspendovan</option>
                        <option value="Inactive">Neaktivan</option>
                    </select>

                    {/* Bulk Actions */}
                    <div className="flex space-x-2">
                        <button
                            disabled={selectedUsers.length === 0}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Bulk Akcije
                        </button>
                    </div>
                </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ukupno korisnika</h3>
                    <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Aktivnih korisnika</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.status === 'Active').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Kupci</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {users.filter(u => u.role === 'Customer').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Admins</h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {users.filter(u => u.role === 'Admin' || u.role === 'Manager').length}
                    </p>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md">
                <Table headers={headers}>
                    {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleSelectUser(user.id)}
                                    className="rounded border-gray-300"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                    {getRoleIcon(user.role)}
                                    {user.role}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                    {user.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {user.orderCount}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                ${user.totalSpent.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <button className="p-1 text-gray-400 hover:text-browntransition-colors" title="View Details">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => sendEmail(user.id)}
                                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                        title="Send Email"
                                    >
                                        <Mail className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-brown transition-colors" title="Edit User">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Suspend User">
                                        <UserX className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title="More Options">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Korisnici nisu pronađeni</p>
                    </div>
                )}
            </div>

            {/* Selected Items Count */}
            {selectedUsers.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-brown text-white px-6 py-3 rounded-lg shadow-lg">
                    {selectedUsers.length} korisnik(a) izabrano
                    <button className="ml-4 underline hover:no-underline">
                        Bulk akcije
                    </button>
                </div>
            )}
            </div>
        </AdminLayout>
    );
}