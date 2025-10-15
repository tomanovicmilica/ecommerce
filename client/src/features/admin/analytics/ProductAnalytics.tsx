import { useState, useEffect } from 'react';
import { Package, TrendingUp, TrendingDown, AlertTriangle, Star } from 'lucide-react';
import {
    LineChart,
    Line,
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
// import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface ProductPerformance {
    productId: number;
    name: string;
    category: string;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    totalViews: number;
    conversionRate: number;
    stock: number;
    trend: 'up' | 'down' | 'stable';
    percentageChange: number;
}

interface CategoryPerformance {
    category: string;
    totalProducts: number;
    totalSales: number;
    totalRevenue: number;
    averagePrice: number;
}

interface ProductTrend {
    date: string;
    views: number;
    sales: number;
    revenue: number;
}

interface ProductMetrics {
    totalProducts: number;
    activeProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
    topPerformingProducts: number;
    averageRating: number;
    totalViews: number;
    conversionRate: number;
}

export default function ProductAnalytics() {
    const [topProducts, setTopProducts] = useState<ProductPerformance[]>([]);
    const [worstProducts, setWorstProducts] = useState<ProductPerformance[]>([]);
    const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
    const [productTrends, setProductTrends] = useState<ProductTrend[]>([]);
    const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [selectedMetric, setSelectedMetric] = useState<'sales' | 'revenue' | 'views'>('revenue');

    useEffect(() => {
        fetchProductAnalytics();
    }, [dateRange, selectedMetric]);

    const fetchProductAnalytics = async () => {
        try {
            setLoading(true);

            // For now, always use mock data since backend analytics endpoints don't exist yet
            setTopProducts(generateMockTopProducts());
            setWorstProducts(generateMockWorstProducts());
            setCategoryPerformance(generateMockCategoryPerformance());
            setProductTrends(generateMockProductTrends());
            setMetrics(generateMockProductMetrics());

            // Uncomment when backend analytics endpoints are ready:
            // const [topProductsResponse, worstProductsResponse, categoryResponse, trendsResponse, metricsResponse] = await Promise.all([
            //     agent.Admin.getTopProducts(dateRange, selectedMetric),
            //     agent.Admin.getWorstProducts(dateRange, selectedMetric),
            //     agent.Admin.getCategoryPerformance(dateRange),
            //     agent.Admin.getProductTrends(dateRange),
            //     agent.Admin.getProductMetrics(dateRange)
            // ]);
            // setTopProducts(topProductsResponse || []);
            // setWorstProducts(worstProductsResponse || []);
            // setCategoryPerformance(categoryResponse || []);
            // setProductTrends(trendsResponse || []);
            // setMetrics(metricsResponse || null);
        } catch (error) {
            console.error('Failed to fetch product analytics:', error);
            toast.error('Failed to load product analytics');

            // Fallback to mock data
            setTopProducts(generateMockTopProducts());
            setWorstProducts(generateMockWorstProducts());
            setCategoryPerformance(generateMockCategoryPerformance());
            setProductTrends(generateMockProductTrends());
            setMetrics(generateMockProductMetrics());
        } finally {
            setLoading(false);
        }
    };

    const generateMockTopProducts = (): ProductPerformance[] => [
        {
            productId: 1,
            name: "Wireless Headphones",
            category: "Electronics",
            totalSales: 245,
            totalRevenue: 24500,
            averageRating: 4.8,
            totalViews: 5420,
            conversionRate: 4.5,
            stock: 120,
            trend: 'up',
            percentageChange: 15.2
        },
        {
            productId: 2,
            name: "Smart Watch",
            category: "Electronics",
            totalSales: 189,
            totalRevenue: 37800,
            averageRating: 4.6,
            totalViews: 4210,
            conversionRate: 4.2,
            stock: 85,
            trend: 'up',
            percentageChange: 8.7
        },
        {
            productId: 3,
            name: "Running Shoes",
            category: "Sports",
            totalSales: 156,
            totalRevenue: 18720,
            averageRating: 4.7,
            totalViews: 3890,
            conversionRate: 4.0,
            stock: 45,
            trend: 'stable',
            percentageChange: 2.1
        }
    ];

    const generateMockWorstProducts = (): ProductPerformance[] => [
        {
            productId: 10,
            name: "Basic Calculator",
            category: "Electronics",
            totalSales: 12,
            totalRevenue: 240,
            averageRating: 3.2,
            totalViews: 890,
            conversionRate: 1.3,
            stock: 200,
            trend: 'down',
            percentageChange: -12.5
        },
        {
            productId: 11,
            name: "Old Phone Case",
            category: "Electronics",
            totalSales: 8,
            totalRevenue: 120,
            averageRating: 3.0,
            totalViews: 560,
            conversionRate: 1.4,
            stock: 150,
            trend: 'down',
            percentageChange: -18.3
        }
    ];

    const generateMockCategoryPerformance = (): CategoryPerformance[] => [
        { category: "Electronics", totalProducts: 125, totalSales: 1240, totalRevenue: 98500, averagePrice: 79.43 },
        { category: "Clothing", totalProducts: 89, totalSales: 890, totalRevenue: 44500, averagePrice: 50.00 },
        { category: "Sports", totalProducts: 67, totalSales: 456, totalRevenue: 34200, averagePrice: 75.00 },
        { category: "Home & Garden", totalProducts: 45, totalSales: 234, totalRevenue: 23400, averagePrice: 100.00 }
    ];

    const generateMockProductTrends = (): ProductTrend[] => {
        const data: ProductTrend[] = [];
        const days = parseInt(dateRange);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                views: Math.floor(Math.random() * 1000) + 500,
                sales: Math.floor(Math.random() * 50) + 20,
                revenue: Math.floor(Math.random() * 5000) + 2000
            });
        }

        return data;
    };

    const generateMockProductMetrics = (): ProductMetrics => ({
        totalProducts: 326,
        activeProducts: 298,
        outOfStockProducts: 12,
        lowStockProducts: 28,
        topPerformingProducts: 45,
        averageRating: 4.3,
        totalViews: 125420,
        conversionRate: 3.8
    });

    const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

    if (loading) return <LoadingComponent />;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Product Analytics</h1>
                        <p className="text-gray-600 mt-1">Analyze product performance and trends</p>
                    </div>

                    <div className="flex space-x-4">
                        {/* Metric Selector */}
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as 'sales' | 'revenue' | 'views')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="revenue">By Revenue</option>
                            <option value="sales">By Sales Volume</option>
                            <option value="views">By Views</option>
                        </select>

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
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Total Products"
                        value={metrics?.totalProducts?.toLocaleString() || '0'}
                        subtitle={`${metrics?.activeProducts || 0} active`}
                        icon={<Package className="w-6 h-6" />}
                        color="blue"
                    />
                    <MetricCard
                        title="Out of Stock"
                        value={metrics?.outOfStockProducts?.toLocaleString() || '0'}
                        subtitle={`${metrics?.lowStockProducts || 0} low stock`}
                        icon={<AlertTriangle className="w-6 h-6" />}
                        color="red"
                    />
                    <MetricCard
                        title="Average Rating"
                        value={metrics?.averageRating?.toFixed(1) || '0.0'}
                        subtitle="across all products"
                        icon={<Star className="w-6 h-6" />}
                        color="yellow"
                    />
                    <MetricCard
                        title="Conversion Rate"
                        value={`${metrics?.conversionRate?.toFixed(1) || '0.0'}%`}
                        subtitle={`${metrics?.totalViews?.toLocaleString() || '0'} total views`}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="green"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Product Performance Trends */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={productTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} name="Views" />
                                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} name="Sales" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Category Performance */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryPerformance as any}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ category, totalRevenue }) => `${category} ${currencyFormat(totalRevenue as number)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalRevenue"
                                >
                                    {categoryPerformance.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Product Performance Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performing Products */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                            Top Performing Products
                        </h3>
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <ProductRow key={product.productId} product={product} rank={index + 1} />
                            ))}
                        </div>
                    </div>

                    {/* Worst Performing Products */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                            Products Needing Attention
                        </h3>
                        <div className="space-y-4">
                            {worstProducts.map((product, index) => (
                                <ProductRow key={product.productId} product={product} rank={index + 1} isWorst />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Category Performance Table */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance Overview</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categoryPerformance.map((category, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {category.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.totalProducts}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.totalSales.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {currencyFormat(category.totalRevenue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {currencyFormat(category.averagePrice)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    color: 'blue' | 'red' | 'yellow' | 'green';
}

function MetricCard({ title, value, subtitle, icon, color }: MetricCardProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-50 text-blue-600';
            case 'red':
                return 'bg-red-50 text-red-600';
            case 'yellow':
                return 'bg-yellow-50 text-yellow-600';
            case 'green':
                return 'bg-green-50 text-green-600';
            default:
                return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(color)}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface ProductRowProps {
    product: ProductPerformance;
    rank: number;
    isWorst?: boolean;
}

function ProductRow({ product, rank, isWorst = false }: ProductRowProps) {
    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isWorst ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                }`}>
                    {rank}
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                    <p className="text-xs text-gray-500">{product.category}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{currencyFormat(product.totalRevenue)}</p>
                    <p className="text-xs text-gray-500">{product.totalSales} sales</p>
                </div>
                <div className="flex items-center space-x-1">
                    {getTrendIcon(product.trend)}
                    <span className={`text-xs font-medium ${
                        product.trend === 'up' ? 'text-green-600' :
                        product.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                        {product.percentageChange > 0 ? '+' : ''}{product.percentageChange.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
}