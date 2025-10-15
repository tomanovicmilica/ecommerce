import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import AdminLayout from '../layout/AdminLayout';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { currencyFormat } from '../../../app/util/util';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface SalesData {
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    averageOrderValue: number;
}

interface CategorySales {
    name: string;
    value: number;
    percentage: number;
}

interface SalesMetrics {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    customersGrowth: number;
    aovGrowth: number;
}

export default function SalesAnalytics() {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
    const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30'); // days
    const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area');

    useEffect(() => {
        fetchSalesAnalytics();
    }, [dateRange]);

    const fetchSalesAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch real data from analytics endpoints
            const [salesResponse, categoryResponse, metricsResponse] = await Promise.all([
                agent.Admin.getSalesData(dateRange),
                agent.Admin.getCategorySales(dateRange),
                agent.Admin.getSalesMetrics(dateRange)
            ]);

            setSalesData(salesResponse || []);
            setCategorySales(categoryResponse || []);
            setMetrics(metricsResponse || null);
        } catch (error) {
            console.error('Failed to fetch sales analytics:', error);
            toast.error('Failed to load sales analytics');

            // No fallback - show empty state
            setSalesData([]);
            setCategorySales([]);
            setMetrics(null);
        } finally {
            setLoading(false);
        }
    };


    const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

    if (loading) return <LoadingComponent />;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
                        <p className="text-gray-600 mt-1">Track your sales performance and trends</p>
                    </div>

                    <div className="flex space-x-4">
                        {/* Date Range Selector */}
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </select>

                        {/* Chart Type Selector */}
                        <select
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value as 'line' | 'area' | 'bar')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="area">Area Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="bar">Bar Chart</option>
                        </select>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Revenue"
                        value={currencyFormat(metrics?.totalRevenue || 0)}
                        change={metrics?.revenueGrowth || 0}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="green"
                    />
                    <MetricCard
                        title="Total Orders"
                        value={metrics?.totalOrders?.toLocaleString() || '0'}
                        change={metrics?.ordersGrowth || 0}
                        icon={<ShoppingCart className="w-6 h-6" />}
                        color="blue"
                    />
                    <MetricCard
                        title="Total Customers"
                        value={metrics?.totalCustomers?.toLocaleString() || '0'}
                        change={metrics?.customersGrowth || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="purple"
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={currencyFormat(metrics?.averageOrderValue || 0)}
                        change={metrics?.aovGrowth || 0}
                        icon={<Package className="w-6 h-6" />}
                        color="yellow"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Revenue Trend Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                {chartType === 'area' ? (
                                    <AreaChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                    </AreaChart>
                                ) : chartType === 'line' ? (
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                                        <Bar dataKey="revenue" fill="#6366f1" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No data available</p>
                            </div>
                        )}
                    </div>

                    {/* Orders & Customers Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders & Customers</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            {salesData.length > 0 ? (
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                                    <Line type="monotone" dataKey="customers" stroke="#f59e0b" strokeWidth={2} name="New Customers" />
                                </LineChart>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No data available</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Sales & AOV */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Sales Pie Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            {categorySales.length > 0 ? (
                                <PieChart>
                                    <Pie
                                        data={categorySales as any}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name} ${percentage}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categorySales.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                                </PieChart>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No category data available</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>

                    {/* Average Order Value Trend */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Order Value Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            {salesData.length > 0 ? (
                                <AreaChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [currencyFormat(value as number), 'AOV']} />
                                    <Area type="monotone" dataKey="averageOrderValue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                </AreaChart>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No AOV data available</p>
                                </div>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: 'green' | 'blue' | 'purple' | 'yellow';
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return 'bg-green-50 text-green-600';
            case 'blue':
                return 'bg-blue-50 text-blue-600';
            case 'purple':
                return 'bg-purple-50 text-purple-600';
            case 'yellow':
                return 'bg-yellow-50 text-yellow-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    const isPositive = change >= 0;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center">
                {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-2">vs last period</span>
            </div>
        </div>
    );
}