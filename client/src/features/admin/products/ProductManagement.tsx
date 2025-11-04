import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Download } from 'lucide-react';
import type { Product } from '../../../app/models/product';
import Table from '../../../app/components/ui/Table';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { currencyFormat } from '../../../app/util/util';
import AdminLayout from '../layout/AdminLayout';
import agent from '../../../app/api/agent';
import { toast } from 'react-toastify';
import BulkActions, { productBulkActions } from '../components/BulkActions';
import ExportManager, { generateCSV, generateXLSX, downloadFile } from '../components/ExportManager';
import ProductForm from './ProductForm';
import BulkPriceUpdateModal from './BulkPriceUpdateModal';
import ProductDetailsModal from './ProductDetailsModal';

interface AdminProduct extends Product {
    totalStock: number;
    status: 'Active' | 'Inactive' | 'Out of Stock';
}

export default function ProductManagement() {
    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedProductType, setSelectedProductType] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
    const [showExportModal, setShowExportModal] = useState(false);
    const [currentView, setCurrentView] = useState<'list' | 'add' | 'edit' | 'view'>('list');
    const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [showPriceUpdateModal, setShowPriceUpdateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [productToView, setProductToView] = useState<AdminProduct | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (selectedCategory) params.append('category', selectedCategory);
            if (selectedStatus) params.append('status', selectedStatus);
            if (selectedProductType) params.append('productType', selectedProductType);

            const response = await agent.Admin.getProducts(params);

            // Transform products to include admin-specific fields
            const adminProducts: AdminProduct[] = response.map((product: Product) => ({
                ...product,
                totalStock: product.variants?.reduce((sum, variant) => sum + variant.quantityInStock, 0) || 0,
                status: getProductStatus(product)
            }));

            setProducts(adminProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await agent.Admin.getCategories();
            setCategories(response);
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const getProductStatus = (product: Product): 'Active' | 'Inactive' | 'Out of Stock' => {
        const totalStock = product.variants?.reduce((sum, variant) => sum + variant.quantityInStock, 0) || 0;
        if (totalStock === 0) return 'Out of Stock';
        // You can add more logic here based on your business rules
        return 'Active';
    };

    const handleDeleteProduct = async (productId: number) => {
        if (!confirm('Da li ste sigurni da želite da obrišete proizvod?')) return;

        try {
            await agent.Admin.deleteProduct(productId);
            toast.success('Proizvod uspešno obrisan');
            fetchProducts();
        } catch (error) {
            console.error('Neuspešno brisanje proizvoda:', error);
            toast.error('Neuspešno brisanje proizvoda');
        }
    };

    const handleStatusChange = async (productId: number, newStatus: string) => {
        try {
            await agent.Admin.updateProductStatus(productId, newStatus);
            toast.success('Status proizvoda ažuriran');
            fetchProducts();
        } catch (error) {
            console.error('Neuspešno ažuriranje statusa:', error);
            toast.error('Neuspešno ažuriranje statusa');
        }
    };

    // Refresh products when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 500); // Debounce search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedCategory, selectedStatus, selectedProductType]);

    // Remove filteredProducts since filtering is now done server-side
    const filteredProducts = products;

    const handleSelectProduct = (productId: number) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = (selectAll: boolean) => {
        if (selectAll) {
            setSelectedProducts(filteredProducts.map(p => p.productId));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleBulkAction = async (actionId: string, selectedItems: number[]) => {
        try {
            switch (actionId) {
                case 'activate':
                    for (const productId of selectedItems) {
                        await agent.Admin.updateProductStatus(productId, 'Active');
                    }
                    toast.success(`${selectedItems.length} products activated`);
                    break;

                case 'deactivate':
                    for (const productId of selectedItems) {
                        await agent.Admin.updateProductStatus(productId, 'Inactive');
                    }
                    toast.success(`${selectedItems.length} products deactivated`);
                    break;

                case 'delete':
                    for (const productId of selectedItems) {
                        await agent.Admin.deleteProduct(productId);
                    }
                    toast.success(`${selectedItems.length} products deleted`);
                    break;

                case 'export':
                    setShowExportModal(true);
                    break;

                case 'updatePrices':
                    setShowPriceUpdateModal(true);
                    break;

                default:
                    toast.error('Unknown action');
                    return;
            }

            // Refresh products and clear selection
            fetchProducts();
            setSelectedProducts([]);
        } catch (error) {
            console.error('Bulk action failed:', error);
            toast.error('Bulk action failed');
        }
    };

    const handleExport = async (options: any) => {
        try {
            // Support CSV and XLSX export (client-side)
            if (options.format !== 'csv' && options.format !== 'xlsx') {
                toast.info('Only CSV and Excel export are currently available. PDF export will be added soon.');
                return;
            }

            const dataToExport = selectedProducts.length > 0
                ? filteredProducts.filter(p => selectedProducts.includes(p.productId))
                : filteredProducts;

            if (dataToExport.length === 0) {
                toast.warning('No products to export');
                return;
            }

            const exportData = dataToExport.map(product => ({
                id: product.productId,
                name: product.name,
                category: product.categoryName,
                price: product.price,
                stock: product.totalStock,
                status: product.status,
                description: product.description
            }));

            const columns = options.columns || ['id', 'name', 'category', 'price', 'stock', 'status'];
            const timestamp = new Date().toISOString().split('T')[0];

            if (options.format === 'csv') {
                const csvContent = generateCSV(exportData, columns);
                const filename = `products_export_${timestamp}.csv`;
                downloadFile(csvContent, filename, 'text/csv');
            } else if (options.format === 'xlsx') {
                const filename = `products_export_${timestamp}.xlsx`;
                await generateXLSX(exportData, columns, filename);
            }

            toast.success(`Successfully exported ${dataToExport.length} products`);
            setSelectedProducts([]); // Clear selection after export
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export products');
        }
    };

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setCurrentView('add');
    };

    const handleEditProduct = (product: AdminProduct) => {
        setSelectedProduct(product);
        setCurrentView('edit');
    };

    const handleViewProduct = (product: AdminProduct) => {
        setProductToView(product);
        setShowDetailsModal(true);
    };

    const handleFormSubmit = async (formData: any) => {
        try {
            setFormLoading(true);
            if (currentView === 'add') {
                await agent.Admin.createProduct(formData);
                toast.success('Product created successfully');
            } else if (currentView === 'edit' && selectedProduct) {
                // Add productId to formData for update
                const updateData = {
                    ...formData,
                    productId: selectedProduct.productId
                };
                await agent.Admin.updateProduct(selectedProduct.productId, updateData);
                toast.success('Product updated successfully');
            }

            await fetchProducts();
            setCurrentView('list');
            setSelectedProduct(null);
        } catch (error) {
            console.error('Form submission failed:', error);
            toast.error(`Failed to ${currentView === 'add' ? 'create' : 'update'} product`);
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormCancel = () => {
        setCurrentView('list');
        setSelectedProduct(null);
    };

    const exportColumns = [
        { key: 'id', label: 'Product ID' },
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        { key: 'price', label: 'Price' },
        { key: 'stock', label: 'Stock Quantity' },
        { key: 'status', label: 'Status' },
        { key: 'description', label: 'Description' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-brown/10 text-brown border border-brown/20';
            case 'Inactive':
                return 'bg-light-grey/10 text-light-grey border border-light-grey/20';
            case 'Out of Stock':
                return 'bg-red-100 text-red-800 border border-red-200';
            default:
                return 'bg-light-grey/10 text-light-grey border border-light-grey/20';
        }
    };

    const handleBulkPriceUpdate = async (productIds: number[], updateType: 'increase' | 'decrease' | 'set', value: number) => {
        await agent.Admin.bulkUpdatePrices(productIds, updateType, value);
        await fetchProducts();
        setSelectedProducts([]);
    };

    if (loading) return <LoadingComponent />;

    // Show form for add/edit/view modes
    if (currentView !== 'list') {
        return (
            <AdminLayout>
                <ProductForm
                    product={selectedProduct || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    loading={formLoading}
                />
            </AdminLayout>
        );
    }

    const headers = [
        "Izaberi",
        "Proizvod",
        "Kategorija",
        "Tip",
        "Cena",
        "Zalihe",
        "Status",
        "Akcije"
    ];

    return (
        <AdminLayout>
            <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-6 text-white shadow-sm mb-6">
                    <h1 className="text-3xl font-bold">Upravljanje proizvodima</h1>
                    <p className="mt-2 opacity-90">{products.length} proizvoda ukupno</p>
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={() => setShowExportModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-beige text-white rounded-lg hover:bg-brown transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export
                    </button>
                    <button
                        onClick={handleAddProduct}
                        className="inline-flex items-center px-4 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Dodaj proizvod
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-light-grey/20 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Pretraži proizvode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                    >
                        <option value="">Sve kategorije</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                    >
                        <option value="">Svi statusi</option>
                        <option value="Active">Aktivni</option>
                        <option value="Inactive">Neaktivni</option>
                        <option value="Out of Stock">Nema na stanju</option>
                    </select>

                    {/* Product Type Filter */}
                    <select
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value)}
                        className="w-full px-3 py-2 border border-light-grey/30 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                    >
                        <option value="">Svi tipovi</option>
                        <option value="0">Fizički</option>
                        <option value="1">Digitalni</option>
                    </select>

                    {/* Bulk Actions */}
                    <div className="flex space-x-2">
                        <button
                            disabled={selectedProducts.length === 0}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-light-grey text-white rounded-lg hover:bg-brown disabled:bg-light-grey/50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Filter className="w-4 h-4 mr-1" />
                            Bulk Edit
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <BulkActions
                selectedItems={selectedProducts}
                totalItems={filteredProducts.length}
                onSelectAll={handleSelectAll}
                onBulkAction={handleBulkAction}
                actions={productBulkActions}
                entityName="products"
            />

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-light-grey/20">
                <Table headers={headers}>
                    {filteredProducts.map((product) => (
                        <tr key={product.productId} className="hover:bg-beige/5 transition-colors">
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product.productId)}
                                    onChange={() => handleSelectProduct(product.productId)}
                                    className="rounded border-gray-300"
                                />
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center space-x-3">
                                    <img
                                        className="w-12 h-12 rounded-lg object-cover"
                                        src={product.pictureUrl}
                                        alt={product.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                                        }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-dark-grey">{product.name}</p>
                                        <p className="text-sm text-light-grey">ID: {product.productId}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-dark-grey">
                                {product.categoryName}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${
                                    product.productType === 1
                                        ? 'bg-beige/10 text-beige border-beige/20'
                                        : 'bg-brown/10 text-brown border-brown/20'
                                }`}>
                                    {product.productType === 1 ? 'Digital' : 'Physical'}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-dark-grey">
                                {currencyFormat(product.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-dark-grey">
                                <span className={product.totalStock <= 10 ? 'text-red-600 font-medium' : ''}>
                                    {product.totalStock}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                                    {product.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleViewProduct(product)}
                                        className="p-1 text-light-grey hover:text-brown transition-colors"
                                        title="View product"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="p-1 text-light-grey hover:text-brown transition-colors"
                                        title="Edit product"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        className="p-1 text-light-grey hover:text-red-600 transition-colors"
                                        onClick={() => handleDeleteProduct(product.productId)}
                                        title="Delete product"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-light-grey hover:text-brown transition-colors">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </Table>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-light-grey">Nema pronađenih proizvoda</p>
                    </div>
                )}
            </div>

            {/* Selected Items Count */}
            {selectedProducts.length > 0 && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-brown text-white px-6 py-3 rounded-lg shadow-lg">
                    {selectedProducts.length} proizvod(a) odabrano
                    <button className="ml-4 underline hover:no-underline">
                        Bulk akcije
                    </button>
                </div>
            )}

            {/* Export Modal */}
            <ExportManager
                entityType="products"
                onExport={handleExport}
                availableColumns={exportColumns}
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
            />
            </div>
            {/* Bulk Price Update Modal */}
            {showPriceUpdateModal && (
                <BulkPriceUpdateModal
                    products={products
                        .filter(p => selectedProducts.includes(p.productId))
                        .map(p => ({
                            productId: p.productId,
                            name: p.name,
                            price: p.price
                        }))}
                    onClose={() => setShowPriceUpdateModal(false)}
                    onUpdate={handleBulkPriceUpdate}
                />
            )}

            {/* Product Details Modal */}
            {showDetailsModal && productToView && (
                <ProductDetailsModal
                    product={productToView}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setProductToView(null);
                    }}
                />
            )}
        </AdminLayout>
    );
}