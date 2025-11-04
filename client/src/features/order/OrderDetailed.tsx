import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import type { Order } from "../../app/models/order";
import BasketTable from "../basket/BasketTable";
import BasketSummary from "../basket/BasketSummary";

interface Props {
    order: Order;
    setSelectedOrder: (id: number) => void;
}

export default function OrderDetailed({ order, setSelectedOrder }: Props) {
    const subtotal = order.orderItems?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) ?? order.subtotal ?? 0;

    // Define order status flow
    const statusFlow = [
        { name: 'Pending', icon: Clock, color: 'gray', description: 'Order received and being verified' },
        { name: 'Processing', icon: Package, color: 'yellow', description: 'Order is being prepared' },
        { name: 'Shipped', icon: Truck, color: 'blue', description: 'Order has been shipped' },
        { name: 'Delivered', icon: CheckCircle, color: 'green', description: 'Order delivered successfully' }
    ];

    const currentStatusIndex = statusFlow.findIndex(s => s.name === order.orderStatus);
    const isCancelled = order.orderStatus === 'Cancelled';

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Order #{order.orderId} - {order.orderStatus}
                </h1>
                <button
                    onClick={() => setSelectedOrder(0)}
                    className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to orders
                </button>
            </div>

            {/* Order Tracking Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Tracking</h2>

                {/* Current Status Banner */}
                {isCancelled ? (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                        <XCircle className="w-6 h-6 text-red-600 mr-3" />
                        <div>
                            <p className="text-red-800 font-semibold">Order Cancelled</p>
                            <p className="text-red-600 text-sm">This order has been cancelled</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                        <p className="text-indigo-800 font-semibold">Current Status: {order.orderStatus}</p>
                        <p className="text-indigo-600 text-sm">
                            {statusFlow.find(s => s.name === order.orderStatus)?.description}
                        </p>
                    </div>
                )}

                {/* Timeline */}
                {!isCancelled && (
                    <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                            {statusFlow.map((status, index) => {
                                const Icon = status.icon;
                                const isCompleted = index <= currentStatusIndex;
                                const isCurrent = status.name === order.orderStatus;

                                return (
                                    <div key={status.name} className="flex flex-col items-center flex-1">
                                        {/* Circle */}
                                        <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-100 border-indigo-500 scale-110'
                                                : isCompleted
                                                    ? 'bg-green-100 border-green-500'
                                                    : 'bg-gray-100 border-gray-300'
                                        }`}>
                                            <Icon className={`w-6 h-6 ${
                                                isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                            }`} />
                                        </div>

                                        {/* Label */}
                                        <div className="mt-3 text-center">
                                            <p className={`text-sm font-medium ${
                                                isCurrent ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                                            }`}>
                                                {status.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 max-w-[100px]">
                                                {status.description}
                                            </p>
                                        </div>

                                        {/* Connecting Line */}
                                        {index < statusFlow.length - 1 && (
                                            <div className={`absolute top-6 h-0.5 transition-all ${
                                                isCompleted && index < currentStatusIndex ? 'bg-green-500' : 'bg-gray-300'
                                            }`} style={{
                                                left: `${(index * 100 / (statusFlow.length - 1)) + (50 / (statusFlow.length - 1))}%`,
                                                width: `${100 / (statusFlow.length - 1)}%`
                                            }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Tracking Number */}
                {order.trackingNumber && (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                        <p className="text-blue-800 font-semibold mb-1">Tracking Number</p>
                        <p className="text-blue-900 font-mono text-lg">{order.trackingNumber}</p>
                        <p className="text-blue-600 text-sm mt-1">Use this number to track your shipment</p>
                    </div>
                )}
            </div>

            {/* Order Items */}
            {order.orderItems && order.orderItems.length > 0 && (
                <div className="mb-8">
                    <BasketTable items={order.orderItems} isBasket={false} />
                </div>
            )}

            {/* Order Summary */}
            <div className="flex justify-end">
                <div className="w-full md:w-1/2">
                    <BasketSummary subtotal={subtotal} />
                </div>
            </div>

            {/* Order Information */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Order Date</h3>
                        <p className="text-gray-900">{new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Order Status</h3>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                            order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {order.orderStatus}
                        </span>
                    </div>
                    {order.shippingAddress && (
                        <div className="md:col-span-2">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                            <div className="text-gray-900">
                                <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                                <p>{order.shippingAddress.addressLine1 || order.shippingAddress.address1}</p>
                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode || order.shippingAddress.zip}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}