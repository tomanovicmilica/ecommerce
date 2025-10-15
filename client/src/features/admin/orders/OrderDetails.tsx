import { useState } from 'react';
import { ArrowLeft, Edit, Package, Truck, CheckCircle, XCircle, Mail, MapPin } from 'lucide-react';
import type { Order } from '../../../app/models/order';
import { currencyFormat } from '../../../app/util/util';
import OrderStatusWorkflow from './OrderStatusWorkflow';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface AdminOrder extends Order {
    customerName: string;
    customerEmail: string;
}

interface Props {
    order: AdminOrder;
    onBack: () => void;
    onStatusUpdate: (orderId: number, status: string) => void;
}

export default function OrderDetails({ order, onBack, onStatusUpdate }: Props) {
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(order.orderStatus);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
    const [orderNotes, setOrderNotes] = useState('');
    const [isSavingTracking, setIsSavingTracking] = useState(false);
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    const handleStatusUpdate = () => {
        onStatusUpdate(order.orderId, selectedStatus);
        setIsEditingStatus(false);
    };

    const handleSaveTracking = async () => {
        if (!trackingNumber.trim()) {
            toast.error('Please enter a tracking number');
            return;
        }

        try {
            setIsSavingTracking(true);
            await agent.Admin.updateOrderTracking(order.orderId, trackingNumber);
            toast.success('Tracking number updated successfully');
        } catch (error) {
            console.error('Failed to update tracking number:', error);
            toast.error('Failed to update tracking number');
        } finally {
            setIsSavingTracking(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!orderNotes.trim()) {
            toast.error('Please enter notes');
            return;
        }

        try {
            setIsSavingNotes(true);
            await agent.Admin.saveOrderNotes(order.orderId, orderNotes);
            toast.success('Order notes saved successfully');
            setOrderNotes('');
        } catch (error) {
            console.error('Failed to save notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Processing':
                return <Package className="w-5 h-5 text-yellow-600" />;
            case 'Shipped':
                return <Truck className="w-5 h-5 text-blue-600" />;
            case 'Delivered':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Package className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Pending':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const statusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <button
                        onClick={onBack}
                        className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Order #{order.orderId}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Placed on {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Status Update */}
                <div className="flex items-center space-x-4">
                    {isEditingStatus ? (
                        <div className="flex items-center space-x-2">
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                {statusOptions.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <button
                                onClick={handleStatusUpdate}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setIsEditingStatus(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <div className={`flex items-center px-4 py-2 rounded-lg border ${getStatusColor(order.orderStatus)}`}>
                                {getStatusIcon(order.orderStatus)}
                                <span className="ml-2 font-medium">{order.orderStatus}</span>
                            </div>
                            <button
                                onClick={() => setIsEditingStatus(true)}
                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                                <Edit className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                        <p className="text-gray-500">Qty: {item.quantity}</p>
                                        {item.attributes && item.attributes.length > 0 && (
                                            <div className="mt-2">
                                                {item.attributes.map((attr, attrIndex) => (
                                                    <span key={attrIndex} className="inline-block bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded mr-2">
                                                        {attr.attributeName}: {attr.attributeValue}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-medium text-gray-900">
                                            {currencyFormat(item.price * item.quantity)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {currencyFormat(item.price)} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="text-gray-900">{currencyFormat(order.subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivery Fee</span>
                                    <span className="text-gray-900">{currencyFormat(order.deliveryFee)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-gray-900">{currencyFormat(order.total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Workflow */}
                    <OrderStatusWorkflow
                        orderId={order.orderId}
                        currentStatus={order.orderStatus}
                        onStatusUpdate={(newStatus) => {
                            onStatusUpdate(order.orderId, newStatus);
                        }}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900">{order.customerName}</p>
                                    <p className="text-sm text-gray-500">{order.customerEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-medium text-gray-900">
                                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress.address1}</p>
                                {order.shippingAddress.address2 && (
                                    <p className="text-gray-600">{order.shippingAddress.address2}</p>
                                )}
                                <p className="text-gray-600">
                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                                </p>
                                <p className="text-gray-600">{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Actions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email to Customer
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Print Invoice
                            </button>
                            <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Print Packing Slip
                            </button>
                        </div>
                    </div>

                    {/* Tracking Information */}
                    {(order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tracking Information</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tracking Number
                                    </label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Enter tracking number"
                                    />
                                </div>
                                <button
                                    onClick={handleSaveTracking}
                                    disabled={isSavingTracking}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSavingTracking ? 'Saving...' : 'Update Tracking'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Order Notes */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes</h2>
                        <div className="space-y-3">
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Add internal notes about this order..."
                            />
                            <button
                                onClick={handleSaveNotes}
                                disabled={isSavingNotes}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {isSavingNotes ? 'Saving...' : 'Save Notes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}