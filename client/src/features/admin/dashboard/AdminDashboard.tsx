import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Plus,
    Eye,
    Settings
} from "lucide-react";
import StatsCard from "./StatsCard";
// import RecentActivity from "./RecentActivity";
import LoadingComponent from "../../../app/layout/LoadingComponent";
import AdminLayout from "../layout/AdminLayout";
import agent from "../../../app/api/agent";
import { toast } from 'react-toastify';

interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
    ordersChange: number;
    revenueChange: number;
    usersChange: number;
    productsChange: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch real data from API
            const [statsResponse, lowStockResponse] = await Promise.all([
                agent.Admin.getDashboardStats(),
                agent.Admin.getLowStockProducts()
            ]);

            setStats(statsResponse);
            setLowStockProducts(lowStockResponse);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        switch (action) {
            case 'add-product':
                navigate('/admin/products', { state: { action: 'add' } });
                break;
            case 'view-orders':
                navigate('/admin/orders');
                break;
            case 'manage-users':
                navigate('/admin/users');
                break;
            case 'view-inventory':
                navigate('/admin/inventory');
                break;
            case 'view-analytics':
                navigate('/admin/analytics');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            default:
                toast.info(`${action} functionality coming soon!`);
        }
    };

    const handleLowStockClick = (product: any) => {
        navigate('/admin/inventory', {
            state: {
                highlightProduct: product.productId,
                filter: 'low-stock'
            }
        });
    };

    if (loading) return <LoadingComponent />;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-6 text-white shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="mt-2 opacity-90">Dobrodošli nazad! Evo šta se dešava sa vašom prodavnicom.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm opacity-75">Danas</div>
                            <div className="text-xl font-bold">{new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Orders"
                    value={stats?.totalOrders || 0}
                    change={stats?.ordersChange || 0}
                    icon={<ShoppingCart className="w-6 h-6" />}
                    color="primary"
                />
                <StatsCard
                    title="Revenue"
                    value={`$${stats?.totalRevenue?.toLocaleString() || 0}`}
                    change={stats?.revenueChange || 0}
                    icon={<DollarSign className="w-6 h-6" />}
                    color="secondary"
                />
                <StatsCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    change={stats?.usersChange || 0}
                    icon={<Users className="w-6 h-6" />}
                    color="accent"
                />
                <StatsCard
                    title="Products"
                    value={stats?.totalProducts || 0}
                    change={stats?.productsChange || 0}
                    icon={<Package className="w-6 h-6" />}
                    color="neutral"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Quick Action Cards */}
                <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4">Brze akcije</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => handleQuickAction('add-product')}
                            className="w-full flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Dodaj novi proizvod
                        </button>
                        <button
                            onClick={() => handleQuickAction('view-orders')}
                            className="w-full flex items-center px-4 py-2 bg-beige text-white rounded-lg hover:bg-brown transition-colors"
                        >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Vidi sve porudžbine
                        </button>
                        <button
                            onClick={() => handleQuickAction('manage-users')}
                            className="w-full flex items-center px-4 py-2 bg-light-grey text-white rounded-lg hover:bg-brown transition-colors"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Upravljaj korisnicima
                        </button>
                        <button
                            onClick={() => handleQuickAction('view-inventory')}
                            className="w-full flex items-center px-4 py-2 bg-dark-grey text-white rounded-lg hover:bg-brown transition-colors"
                        >
                            <Package className="w-4 h-4 mr-2" />
                            Status zaliha
                        </button>
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
                        Upozorenja o niskim zalihama ({lowStockProducts.length})
                    </h3>
                    <div className="space-y-2">
                        {lowStockProducts.length > 0 ? (
                            lowStockProducts.slice(0, 3).map((product, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleLowStockClick(product)}
                                    className="flex justify-between items-center py-2 border-b border-light-grey/20 cursor-pointer hover:bg-light-grey/10 rounded-lg px-2 transition-colors"
                                >
                                    <span className="text-sm text-dark-grey truncate">{product.name}</span>
                                    <span className={`text-sm font-medium ${
                                        product.stock <= 5 ? 'text-red-600' : 'text-yellow-600'
                                    }`}>
                                        {product.stock} preostalo
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-light-grey">Svi proizvodi su dobro snabdeveni</p>
                        )}
                        {lowStockProducts.length > 3 && (
                            <div className="pt-2">
                                <span className="text-xs text-light-grey">
                                    +{lowStockProducts.length - 3} još proizvoda
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6">
                    <h3 className="text-lg font-semibold text-dark-grey mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-brown" />
                        Ovaj mesec
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-light-grey">Sales Goal</span>
                            <span className="text-sm font-medium text-brown">85%</span>
                        </div>
                        <div className="w-full bg-light-grey/20 rounded-full h-2">
                            <div className="bg-brown h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-light-grey">Zadovoljstvo korisnika</span>
                            <span className="text-sm font-medium text-beige">4.8/5</span>
                        </div>
                        <div className="w-full bg-light-grey/20 rounded-full h-2">
                            <div className="bg-beige h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {/* <div className="bg-white rounded-xl shadow-sm border border-light-grey/20">
                <RecentActivity />
            </div> */}
            </div>
        </AdminLayout>
    );
}