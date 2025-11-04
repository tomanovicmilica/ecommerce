import { useState, useEffect } from 'react';
import { Package, Search, Plus, Minus, AlertTriangle, History } from 'lucide-react';
import Table from '../../../app/components/ui/Table';
import LoadingComponent from '../../../app/layout/LoadingComponent';
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
    imageUrl: string;
    categoryName: string;
}

interface StockAdjustment {
    productId: number;
    variantId: number;
    quantity: number;
    reason: string;
}

export default function InventoryManagement() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [filterLowStock, setFilterLowStock] = useState(false);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            // Fetch all products with their variants
            const response = await agent.Catalog.list(new URLSearchParams());
            const products = response.items;

            const inventoryItems: InventoryItem[] = [];

            products.forEach((product: any) => {
                if (product.variants && product.variants.length > 0) {
                    product.variants.forEach((variant: any) => {
                        inventoryItems.push({
                            productId: product.productId,
                            productName: product.name,
                            variantId: variant.id,
                            variantAttributes: variant.attributes?.map((attr: any) =>
                                `${attr.attributeName}: ${attr.attributeValue}`
                            ).join(', ') || 'Default',
                            currentStock: variant.quantityInStock,
                            lowStockThreshold: 10, // configurable
                            imageUrl: product.imageUrl,
                            categoryName: product.categoryName
                        });
                    });
                } else {
                    // Handle products without variants
                    inventoryItems.push({
                        productId: product.productId,
                        productName: product.name,
                        variantId: 0,
                        variantAttributes: 'Default',
                        currentStock: product.quantityInStock || 0,
                        lowStockThreshold: 10,
                        imageUrl: product.imageUrl,
                        categoryName: product.categoryName
                    });
                }
            });

            setInventory(inventoryItems);
        } catch (error) {
            console.error('Neuspešno učitavanje zaliha:', error);
            toast.error('Neuspešno učitavanje zaliha');
        } finally {
            setLoading(false);
        }
    };

    const handleStockAdjustment = async (adjustment: StockAdjustment) => {
        try {
            await agent.Admin.updateStock(
                adjustment.productId,
                adjustment.variantId,
                adjustment.quantity,
                adjustment.reason
            );
            toast.success('Zalihe uspešno ažurirane');
            fetchInventory();
            setShowAdjustModal(false);
            setSelectedItem(null);
        } catch (error) {
            console.error('Neuspešno ažuriranje zaliha:', error);
            toast.error('Neuspešno ažuriranje zaliha');
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.variantAttributes.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLowStock = !filterLowStock || item.currentStock <= item.lowStockThreshold;

        return matchesSearch && matchesLowStock;
    });

    const lowStockCount = inventory.filter(item => item.currentStock <= item.lowStockThreshold).length;

    if (loading) return <LoadingComponent />;

    const headers = ["Proizvod", "Varijanta", "Kategorija", "Trenutne zalihe", "Status", "Akcije"];

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Upravljanje zalihama</h1>
                        <p className="text-gray-600 mt-1">
                            {inventory.length} stavki • {lowStockCount} upozorenja o niskim zalihama
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Pretraži proizvode..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            />
                        </div>

                        {/* Low Stock Filter */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="lowStock"
                                checked={filterLowStock}
                                onChange={(e) => setFilterLowStock(e.target.checked)}
                                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                            />
                            <label htmlFor="lowStock" className="ml-2 text-sm text-gray-700">
                                Pokaži samo stavke sa niskim zalihama ({lowStockCount})
                            </label>
                        </div>

                        {/* Stock Summary */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Na stanju</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Niske zalihe</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span className="text-sm text-gray-600">Nema na stanju</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-lg shadow-md">
                    <Table headers={headers}>
                        {filteredInventory.map((item, index) => {
                            const stockStatus = item.currentStock === 0 ? 'out' :
                                              item.currentStock <= item.lowStockThreshold ? 'low' : 'good';

                            return (
                                <tr key={`${item.productId}-${item.variantId}-${index}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                className="w-12 h-12 rounded-lg object-cover"
                                                src={item.imageUrl}
                                                alt={item.productName}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                                }}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                                <p className="text-sm text-gray-500">ID: {item.productId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {item.variantAttributes}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {item.categoryName}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-sm font-medium ${
                                            stockStatus === 'out' ? 'text-red-600' :
                                            stockStatus === 'low' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>
                                            {item.currentStock}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                                stockStatus === 'out' ? 'bg-red-500' :
                                                stockStatus === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}></div>
                                            <span className={`text-xs font-medium ${
                                                stockStatus === 'out' ? 'text-red-700' :
                                                stockStatus === 'low' ? 'text-yellow-700' : 'text-green-700'
                                            }`}>
                                                {stockStatus === 'out' ? 'Out of Stock' :
                                                 stockStatus === 'low' ? 'Low Stock' : 'In Stock'}
                                            </span>
                                            {stockStatus === 'low' && (
                                                <AlertTriangle className="w-4 h-4 text-yellow-500 ml-1" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                className="p-1 text-gray-400 hover:text-brown transition-colors"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setShowAdjustModal(true);
                                                }}
                                                title="Adjust stock"
                                            >
                                                <Package className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                                title="View history"
                                            >
                                                <History className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </Table>

                    {filteredInventory.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">Nisu pronađene stavke na zalihama</p>
                        </div>
                    )}
                </div>

                {/* Stock Adjustment Modal */}
                {showAdjustModal && selectedItem && (
                    <StockAdjustmentModal
                        item={selectedItem}
                        onSave={handleStockAdjustment}
                        onClose={() => {
                            setShowAdjustModal(false);
                            setSelectedItem(null);
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}

interface StockAdjustmentModalProps {
    item: InventoryItem;
    onSave: (adjustment: StockAdjustment) => void;
    onClose: () => void;
}

function StockAdjustmentModal({ item, onSave, onClose }: StockAdjustmentModalProps) {
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quantity <= 0) {
            toast.error('Količina mora biti veća od 0');
            return;
        }
        if (!reason.trim()) {
            toast.error('Razlog je neophodan');
            return;
        }

        let finalQuantity = quantity;
        if (adjustmentType === 'remove') {
            finalQuantity = -quantity;
        } else if (adjustmentType === 'set') {
            finalQuantity = quantity - item.currentStock;
        }

        onSave({
            productId: item.productId,
            variantId: item.variantId,
            quantity: finalQuantity,
            reason: reason.trim()
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Ažuriraj zalihe</h2>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                    <p className="text-sm text-gray-600">{item.variantAttributes}</p>
                    <p className="text-sm text-gray-600">Trenutne zalihe: <span className="font-medium">{item.currentStock}</span></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adjustment Type
                        </label>
                        <select
                            value={adjustmentType}
                            onChange={(e) => setAdjustmentType(e.target.value as 'add' | 'remove' | 'set')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                        >
                            <option value="add">Dodaj zalihe</option>
                            <option value="remove">Ukloni sa zaliha</option>
                            <option value="set">Postavi stanje na</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Količina *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            placeholder="Enter quantity"
                            required
                        />
                        {adjustmentType === 'set' && (
                            <p className="text-xs text-gray-500 mt-1">
                                Ovo će postaviti zalihe na {quantity} (change: {quantity - item.currentStock})
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Razlog *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-light-grey focus:border-transparent"
                            placeholder="Explain why you're adjusting the stock..."
                            required
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Poništi
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                        >
                            Ažuriraj zalihe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}