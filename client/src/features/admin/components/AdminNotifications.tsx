import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    X,
    AlertTriangle,
    Info,
    CheckCircle,
    Package,
    ShoppingCart,
    Users,
    Clock
} from 'lucide-react';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface Notification {
    id: number;
    type: 'info' | 'warning' | 'success' | 'error' | 'inventory' | 'order' | 'user';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
    priority: 'low' | 'medium' | 'high';
}

interface Props {
    className?: string;
}

// Simple time formatting function
const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMs = now.getTime() - time.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
};

export default function AdminNotifications({ className = '' }: Props) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        // Set up polling for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);

            // Generate notifications from dashboard data (notifications API removed)
            const generatedNotifications = await generateNotificationsFromData();
            setNotifications(generatedNotifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            // No fallback - show empty state
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const generateNotificationsFromData = async (): Promise<Notification[]> => {
        const generatedNotifications: Notification[] = [];

        try {
            // Check for low stock products
            const lowStockProducts = await agent.Admin.getLowStockProducts();
            if (lowStockProducts && lowStockProducts.length > 0) {
                generatedNotifications.push({
                    id: Date.now() + 1,
                    type: 'warning',
                    title: 'Low Stock Alert',
                    message: `${lowStockProducts.length} products are running low on stock`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    actionUrl: '/admin/inventory',
                    priority: 'high'
                });
            }

            // Check for recent orders
            const recentOrders = await agent.Admin.getOrders(new URLSearchParams('limit=5'));
            if (recentOrders && recentOrders.length > 0) {
                const pendingOrders = recentOrders.filter((order: any) => order.orderStatus === 'Pending');
                if (pendingOrders.length > 0) {
                    generatedNotifications.push({
                        id: Date.now() + 2,
                        type: 'order',
                        title: 'Pending Orders',
                        message: `${pendingOrders.length} orders require processing`,
                        timestamp: new Date().toISOString(),
                        read: false,
                        actionUrl: '/admin/orders',
                        priority: 'medium'
                    });
                }
            }

            // Check dashboard stats for growth
            const stats = await agent.Admin.getDashboardStats();
            if (stats && stats.revenueGrowth > 10) {
                generatedNotifications.push({
                    id: Date.now() + 3,
                    type: 'success',
                    title: 'Revenue Growth',
                    message: `Revenue increased by ${stats.revenueGrowth.toFixed(1)}% this month!`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    priority: 'low'
                });
            }

        } catch (error) {
            console.log('Could not generate notifications from data:', error);
        }

        return generatedNotifications;
    };


    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'inventory':
                return <Package className="w-5 h-5 text-orange-500" />;
            case 'order':
                return <ShoppingCart className="w-5 h-5 text-blue-500" />;
            case 'user':
                return <Users className="w-5 h-5 text-purple-500" />;
            default:
                return <Info className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500';
            case 'medium':
                return 'border-l-yellow-500';
            case 'low':
                return 'border-l-green-500';
            default:
                return 'border-l-gray-300';
        }
    };

    const markAsRead = async (notificationId: number) => {
        // Mark as read locally only (notification API removed)
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, read: true }))
        );
    };

    const deleteNotification = (notificationId: number) => {
        setNotifications(prev =>
            prev.filter(n => n.id !== notificationId)
        );
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }

        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Notification Bell */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Notifications
                                </h3>
                                <div className="flex items-center space-x-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="text-sm text-indigo-600 hover:text-indigo-700"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex space-x-4 mt-3">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`text-sm font-medium ${
                                        filter === 'all'
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    All ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`text-sm font-medium ${
                                        filter === 'unread'
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Unread ({unreadCount})
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {loading ? (
                                <div className="px-4 py-6 text-center text-gray-500">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                                    <p className="text-sm">Loading notifications...</p>
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="px-4 py-6 text-center text-gray-500">
                                    <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm">
                                        {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {filteredNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => handleNotificationClick(notification)}
                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 ${getPriorityColor(notification.priority)} ${
                                                !notification.read ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <p className={`text-sm font-medium ${
                                                                !notification.read ? 'text-gray-900' : 'text-gray-600'
                                                            }`}>
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                                <Clock className="w-3 h-3 mr-1" />
                                                                {formatTimeAgo(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-1 ml-2">
                                                            {!notification.read && (
                                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteNotification(notification.id);
                                                                }}
                                                                className="text-gray-400 hover:text-gray-600 p-1"
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    navigate('/admin/notifications');
                                    setIsOpen(false);
                                }}
                                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                View All Notifications
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Hook for managing notifications
export function useAdminNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false
        };

        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (notificationId: number) => {
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const deleteNotification = (notificationId: number) => {
        setNotifications(prev =>
            prev.filter(n => n.id !== notificationId)
        );
    };

    const getUnreadCount = () => {
        return notifications.filter(n => !n.read).length;
    };

    return {
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        getUnreadCount
    };
}