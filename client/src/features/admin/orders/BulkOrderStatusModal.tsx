import { useState } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface Order {
    orderId: number;
    customerName: string;
    orderStatus: string;
}

interface Props {
    orders: Order[];
    onClose: () => void;
    onUpdate: (orderIds: number[], newStatus: string) => Promise<void>;
}

export default function BulkOrderStatusModal({ orders, onClose, onUpdate }: Props) {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const statusOptions = [
        { value: 'Pending', label: 'Na čekanju', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'Confirmed', label: 'Potvrđeno', color: 'bg-blue-100 text-blue-800' },
        { value: 'Processing', label: 'U obradi', color: 'bg-indigo-100 text-indigo-800' },
        { value: 'Shipped', label: 'Poslato', color: 'bg-purple-100 text-purple-800' },
        { value: 'Delivered', label: 'Dostavljeno', color: 'bg-green-100 text-green-800' },
        { value: 'Cancelled', label: 'Otkazano', color: 'bg-red-100 text-red-800' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStatus) {
            toast.error('Molimo izaberite novi status');
            return;
        }

        // Warning for shipped status
        if (selectedStatus === 'Shipped') {
            const confirmed = window.confirm(
                'UPOZORENJE: Označavanje kao "Poslato" bez broja za praćenje može biti problematično.\n\n' +
                'Preporučujemo da koristite detalje pojedinačne porudžbine za dodavanje broja za praćenje.\n\n' +
                'Da li ste sigurni da želite da nastavite?'
            );
            if (!confirmed) return;
        }

        try {
            setIsUpdating(true);
            const orderIds = orders.map(o => o.orderId);
            await onUpdate(orderIds, selectedStatus);
            toast.success(`Status za ${orders.length} porudžbina je uspešno ažuriran`);
            onClose();
        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Greška pri ažuriranju statusa porudžbina');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        const option = statusOptions.find(s => s.value === status);
        return option?.color || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <Package className="w-6 h-6 text-brown mr-3" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Masovna promena statusa</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {orders.length} {orders.length === 1 ? 'porudžbina' : 'porudžbina'} izabrano
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Novi status <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSelectedStatus(option.value)}
                                    className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                                        selectedStatus === option.value
                                            ? 'border-brown bg-brown-50'
                                            : 'border-gray-300 hover:border-brown-300'
                                    }`}
                                >
                                    <div className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${option.color}`}>
                                        {option.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Warning for Shipped */}
                    {selectedStatus === 'Shipped' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-semibold mb-1">Pažnja: Broj za praćenje</p>
                                <p>
                                    Označavanje porudžbina kao "Poslato" bez broja za praćenje nije preporučeno.
                                    Razmislite o korišćenju pojedinačnog pregleda porudžbine za dodavanje broja za praćenje.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Order Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pregled promena</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {orders.slice(0, 10).map((order) => (
                                <div key={order.orderId} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">#{order.orderId}</p>
                                        <p className="text-xs text-gray-500">{order.customerName}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-3">
                                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        {selectedStatus && (
                                            <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${getStatusColor(selectedStatus)}`}>
                                                {statusOptions.find(s => s.value === selectedStatus)?.label}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {orders.length > 10 && (
                                <p className="text-xs text-gray-500 text-center pt-2">
                                    i još {orders.length - 10} porudžbina...
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            ⚠️ Ova akcija će promeniti status za {orders.length} {orders.length === 1 ? 'porudžbinu' : 'porudžbina'}.
                            Ova akcija se ne može poništiti.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isUpdating}
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isUpdating || !selectedStatus}
                        >
                            {isUpdating ? 'Ažuriranje...' : 'Ažuriraj statuse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
