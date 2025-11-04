import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: 'Customer' | 'Admin' | 'Manager';
    status: 'Active' | 'Suspended' | 'Inactive';
}

interface Props {
    user: User;
    onClose: () => void;
    onSave: (userId: number, userData: Partial<User>) => Promise<void>;
}

export default function EditUserModal({ user, onClose, onSave }: Props) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName.trim()) {
            toast.error('Ime je obavezno');
            return;
        }
        if (!formData.lastName.trim()) {
            toast.error('Prezime je obavezno');
            return;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            toast.error('Unesite validnu email adresu');
            return;
        }

        try {
            setIsSaving(true);
            await onSave(user.id, formData);
            toast.success('Korisnik uspešno ažuriran');
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Greška pri ažuriranju korisnika');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Izmeni korisnika</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ime <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Prezime <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Uloga
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                        >
                            <option value="Customer">Kupac</option>
                            <option value="Manager">Menadžer</option>
                            <option value="Admin">Administrator</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                        >
                            <option value="Active">Aktivan</option>
                            <option value="Suspended">Suspendovan</option>
                            <option value="Inactive">Neaktivan</option>
                        </select>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isSaving}
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Čuvanje...' : 'Sačuvaj izmene'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
