import { useState, useEffect } from 'react';
import {
    Package,
    Search,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Settings,
    Bell,
    BarChart3,
    Calendar,
    Filter
} from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { currencyFormat } from '../../../app/util/util';

interface InventoryItem {
    productId: number;
    productName: string;
    variantId: number;
    variantAttributes: string;
    currentStock: number;
    reorderPoint: number;
    maxStock: number;
    lowStockThreshold: number;
    averageDailySales: number;
    leadTimeDays: number;
    categoryName: string;
    price: number;
    lastRestocked: string;
    stockValue: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'reorder_needed';
}

interface StockMetrics {
    totalProducts: number;
    totalStockValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    reorderNeededItems: number;
    turnoverRate: number;
}

export default function EnhancedInventoryDashboard() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('stockLevel');
    const [showReorderSuggestions, setShowReorderSuggestions] = useState(false);
    const [metrics, setMetrics] = useState<StockMetrics | null>(null);

    // Mock data - in real app, fetch from API
    useEffect(() => {
        const mockInventory: InventoryItem[] = [
            {
                productId: 1,
                productName: "MacBook Pro 16-inch",
                variantId: 1,
                variantAttributes: "Space Gray, 512GB",
                currentStock: 8,
                reorderPoint: 15,
                maxStock: 50,
                lowStockThreshold: 10,
                averageDailySales: 2.5,
                leadTimeDays: 7,
                categoryName: "Laptops",
                price: 2499.99,
                lastRestocked: "2024-01-10",
                stockValue: 19999.92,
                status: 'reorder_needed'
            },
            {
                productId: 2,
                productName: "iPhone 15 Pro",
                variantId: 2,
                variantAttributes: "128GB, Blue",
                currentStock: 25,
                reorderPoint: 20,
                maxStock: 100,
                lowStockThreshold: 15,
                averageDailySales: 5.2,
                leadTimeDays: 3,
                categoryName: "Smartphones",
                price: 999.99,
                lastRestocked: "2024-01-15",
                stockValue: 24999.75,
                status: 'in_stock'
            },
            {
                productId: 3,
                productName: "iPad Air",
                variantId: 3,
                variantAttributes: "64GB, Silver",
                currentStock: 5,
                reorderPoint: 12,
                maxStock: 40,
                lowStockThreshold: 8,
                averageDailySales: 1.8,
                leadTimeDays: 5,
                categoryName: "Tablets",
                price: 599.99,
                lastRestocked: "2024-01-05",
                stockValue: 2999.95,
                status: 'low_stock'
            },
            {
                productId: 4,
                productName: "AirPods Pro",
                variantId: 4,
                variantAttributes: "2nd Generation",
                currentStock: 0,
                reorderPoint: 30,
                maxStock: 150,
                lowStockThreshold: 20,
                averageDailySales: 8.5,
                leadTimeDays: 2,
                categoryName: "Audio",
                price: 249.99,
                lastRestocked: "2023-12-20",
                stockValue: 0,
                status: 'out_of_stock'
            }
        ];

        const mockMetrics: StockMetrics = {
            totalProducts: mockInventory.length,
            totalStockValue: mockInventory.reduce((sum, item) => sum + item.stockValue, 0),
            lowStockItems: mockInventory.filter(item => item.status === 'low_stock').length,
            outOfStockItems: mockInventory.filter(item => item.status === 'out_of_stock').length,
            reorderNeededItems: mockInventory.filter(item => item.status === 'reorder_needed').length,
            turnoverRate: 8.5
        };

        setInventory(mockInventory);
        setMetrics(mockMetrics);
        setLoading(false);
    }, []);

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.categoryName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || item.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const sortedInventory = [...filteredInventory].sort((a, b) => {
        switch (sortBy) {
            case 'stockLevel':
                return a.currentStock - b.currentStock;
            case 'stockValue':
                return b.stockValue - a.stockValue;
            case 'reorderPriority':
                const aPriority = getReorderPriority(a);
                const bPriority = getReorderPriority(b);
                return bPriority - aPriority;
            default:
                return 0;
        }
    });

    const getReorderPriority = (item: InventoryItem): number => {
        const daysOfStock = item.currentStock / Math.max(item.averageDailySales, 0.1);
        const reorderUrgency = Math.max(0, (item.reorderPoint - item.currentStock) / item.reorderPoint);
        return reorderUrgency * 100 + (10 - Math.min(daysOfStock, 10));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_stock':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'low_stock':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'out_of_stock':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'reorder_needed':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'in_stock':
                return <Package className="w-4 h-4" />;
            case 'low_stock':
                return <AlertTriangle className="w-4 h-4" />;
            case 'out_of_stock':
                return <AlertTriangle className="w-4 h-4" />;
            case 'reorder_needed':
                return <RefreshCw className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const calculateDaysOfStock = (item: InventoryItem): number => {
        return Math.floor(item.currentStock / Math.max(item.averageDailySales, 0.1));
    };

    const generateReorderSuggestions = () => {
        return inventory
            .filter(item => item.currentStock <= item.reorderPoint)
            .map(item => {
                const suggestedQuantity = item.maxStock - item.currentStock;
                const urgency = item.currentStock === 0 ? 'critical' :
                               item.currentStock < item.lowStockThreshold ? 'high' : 'medium';

                return {
                    ...item,
                    suggestedQuantity,
                    urgency,
                    estimatedCost: suggestedQuantity * item.price,
                    daysOfStock: calculateDaysOfStock(item)
                };
            })
            .sort((a, b) => {
                const urgencyOrder = { critical: 3, high: 2, medium: 1 };
                return urgencyOrder[b.urgency as keyof typeof urgencyOrder] -
                       urgencyOrder[a.urgency as keyof typeof urgencyOrder];
            });
    };

    if (loading) return <LoadingComponent />;

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600 mt-1">
                            Monitor stock levels, track reorder points, and manage inventory efficiently
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowReorderSuggestions(!showReorderSuggestions)}
                            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <Bell className="w-5 h-5 mr-2" />
                            Reorder Suggestions ({generateReorderSuggestions().length})
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                            <Settings className="w-5 h-5 mr-2" />
                            Bulk Update
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-blue-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.totalProducts}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center">
                            <TrendingUp className="w-8 h-8 text-green-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Stock Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {currencyFormat(metrics?.totalStockValue || 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.lowStockItems}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.outOfStockItems}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center">
                            <RefreshCw className="w-8 h-8 text-orange-600" />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-600">Reorder Needed</p>
                                <p className="text-2xl font-bold text-gray-900">{metrics?.reorderNeededItems}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reorder Suggestions Panel */}
                {showReorderSuggestions && (
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reorder Suggestions</h2>
                        <div className="space-y-3">
                            {generateReorderSuggestions().map((suggestion) => (
                                <div
                                    key={`${suggestion.productId}-${suggestion.variantId}`}
                                    className={`p-4 rounded-lg border-l-4 ${
                                        suggestion.urgency === 'critical'
                                            ? 'border-red-500 bg-red-50'
                                            : suggestion.urgency === 'high'
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-yellow-500 bg-yellow-50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">
                                                {suggestion.productName} - {suggestion.variantAttributes}
                                            </h3>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                <span>Current: {suggestion.currentStock}</span>
                                                <span>Reorder Point: {suggestion.reorderPoint}</span>
                                                <span>Days of Stock: {suggestion.daysOfStock}</span>
                                                <span className={`font-medium ${
                                                    suggestion.urgency === 'critical' ? 'text-red-600' :
                                                    suggestion.urgency === 'high' ? 'text-orange-600' : 'text-yellow-600'
                                                }`}>
                                                    {suggestion.urgency.toUpperCase()} PRIORITY
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <p className="text-lg font-semibold text-gray-900">
                                                Suggest: {suggestion.suggestedQuantity} units
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Cost: {currencyFormat(suggestion.estimatedCost)}
                                            </p>
                                            <button className="mt-2 px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                                                Create PO
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="reorder_needed">Reorder Needed</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="stockLevel">Sort by Stock Level</option>
                            <option value="stockValue">Sort by Stock Value</option>
                            <option value="reorderPriority">Sort by Reorder Priority</option>
                        </select>

                        <button className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Filter className="w-4 h-4 mr-2" />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Current Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Reorder Point
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock Value
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days of Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sortedInventory.map((item) => (
                                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.productName}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.variantAttributes} • {item.categoryName}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.currentStock}</div>
                                            <div className="text-xs text-gray-500">Max: {item.maxStock}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.reorderPoint}</div>
                                            <div className="text-xs text-gray-500">Low: {item.lowStockThreshold}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {currencyFormat(item.stockValue)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {calculateDaysOfStock(item)} days
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {item.averageDailySales.toFixed(1)}/day avg
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                                {getStatusIcon(item.status)}
                                                <span className="ml-1 capitalize">{item.status.replace('_', ' ')}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button className="text-indigo-600 hover:text-indigo-900">
                                                    Adjust Stock
                                                </button>
                                                <button className="text-green-600 hover:text-green-900">
                                                    Reorder
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {sortedInventory.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No inventory items found</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}