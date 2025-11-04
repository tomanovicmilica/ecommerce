import { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Mail,
    Eye
} from 'lucide-react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';
import type { OrderStatusHistory } from '../../../app/models/order';

interface Props {
    orderId: number;
    currentStatus: string;
    onStatusUpdate: () => Promise<void>;
}

export default function OrderStatusWorkflow({ orderId, currentStatus, onStatusUpdate }: Props) {
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [sendCustomerEmail, setSendCustomerEmail] = useState(true);
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Fetch status history from API
    useEffect(() => {
        if (showStatusHistory && statusHistory.length === 0) {
            fetchStatusHistory();
        }
    }, [showStatusHistory]);

    const fetchStatusHistory = async () => {
        try {
            setLoadingHistory(true);
            const history = await agent.Admin.getOrderStatusHistory(orderId);
            setStatusHistory(history);
        } catch (error) {
            console.error('Failed to fetch status history:', error);
            toast.error('Failed to load status history');
        } finally {
            setLoadingHistory(false);
        }
    };

    const statusFlow = [
        {
            name: 'Pending',
            icon: Clock,
            color: 'gray',
            description: 'Porudžbina primljena, čeka se procesiranje',
            nextActions: ['Processing', 'Cancelled']
        },
        {
            name: 'Processing',
            icon: Package,
            color: 'yellow',
            description: 'Porudžbina se priprema za slanje',
            nextActions: ['Shipped', 'Cancelled']
        },
        {
            name: 'Shipped',
            icon: Truck,
            color: 'blue',
            description: 'Porudžbina je poslata',
            nextActions: ['Delivered', 'Cancelled'],
            requiresTracking: true
        },
        {
            name: 'Delivered',
            icon: CheckCircle,
            color: 'green',
            description: 'Porudžbina uspešno dostavljena',
            nextActions: []
        },
        {
            name: 'Cancelled',
            icon: XCircle,
            color: 'red',
            description: 'Porudžbina je otkazana',
            nextActions: []
        }
    ];

    const currentStatusIndex = statusFlow.findIndex(s => s.name === currentStatus);
    const selectedStatusData = statusFlow.find(s => s.name === selectedStatus);

    const handleStatusUpdate = async () => {
        if (selectedStatusData?.requiresTracking && !trackingNumber.trim()) {
            toast.error('Tracking number is required for shipped orders');
            return;
        }

        try {
            setIsUpdating(true);

            // Add status update with tracking number and notes
            await agent.Admin.addOrderStatusUpdate(orderId, {
                status: selectedStatus,
                notes: statusNotes,
                trackingNumber: trackingNumber || undefined,
                sendCustomerEmail
            });

            // Notify parent component to refresh its state
            await onStatusUpdate();

            if (sendCustomerEmail) {
                toast.success(`Order status updated and customer notified`);
            } else {
                toast.success('Order status updated successfully');
            }

            // Reset form
            setStatusNotes('');
            setTrackingNumber('');
            setSendCustomerEmail(true);

            // Refresh status history
            if (showStatusHistory) {
                fetchStatusHistory();
            }

        } catch (error) {
            console.error('Failed to update order status:', error);
            toast.error('Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status: string) => {
        const statusData = statusFlow.find(s => s.name === status);
        switch (statusData?.color) {
            case 'green': return 'bg-green-100 text-green-800 border-green-200';
            case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'red': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const canTransitionTo = (targetStatus: string) => {
        const currentStatusData = statusFlow.find(s => s.name === currentStatus);
        return currentStatusData?.nextActions.includes(targetStatus) || false;
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Tok statusa porudžbine</h3>
                <button
                    onClick={() => setShowStatusHistory(!showStatusHistory)}
                    className="flex items-center text-sm text-brown hover:text-dark-grey"
                >
                    <Eye className="w-4 h-4 mr-1" />
                    View History
                </button>
            </div>

            {/* Current Status */}
            <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-gray-700">Trenutni status:</span>
                    <div className={`flex items-center px-3 py-1 rounded-lg border ${getStatusColor(currentStatus)}`}>
                        {(() => {
                            const Icon = statusFlow.find(s => s.name === currentStatus)?.icon;
                            return Icon ? <Icon className="w-4 h-4 mr-2" /> : null;
                        })()}
                        <span className="font-medium">{currentStatus}</span>
                    </div>
                </div>
                <p className="text-sm text-gray-600">
                    {statusFlow.find(s => s.name === currentStatus)?.description}
                </p>
            </div>

            {/* Status Flow Visualization */}
            <div className="mb-6">
                <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                    {statusFlow.map((status, index) => {
                        const Icon = status.icon;
                        const isCompleted = index <= currentStatusIndex;
                        const isCurrent = status.name === currentStatus;
                        const isCancelled = currentStatus === 'Cancelled' && status.name !== 'Cancelled';

                        return (
                            <div key={status.name} className="flex items-center">
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                                    isCancelled
                                        ? 'bg-gray-100 border-gray-300 text-gray-400'
                                        : isCurrent
                                            ? 'bg-white border-brown text-dark-grey'
                                            : isCompleted
                                                ? 'bg-green-100 border-green-500 text-green-600'
                                                : 'bg-gray-100 border-gray-300 text-gray-400'
                                }`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                {index < statusFlow.length - 1 && (
                                    <div className={`w-8 h-0.5 transition-colors ${
                                        isCancelled
                                            ? 'bg-gray-300'
                                            : isCompleted && index < currentStatusIndex
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                    {statusFlow.map((status) => (
                        <span key={status.name} className="text-center" style={{ width: '80px' }}>
                            {status.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Status Update Form */}
            {currentStatus !== 'Delivered' && currentStatus !== 'Cancelled' && (
                <div className="border-t pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Ažuriraj status</h4>

                    {/* Status Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Novi status
                        </label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                        >
                            <option value={currentStatus}>{currentStatus} (Current)</option>
                            {statusFlow
                                .filter(status => canTransitionTo(status.name))
                                .map(status => (
                                    <option key={status.name} value={status.name}>
                                        {status.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>

                    {/* Tracking Number (for shipped status) */}
                    {selectedStatusData?.requiresTracking && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Broj za praćenje *
                            </label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                                placeholder="Enter tracking number"
                                required
                            />
                        </div>
                    )}

                    {/* Status Notes */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beleške (Opciono)
                        </label>
                        <textarea
                            value={statusNotes}
                            onChange={(e) => setStatusNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            placeholder="Dodaj beleške o promeni statusa..."
                        />
                    </div>

                    {/* Customer Email Notification */}
                    <div className="mb-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={sendCustomerEmail}
                                onChange={(e) => setSendCustomerEmail(e.target.checked)}
                                className="rounded border-gray-300 text-brown focus:ring-light-grey"
                            />
                            <span className="text-sm text-gray-700">Pošalji email sa obaveštenjem kupcu</span>
                        </label>
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating || selectedStatus === currentStatus}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
                            isUpdating || selectedStatus === currentStatus
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-brown text-white hover:bg-dark-grey'
                        }`}
                    >
                        {isUpdating ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Ažuriranje...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4 mr-2" />
                                Ažuriraj status
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Status History */}
            {showStatusHistory && (
                <div className="border-t pt-6 mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Istorija statusa</h4>
                    {loadingHistory ? (
                        <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brown mx-auto"></div>
                            <p className="text-sm text-gray-500 mt-2">Učitavanje istorije...</p>
                        </div>
                    ) : statusHistory.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-500">Nema dostupne istorije statusa</p>
                        </div>
                    ) : (
                    <div className="space-y-3">
                        {statusHistory.map((entry) => (
                            <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${getStatusColor(entry.status)}`}>
                                    {(() => {
                                        const Icon = statusFlow.find(s => s.name === entry.status)?.icon;
                                        return Icon ? <Icon className="w-4 h-4" /> : null;
                                    })()}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900">{entry.status}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    {entry.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                                    )}
                                    {entry.trackingNumber && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Praćenje: {entry.trackingNumber}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ažurirao: {entry.updatedBy}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    )}
                </div>
            )}
        </div>
    );
}