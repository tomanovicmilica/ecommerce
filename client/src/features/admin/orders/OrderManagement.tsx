import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Download, MoreHorizontal, Truck, CheckCircle, Clock } from 'lucide-react';
import type { Order } from '../../../app/models/order';
import Table from '../../../app/components/ui/Table';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { currencyFormat } from '../../../app/util/util';
import OrderDetails from './OrderDetails';
import AdminLayout from '../layout/AdminLayout';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';
import BulkActions, { orderBulkActions } from '../components/BulkActions';
import ExportManager, { generateCSV, generateXLSX, downloadFile } from '../components/ExportManager';
import BulkOrderStatusModal from './BulkOrderStatusModal';

interface AdminOrder extends Order {
    customerName: string;
    customerEmail: string;
}

export default function OrderManagement() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDateRange, setSelectedDateRange] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (selectedStatus) params.append('status', selectedStatus);
            if (selectedDateRange) params.append('dateRange', selectedDateRange);

            const response = await agent.Admin.getOrders(params);

            // Transform orders to include admin-specific fields
            const adminOrders: AdminOrder[] = response.map((order: any) => ({
                orderId: order.orderId,
                orderNumber: order.orderNumber || `ORD-${order.orderId}`,
                userId: order.userId,
                buyerEmail: order.buyerEmail || order.customerEmail || 'N/A',
                orderDate: order.orderDate,
                orderStatus: order.orderStatus,
                orderItems: order.items || order.orderItems || [],
                subtotal: order.subtotal,
                taxAmount: order.taxAmount || 0,
                shippingCost: order.deliveryFee || order.shippingCost || 0,
                totalAmount: order.total || order.totalAmount,
                currency: order.currency || 'USD',
                paymentIntentId: order.paymentIntentId,
                paymentStatus: order.paymentStatus || 'Pending',
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                createdAt: order.createdAt || order.orderDate,
                updatedAt: order.updatedAt || order.orderDate,
                notes: order.notes,
                trackingNumber: order.trackingNumber,
                customerName: order.customerName || 'Unknown',
                customerEmail: order.customerEmail || order.buyerEmail || 'N/A'
            }));

            setOrders(adminOrders);
        } catch (error) {
            console.error('Failed to fetch orders:', error);

            // More specific error handling
            if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as any).status;
                if (status === 404) {
                    toast.error('Orders endpoint not found. Using mock data for demo.');
                    // Set mock data for demonstration
                    setOrders([]);
                } else {
                    toast.error(`Failed to load orders (${status})`);
                }
            } else {
                toast.error('Failed to load orders');
            }
        } finally {
            setLoading(false);
        }
    };

    // Refresh orders when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchOrders();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedStatus, selectedDateRange]);

    // Remove filteredOrders since filtering is now done server-side
    const filteredOrders = orders;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const updateOrderStatus = async () => {
        // This function is called after a status update to refresh the orders list
        // The actual API call should be made by the calling component
        // We just refresh the list here to show the updated data
        await fetchOrders();
    };

    const handleSelectOrder = (orderId: number) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const handleSelectAll = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedOrders(filteredOrders.map(o => o.orderId));
        } else {
            setSelectedOrders([]);
        }
    };

    const handleBulkAction = async (actionId: string, selectedItems: number[]) => {
        try {
            switch (actionId) {
                case 'updateStatus':
                    setShowBulkStatusModal(true);
                    break;

                case 'markShipped':
                    for (const orderId of selectedItems) {
                        await agent.Admin.updateOrderStatus(orderId, 'Shipped');
                    }
                    toast.success(`${selectedItems.length} orders marked as shipped`);
                    fetchOrders(); // Refresh orders
                    break;

                case 'sendEmail':
                    // TODO: Implement bulk email functionality
                    toast.info('Bulk email functionality coming soon');
                    break;

                case 'export':
                    setShowExportModal(true);
                    break;

                case 'cancel':
                    for (const orderId of selectedItems) {
                        await agent.Admin.updateOrderStatus(orderId, 'Cancelled');
                    }
                    toast.success(`${selectedItems.length} orders cancelled`);
                    fetchOrders(); // Refresh orders
                    break;

                default:
                    toast.error('Unknown action');
                    return;
            }

            // Clear selection
            setSelectedOrders([]);
        } catch (error) {
            console.error('Bulk action failed:', error);
            toast.error('Bulk action failed');
        }
    };

    const exportOrders = () => {
        setShowExportModal(true);
    };

    const handleExport = async (exportOptions: any) => {
        try {
            // Support CSV and XLSX export (client-side)
            if (exportOptions.format !== 'csv' && exportOptions.format !== 'xlsx') {
                toast.info('Only CSV and Excel export are currently available. PDF export will be added soon.');
                return;
            }

            // Generate export data
            const ordersToExport = selectedOrders.length > 0
                ? orders.filter(order => selectedOrders.includes(order.orderId))
                : filteredOrders;

            if (ordersToExport.length === 0) {
                toast.warning('No orders to export');
                return;
            }

            const exportData = ordersToExport.map(order => ({
                'Order ID': order.orderId,
                'Customer Name': order.customerName,
                'Customer Email': order.customerEmail,
                'Order Date': new Date(order.orderDate).toLocaleDateString(),
                'Status': order.orderStatus,
                'Items Count': order.orderItems?.length || 0,
                'Subtotal': order.subtotal,
                'Shipping Cost': order.shippingCost || 0,
                'Total': order.totalAmount,
                'Shipping Address': order.shippingAddress ? `${order.shippingAddress.address1}, ${order.shippingAddress.city}` : 'N/A'
            }));

            const columns = exportOptions.columns || Object.keys(exportData[0] || {});
            const timestamp = new Date().toISOString().split('T')[0];

            if (exportOptions.format === 'csv') {
                const csvContent = generateCSV(exportData, columns);
                downloadFile(csvContent, `orders-export-${timestamp}.csv`, 'text/csv');
            } else if (exportOptions.format === 'xlsx') {
                const filename = `orders-export-${timestamp}.xlsx`;
                await generateXLSX(exportData, columns, filename);
            }

            toast.success(`${ordersToExport.length} orders exported successfully!`);
            setSelectedOrders([]); // Clear selection after export
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Export failed. Please try again.');
        }
    };

    if (loading) return <LoadingComponent />;

    if (selectedOrderId) {
        const selectedOrder = orders.find(o => o.orderId === selectedOrderId);
        if (selectedOrder) {
            return (
                <OrderDetails
                    order={selectedOrder}
                    onBack={() => setSelectedOrderId(null)}
                    onStatusUpdate={async () => {
                        await updateOrderStatus();
                        // Update the selected order with fresh data after status change
                        const updatedOrders = await agent.Admin.getOrders();
                        const updatedOrder = updatedOrders.find((o: any) => o.orderId === selectedOrderId);
                        if (updatedOrder) {
                            // OrderDetails will be re-rendered with new order data
                            setSelectedOrderId(null);
                            setTimeout(() => setSelectedOrderId(selectedOrderId), 0);
                        }
                    }}
                />
            );
        }
    }

    const headers = ["Izaberi", "Porudžbina #", "Kupac", "Datum", "Status", "Praćenje", "Ukupno", "Akcije"];

    const availableColumns = [
        { key: 'Order ID', label: 'Order ID' },
        { key: 'Customer Name', label: 'Customer Name' },
        { key: 'Customer Email', label: 'Customer Email' },
        { key: 'Order Date', label: 'Order Date' },
        { key: 'Status', label: 'Status' },
        { key: 'Items Count', label: 'Items Count' },
        { key: 'Subtotal', label: 'Subtotal' },
        { key: 'Delivery Fee', label: 'Delivery Fee' },
        { key: 'Total', label: 'Total' },
        { key: 'Shipping Address', label: 'Shipping Address' }
    ];

    const availableFilters = [
        { key: 'minAmount', label: 'Minimum Order Amount', type: 'text' as const },
        { key: 'maxAmount', label: 'Maximum Order Amount', type: 'text' as const },
        { key: 'customerName', label: 'Customer Name Contains', type: 'text' as const }
    ];

    const handleBulkStatusUpdate = async (orderIds: number[], newStatus: string) => {
        await agent.Admin.bulkUpdateOrderStatus(orderIds, newStatus);
        await fetchOrders();
        setSelectedOrders([]);
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje porudžbinama</h1>
                        <p className="text-gray-600 mt-1">{orders.length} porudžbina ukupno</p>
                    </div>
                    <button
                        onClick={exportOrders}
                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export porudžbine {selectedOrders.length > 0 && `(${selectedOrders.length})`}
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pretraži porudžbine, kupce..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-sm w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                    >
                        <option value="">Svi Statusi</option>
                        <option value="Pending">Na čekanju</option>
                        <option value="Processing">U procesu</option>
                        <option value="Shipped">Poslato</option>
                        <option value="Delivered">Dostavljeno</option>
                        <option value="Cancelled">Otkazano</option>
                    </select>

                    {/* Date Range Filter */}
                    <select
                        value={selectedDateRange}
                        onChange={(e) => setSelectedDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                    >
                        <option value="">Svi datumi</option>
                        <option value="today">Danas</option>
                        <option value="week">Ove nedelje</option>
                        <option value="month">Ovog meseca</option>
                        <option value="quarter">Ovog kvartala</option>
                    </select>

                    {/* Advanced Filters */}
                    <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        <Filter className="w-4 h-4 mr-2" />
                        Više filtera
                    </button>
                </div>
            </div>

            {/* Orders Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Porudžbine na čekanju</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.orderStatus === 'Pending').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">U procesu</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {orders.filter(o => o.orderStatus === 'Processing').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Poslato</h3>
                    <p className="text-2xl font-bold text-brown">
                        {orders.filter(o => o.orderStatus === 'Shipped').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Ukupan Revenue</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {currencyFormat(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0))}
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
                selectedItems={selectedOrders}
                totalItems={filteredOrders.length}
                onSelectAll={handleSelectAll}
                onBulkAction={handleBulkAction}
                actions={orderBulkActions}
                entityName="orders"
            />

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md">
                <Table headers={headers}>
                    {filteredOrders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedOrders.includes(order.orderId)}
                                    onChange={() => handleSelectOrder(order.orderId)}
                                    className="rounded border-gray-300 text-brown focus:ring-light-grey"
                                />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                #{order.orderId}
                            </td>
                            <td className="px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.orderDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                    <QuickStatusButtons
                                        orderId={order.orderId}
                                        currentStatus={order.orderStatus}
                                        onStatusChange={updateOrderStatus}
                                    />
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                                {order.trackingNumber ? (
                                    <span className="text-blue-600 font-mono text-xs" title={order.trackingNumber}>
                                        {order.trackingNumber}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {currencyFormat(order.totalAmount)}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setSelectedOrderId(order.orderId)}
                                        className="p-1 text-gray-400 hover:text-brown transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-brown transition-colors" title="Edit Order">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors" title="More Options">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nisu pronađene porudžbine</p>
                    </div>
                )}
            </div>

            {/* Export Modal */}
            <ExportManager
                entityType="orders"
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                onExport={handleExport}
                availableColumns={availableColumns}
                availableFilters={availableFilters}
            />
            </div>
            {/* Bulk Order Status Modal */}
            {showBulkStatusModal && (
                <BulkOrderStatusModal
                    orders={orders
                        .filter(o => selectedOrders.includes(o.orderId))
                        .map(o => ({
                            orderId: o.orderId,
                            customerName: o.customerName,
                            orderStatus: o.orderStatus
                        }))}
                    onClose={() => setShowBulkStatusModal(false)}
                    onUpdate={handleBulkStatusUpdate}
                />
            )}
        </AdminLayout>
    );
}

interface QuickStatusButtonsProps {
    orderId: number;
    currentStatus: string;
    onStatusChange: () => Promise<void>;
}

function QuickStatusButtons({ orderId, currentStatus, onStatusChange }: QuickStatusButtonsProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const getNextStatuses = (status: string): { status: string; label: string; icon: React.ReactNode; color: string }[] => {
        switch (status) {
            case 'Pending':
                return [
                    { status: 'Processing', label: 'Process', icon: <Clock className="w-3 h-3" />, color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' }
                ];
            case 'Processing':
                return [
                    { status: 'Shipped', label: 'Ship', icon: <Truck className="w-3 h-3" />, color: 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' }
                ];
            case 'Shipped':
                return [
                    { status: 'Delivered', label: 'Deliver', icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-600 hover:bg-green-200' }
                ];
            default:
                return [];
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        // Validate that Shipped status requires tracking number
        if (newStatus === 'Shipped') {
            toast.error('Please use the order details page to mark as shipped and add tracking number');
            return;
        }

        setIsUpdating(true);
        try {
            // Make the actual API call to update status
            await agent.Admin.updateOrderStatus(orderId, newStatus);
            toast.success(`Order status updated to ${newStatus}`);
            // Notify parent to refresh
            await onStatusChange();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const nextStatuses = getNextStatuses(currentStatus);

    if (nextStatuses.length === 0) return null;

    return (
        <div className="flex space-x-1">
            {nextStatuses.map((statusOption) => (
                <button
                    key={statusOption.status}
                    onClick={() => handleStatusChange(statusOption.status)}
                    disabled={isUpdating}
                    className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${statusOption.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={`Mark as ${statusOption.status}`}
                >
                    {statusOption.icon}
                    <span className="ml-1">{statusOption.label}</span>
                </button>
            ))}
        </div>
    );
}