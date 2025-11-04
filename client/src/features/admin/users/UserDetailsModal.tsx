import { X, Mail, Calendar, ShoppingCart, DollarSign, Shield } from 'lucide-react';

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

interface Props {
    user: User;
    onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Suspended':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Inactive':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Admin':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Manager':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Customer':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {user.firstName} {user.lastName}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">User ID: {user.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status and Role */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getStatusColor(user.status)}`}>
                                <span className="font-semibold">{user.status}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Uloga
                            </label>
                            <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${getRoleColor(user.role)}`}>
                                <Shield className="w-4 h-4 mr-2" />
                                <span className="font-semibold">{user.role}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-brown" />
                            Kontakt informacije
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Email</label>
                                <p className="text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Ime i prezime</label>
                                <p className="text-gray-900">{user.firstName} {user.lastName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-brown" />
                            Aktivnost
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Datum registracije</label>
                                <p className="text-gray-900">
                                    {new Date(user.registrationDate).toLocaleDateString('sr-RS', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600">Poslednje logovanje</label>
                                <p className="text-gray-900">
                                    {user.lastLogin
                                        ? new Date(user.lastLogin).toLocaleDateString('sr-RS', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : 'Nikada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Purchase Statistics */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2 text-brown" />
                            Statistika kupovina
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Broj porudžbina</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{user.orderCount}</p>
                                    </div>
                                    <ShoppingCart className="w-8 h-8 text-brown opacity-20" />
                                </div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ukupno potrošeno</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{user.totalSpent} din</p>
                                    </div>
                                    <DollarSign className="w-8 h-8 text-green-600 opacity-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Zatvori
                    </button>
                </div>
            </div>
        </div>
    );
}
