import { useState, useEffect } from 'react';
import { ShoppingCart, Package, User, DollarSign } from 'lucide-react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface ActivityItem {
    id: number;
    type: 'order' | 'product' | 'user' | 'payment';
    message: string;
    timestamp: string;
    details?: string;
}

export default function RecentActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentActivity();
    }, []);

    const fetchRecentActivity = async () => {
        try {
            setLoading(true);

            // Fetch recent orders and users to generate activity
            const [ordersResponse, usersResponse] = await Promise.all([
                agent.Admin.getOrders(new URLSearchParams('limit=5&sortBy=date')),
                agent.Admin.getUsers(new URLSearchParams('limit=3&sortBy=created'))
            ]);

            const recentActivities: ActivityItem[] = [];

            // Add recent orders to activity
            if (ordersResponse && Array.isArray(ordersResponse)) {
                ordersResponse.slice(0, 3).forEach((order: any, index: number) => {
                    recentActivities.push({
                        id: order.orderId || index,
                        type: 'order',
                        message: `Order #${order.orderId || 'N/A'} ${order.orderStatus?.toLowerCase() || 'received'}`,
                        timestamp: formatTimestamp(order.orderDate),
                        details: `Total: $${order.total?.toFixed(2) || '0.00'} - ${order.customerName || 'Customer'}`
                    });
                });
            }

            // Add recent users to activity
            if (usersResponse && Array.isArray(usersResponse)) {
                usersResponse.slice(0, 2).forEach((user: any, index: number) => {
                    recentActivities.push({
                        id: user.id || `user-${index}`,
                        type: 'user',
                        message: 'New user registration',
                        timestamp: formatTimestamp(user.registrationDate),
                        details: `${user.firstName || ''} ${user.lastName || ''} - ${user.email || 'No email'}`
                    });
                });
            }

            // Sort by most recent first
            recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setActivities(recentActivities.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch recent activity:', error);
            // No fallback - show empty state
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const formatTimestamp = (dateString: string): string => {
        if (!dateString) return 'Unknown time';

        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins} minutes ago`;
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return date.toLocaleDateString();
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <ShoppingCart className="w-5 h-5 text-blue-600" />;
            case 'product':
                return <Package className="w-5 h-5 text-green-600" />;
            case 'user':
                return <User className="w-5 h-5 text-purple-600" />;
            case 'payment':
                return <DollarSign className="w-5 h-5 text-yellow-600" />;
            default:
                return <ShoppingCart className="w-5 h-5 text-gray-600" />;
        }
    };

    const getActivityBgColor = (type: string) => {
        switch (type) {
            case 'order':
                return 'bg-blue-100';
            case 'product':
                return 'bg-green-100';
            case 'user':
                return 'bg-purple-100';
            case 'payment':
                return 'bg-yellow-100';
            default:
                return 'bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="flex items-start space-x-3 animate-pulse">
                            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 min-w-0">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <button
                    onClick={fetchRecentActivity}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Refresh
                </button>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getActivityBgColor(activity.type)}`}>
                            {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                {activity.message}
                            </p>
                            {activity.details && (
                                <p className="text-sm text-gray-500 mt-1">
                                    {activity.details}
                                </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                                {activity.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && activities.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No recent activity</p>
                </div>
            )}
        </div>
    );
}