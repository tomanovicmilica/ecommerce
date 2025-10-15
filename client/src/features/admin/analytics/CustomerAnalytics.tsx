import { useState, useEffect } from 'react';
import { Users, UserPlus, Repeat, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import {
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
// import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface CustomerSegment {
    segment: string;
    count: number;
    percentage: number;
    averageOrderValue: number;
    totalRevenue: number;
}

interface CustomerAcquisition {
    date: string;
    newCustomers: number;
    returningCustomers: number;
    totalOrders: number;
}

interface GeographicData {
    region: string;
    customers: number;
    orders: number;
    revenue: number;
}

interface CustomerLifetimeValue {
    segment: string;
    averageLTV: number;
    averageOrders: number;
    retentionRate: number;
}

interface CustomerMetrics {
    totalCustomers: number;
    newCustomersThisMonth: number;
    returningCustomers: number;
    customerRetentionRate: number;
    averageCustomerLifetimeValue: number;
    averageOrdersPerCustomer: number;
    churnRate: number;
    customerGrowthRate: number;
}

export default function CustomerAnalytics() {
    const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
    const [acquisitionData, setAcquisitionData] = useState<CustomerAcquisition[]>([]);
    const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
    const [lifetimeValue, setLifetimeValue] = useState<CustomerLifetimeValue[]>([]);
    const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30');
    const [selectedView, setSelectedView] = useState<'acquisition' | 'behavior' | 'geographic'>('acquisition');

    useEffect(() => {
        fetchCustomerAnalytics();
    }, [dateRange]);

    const fetchCustomerAnalytics = async () => {
        try {
            setLoading(true);

            // For now, always use mock data since backend analytics endpoints don't exist yet
            setCustomerSegments(generateMockSegments());
            setAcquisitionData(generateMockAcquisition());
            setGeographicData(generateMockGeographic());
            setLifetimeValue(generateMockLTV());
            setMetrics(generateMockMetrics());

            // Uncomment when backend analytics endpoints are ready:
            // const [segmentsResponse, acquisitionResponse, geoResponse, ltvResponse, metricsResponse] = await Promise.all([
            //     agent.Admin.getCustomerSegments(dateRange),
            //     agent.Admin.getCustomerAcquisition(dateRange),
            //     agent.Admin.getGeographicData(dateRange),
            //     agent.Admin.getCustomerLifetimeValue(dateRange),
            //     agent.Admin.getCustomerMetrics(dateRange)
            // ]);
            // setCustomerSegments(segmentsResponse || []);
            // setAcquisitionData(acquisitionResponse || []);
            // setGeographicData(geoResponse || []);
            // setLifetimeValue(ltvResponse || []);
            // setMetrics(metricsResponse || null);
        } catch (error) {
            console.error('Failed to fetch customer analytics:', error);
            toast.error('Failed to load customer analytics');

            // Fallback to mock data
            setCustomerSegments(generateMockSegments());
            setAcquisitionData(generateMockAcquisition());
            setGeographicData(generateMockGeographic());
            setLifetimeValue(generateMockLTV());
            setMetrics(generateMockMetrics());
        } finally {
            setLoading(false);
        }
    };

    const generateMockSegments = (): CustomerSegment[] => [
        { segment: 'VIP Customers', count: 125, percentage: 8, averageOrderValue: 280, totalRevenue: 35000 },
        { segment: 'Regular Customers', count: 456, percentage: 35, averageOrderValue: 120, totalRevenue: 54720 },
        { segment: 'Occasional Buyers', count: 589, percentage: 45, averageOrderValue: 85, totalRevenue: 50065 },
        { segment: 'One-time Buyers', count: 156, percentage: 12, averageOrderValue: 65, totalRevenue: 10140 }
    ];

    const generateMockAcquisition = (): CustomerAcquisition[] => {
        const data: CustomerAcquisition[] = [];
        const days = parseInt(dateRange);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                newCustomers: Math.floor(Math.random() * 20) + 10,
                returningCustomers: Math.floor(Math.random() * 40) + 30,
                totalOrders: Math.floor(Math.random() * 80) + 60
            });
        }

        return data;
    };

    const generateMockGeographic = (): GeographicData[] => [
        { region: 'United States', customers: 456, orders: 1240, revenue: 124000 },
        { region: 'Canada', customers: 189, orders: 456, revenue: 45600 },
        { region: 'United Kingdom', customers: 234, orders: 567, revenue: 56700 },
        { region: 'Germany', customers: 156, orders: 389, revenue: 38900 },
        { region: 'France', customers: 123, orders: 234, revenue: 23400 }
    ];

    const generateMockLTV = (): CustomerLifetimeValue[] => [
        { segment: 'VIP Customers', averageLTV: 1250, averageOrders: 12, retentionRate: 85 },
        { segment: 'Regular Customers', averageLTV: 485, averageOrders: 5, retentionRate: 65 },
        { segment: 'Occasional Buyers', averageLTV: 210, averageOrders: 2.5, retentionRate: 35 },
        { segment: 'One-time Buyers', averageLTV: 65, averageOrders: 1, retentionRate: 5 }
    ];

    const generateMockMetrics = (): CustomerMetrics => ({
        totalCustomers: 1326,
        newCustomersThisMonth: 234,
        returningCustomers: 892,
        customerRetentionRate: 67.3,
        averageCustomerLifetimeValue: 485.50,
        averageOrdersPerCustomer: 3.8,
        churnRate: 32.7,
        customerGrowthRate: 12.5
    });

    const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

    if (loading) return <LoadingComponent />;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customer Analytics</h1>
                        <p className="text-gray-600 mt-1">Understand your customer behavior and lifetime value</p>
                    </div>

                    <div className="flex space-x-4">
                        {/* View Selector */}
                        <select
                            value={selectedView}
                            onChange={(e) => setSelectedView(e.target.value as 'acquisition' | 'behavior' | 'geographic')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="acquisition">Customer Acquisition</option>
                            <option value="behavior">Customer Behavior</option>
                            <option value="geographic">Geographic Analysis</option>
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
                        title="Total Customers"
                        value={metrics?.totalCustomers?.toLocaleString() || '0'}
                        change={metrics?.customerGrowthRate || 0}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                    />
                    <MetricCard
                        title="New Customers"
                        value={metrics?.newCustomersThisMonth?.toLocaleString() || '0'}
                        change={15.2}
                        icon={<UserPlus className="w-6 h-6" />}
                        color="green"
                    />
                    <MetricCard
                        title="Retention Rate"
                        value={`${metrics?.customerRetentionRate?.toFixed(1) || '0.0'}%`}
                        change={2.3}
                        icon={<Repeat className="w-6 h-6" />}
                        color="purple"
                    />
                    <MetricCard
                        title="Average LTV"
                        value={currencyFormat(metrics?.averageCustomerLifetimeValue || 0)}
                        change={metrics?.churnRate ? -metrics.churnRate : 0}
                        icon={<DollarSign className="w-6 h-6" />}
                        color="yellow"
                    />
                </div>

                {/* Main Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Customer Acquisition Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition Trends</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={acquisitionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="newCustomers" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="New Customers" />
                                <Area type="monotone" dataKey="returningCustomers" stackId="1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} name="Returning Customers" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Customer Segments */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={customerSegments as any}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ segment, percentage }) => `${segment} ${percentage}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {customerSegments.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Customer Lifetime Value Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* LTV by Segment */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifetime Value by Segment</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={lifetimeValue}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="segment" />
                                <YAxis />
                                <Tooltip formatter={(value) => [currencyFormat(value as number), 'LTV']} />
                                <Bar dataKey="averageLTV" fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Geographic Distribution */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Region</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={geographicData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="region" type="category" width={80} />
                                <Tooltip formatter={(value) => [currencyFormat(value as number), 'Revenue']} />
                                <Bar dataKey="revenue" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Segments Table */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments Details</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Segment</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AOV</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {customerSegments.map((segment, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {segment.segment}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {segment.count} ({segment.percentage}%)
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {currencyFormat(segment.averageOrderValue)}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {currencyFormat(segment.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Geographic Performance Table */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Regions</h3>
                        <div className="space-y-4">
                            {geographicData.map((region, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">{region.region}</h4>
                                            <p className="text-xs text-gray-500">{region.customers} customers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{currencyFormat(region.revenue)}</p>
                                        <p className="text-xs text-gray-500">{region.orders} orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
    color: 'blue' | 'green' | 'purple' | 'yellow';
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-50 text-blue-600';
            case 'green':
                return 'bg-green-50 text-green-600';
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