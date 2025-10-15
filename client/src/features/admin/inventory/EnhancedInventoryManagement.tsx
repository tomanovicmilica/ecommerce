import { useState, useEffect } from 'react';
import { Package, Search, Plus, Minus, AlertTriangle, History, Edit, Save, X, Warehouse } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';

interface InventoryItem {
    productId: number;
    productName: string;
    variantId: number;
    variantAttributes: string;
    currentStock: number;
    lowStockThreshold: number;
    pictureUrl: string;
    categoryName: string;
    price: number;
}

interface StockAdjustment {
    productId: number;
    variantId: number;
    quantity: number;
    reason: string;
}

export default function EnhancedInventoryManagement() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [filterLowStock, setFilterLowStock] = useState(false);
    const [adjustment, setAdjustment] = useState<StockAdjustment>({
        productId: 0,
        variantId: 0,
        quantity: 0,
        reason: ''
    });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            // Fetch all products with their variants
            const products = await agent.Catalog.list(new URLSearchParams());

            const inventoryItems: InventoryItem[] = [];

            products.forEach((product: any) => {
                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach((variant: any) => {
                        inventoryItems.push({
                            productId: product.productId,
                            productName: product.name,
                            variantId: variant.productVariantId,
                            variantAttributes: variant.attributes?.map((attr: any) =>
                                `${attr.attributeName}: ${attr.attributeValue}`
                            ).join(', ') || 'Default',
                            currentStock: variant.quantityInStock,
                            lowStockThreshold: 10, // Default threshold
                            pictureUrl: product.pictureUrl,
                            categoryName: product.categoryName,
                            price: variant.price || product.price
                        });
                    });
                } else {
                    // Product without variants
                    inventoryItems.push({
                        productId: product.productId,
                        productName: product.name,
                        variantId: 0,
                        variantAttributes: 'Default',
                        currentStock: 0, // Default stock
                        lowStockThreshold: 10,
                        pictureUrl: product.pictureUrl,
                        categoryName: product.categoryName,
                        price: product.price
                    });
                }
            });

            setInventory(inventoryItems);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async () => {
        if (!adjustment.reason.trim()) {
            toast.error('Please provide a reason for the adjustment');
            return;
        }

        if (adjustment.quantity === 0) {
            toast.error('Please enter a quantity to adjust');
            return;
        }

        try {
            await agent.Admin.updateStock(
                adjustment.productId,
                adjustment.variantId,
                adjustment.quantity,
                adjustment.reason
            );

            toast.success('Stock updated successfully');
            fetchInventory();
            setShowAdjustModal(false);
            setAdjustment({ productId: 0, variantId: 0, quantity: 0, reason: '' });
        } catch (error) {
            console.error('Failed to update stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const openAdjustModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setAdjustment({
            productId: item.productId,
            variantId: item.variantId,
            quantity: 0,
            reason: ''
        });
        setShowAdjustModal(true);
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.variantAttributes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLowStock = filterLowStock
            ? item.currentStock <= item.lowStockThreshold
            : true;

        return matchesSearch && matchesLowStock;
    });

    const getStockStatus = (current: number, threshold: number) => {
        if (current === 0) return { status: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        if (current <= threshold) return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        return { status: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    const lowStockCount = inventory.filter(item => item.currentStock <= item.lowStockThreshold).length;
    const outOfStockCount = inventory.filter(item => item.currentStock === 0).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.price), 0);

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-600 mt-1">{inventory.length} items in inventory</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Warehouse className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <AlertTriangle className="w-8 h-8 text-yellow-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                                <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Package className="w-8 h-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                                <p className="text-2xl font-bold text-gray-900">{outOfStockCount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 text-xl font-bold">$</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    ${totalValue.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products, categories, or variants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={filterLowStock}
                                onChange={(e) => setFilterLowStock(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">Show only low stock</span>
                        </label>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Variant
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredInventory.map((item) => {
                                const stockStatus = getStockStatus(item.currentStock, item.lowStockThreshold);
                                return (
                                    <tr key={`${item.productId}-${item.variantId}`} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img
                                                        className="h-10 w-10 rounded-lg object-cover"
                                                        src={item.pictureUrl || '/placeholder-image.jpg'}
                                                        alt={item.productName}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.productName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {item.productId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.variantAttributes}</div>
                                            <div className="text-sm text-gray-500">Variant ID: {item.variantId}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                                {item.categoryName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.currentStock} units
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Threshold: {item.lowStockThreshold}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${stockStatus.color}`}>
                                                {stockStatus.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${(item.currentStock * item.price).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => openAdjustModal(item)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    // TODO: Implement stock history
                                                    toast.info('Stock history feature coming soon');
                                                }}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredInventory.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No inventory items found</p>
                        </div>
                    )}
                </div>

                {/* Stock Adjustment Modal */}
                {showAdjustModal && selectedItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Adjust Stock</h3>
                                    <button
                                        onClick={() => setShowAdjustModal(false)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm font-medium text-gray-900">{selectedItem.productName}</p>
                                    <p className="text-sm text-gray-600">{selectedItem.variantAttributes}</p>
                                    <p className="text-sm text-gray-600">Current Stock: {selectedItem.currentStock} units</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Adjustment Quantity
                                        </label>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setAdjustment(prev => ({ ...prev, quantity: prev.quantity - 1 }))}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                type="number"
                                                value={adjustment.quantity}
                                                onChange={(e) => setAdjustment(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                                className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setAdjustment(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                                                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">
                                            New stock: {selectedItem.currentStock + adjustment.quantity} units
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason for Adjustment *
                                        </label>
                                        <select
                                            value={adjustment.reason}
                                            onChange={(e) => setAdjustment(prev => ({ ...prev, reason: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="Stock Received">Stock Received</option>
                                            <option value="Stock Correction">Stock Correction</option>
                                            <option value="Damaged Goods">Damaged Goods</option>
                                            <option value="Lost Items">Lost Items</option>
                                            <option value="Return Processing">Return Processing</option>
                                            <option value="Manual Adjustment">Manual Adjustment</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowAdjustModal(false)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStockAdjustment}
                                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Stock
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}