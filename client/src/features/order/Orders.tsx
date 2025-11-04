import { useEffect, useState } from "react";
import { Eye, AlertCircle } from "lucide-react";
import type { Order } from "../../app/models/order";
import agent from "../../app/api/agent";
import LoadingComponent from "../../app/layout/LoadingComponent";
import OrderDetailed from "./OrderDetailed";
import Table from "../../app/components/ui/Table";
import { currencyFormat } from "../../app/util/util";
import { useOrder } from "../../app/hooks/useOrder";

export default function Orders() {
    const [orders, setOrders] = useState<Order[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOrderNumber, setSelectedOrderNumber] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const { calculateOrderTotal } = useOrder();

    // Helper function to get status styling
    function getStatusStyles(status: string) {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const orders = await agent.Orders.list();
                setOrders(orders);
            } catch (error: any) {
                // Silently handle errors - no toasts for empty orders
                console.log('Orders fetch info:', error?.status || 'No orders available');
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Fetch full order details when an order is selected
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (selectedOrderNumber > 0) {
                setLoadingDetails(true);
                try {
                    const orderDetails = await agent.Orders.fetch(selectedOrderNumber);
                    setSelectedOrder(orderDetails);
                } catch (error: any) {
                    console.error('Error fetching order details:', error);
                    // Fallback to the order from the list if fetch fails
                    const fallbackOrder = orders?.find(o => o.orderId === selectedOrderNumber);
                    setSelectedOrder(fallbackOrder || null);
                } finally {
                    setLoadingDetails(false);
                }
            } else {
                setSelectedOrder(null);
            }
        };

        fetchOrderDetails();
    }, [selectedOrderNumber, orders]);

    if (loading) return <LoadingComponent />

    if (selectedOrderNumber > 0) {
        if (loadingDetails || !selectedOrder) {
            return <LoadingComponent />
        }
        return (
            <OrderDetailed
                order={selectedOrder}
                setSelectedOrder={setSelectedOrderNumber}
            />
        )
    }

    const headers = ["Order Number", "Total", "Order Date", "Order Status", "Tracking", "Actions"];

    return (
        <div className="max-w-6xl mx-auto mt-8 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Moje porudžbine</h1>

            {orders && orders.length > 0 ? (
                <Table headers={headers}>
                    {orders.map((order) => {
                        const statusStyles = getStatusStyles(order.orderStatus);
                        const calculatedTotal = calculateOrderTotal(order.subtotal, order.shippingCost);

                        return (
                            <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                    #{order.orderId}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                    {currencyFormat(order.totalAmount || calculatedTotal)}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right">
                                    {new Date(order.orderDate).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles}`}>
                                        {order.orderStatus}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-center">
                                    {order.trackingNumber ? (
                                        <span className="text-dark-grey font-mono text-xs" title={order.trackingNumber}>
                                            {order.trackingNumber}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-sm text-right">
                                    <button
                                        onClick={() => setSelectedOrderNumber(order.orderId)}
                                        className="inline-flex items-center px-3 py-1 bg-brown text-white text-sm rounded-md hover:bg-dark-grey transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Pogledaj
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </Table>
            ) : (
                <div className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 text-lg">Nisu pronađene porudžbine</p>
                        <p className="text-gray-400 text-sm mt-2">Ovde će se pojaviti tvoje porudžbine kada završiš sa kupovinom.</p>
                    </div>
                </div>
            )}
        </div>
    )
}