import { X, Package, DollarSign, Hash, Tag } from 'lucide-react';
import type { Product } from '../../../app/models/product';
import { currencyFormat } from '../../../app/util/util';

interface AdminProduct extends Product {
    totalStock?: number;
    status?: 'Active' | 'Inactive' | 'Out of Stock' | 'Draft';
}

interface ProductDetailsModalProps {
    product: AdminProduct;
    onClose: () => void;
}

export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    const totalStock = product.variants?.reduce((sum, v) => sum + v.quantityInStock, 0) || product.totalStock || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-brown to-dark-grey text-white px-6 py-4 flex justify-between items-center rounded-t-xl">
                    <div>
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <p className="text-sm text-beige mt-1">{product.categoryName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="p-6">
                    {/* Image and Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="md:col-span-1">
                            {product.pictureUrl ? (
                                <img
                                    src={product.pictureUrl}
                                    alt={product.name}
                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            {/* Description */}
                            <div>
                                <h3 className="text-lg font-semibold text-dark-grey mb-2">Opis</h3>
                                <p className="text-gray-700">{product.description || 'No description available'}</p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-beige/20 p-4 rounded-lg">
                                    <div className="flex items-center text-brown mb-1">
                                        <DollarSign className="w-4 h-4 mr-1" />
                                        <span className="text-sm font-medium">Osnovna cena</span>
                                    </div>
                                    <p className="text-2xl font-bold text-dark-grey">{currencyFormat(product.price)}</p>
                                </div>

                                <div className="bg-beige/20 p-4 rounded-lg">
                                    <div className="flex items-center text-brown mb-1">
                                        <Package className="w-4 h-4 mr-1" />
                                        <span className="text-sm font-medium">Ukupne zalihe</span>
                                    </div>
                                    <p className="text-2xl font-bold text-dark-grey">{totalStock}</p>
                                </div>

                                <div className="bg-beige/20 p-4 rounded-lg">
                                    <div className="flex items-center text-brown mb-1">
                                        <Hash className="w-4 h-4 mr-1" />
                                        <span className="text-sm font-medium">Tip proizvoda</span>
                                    </div>
                                    <p className="text-lg font-semibold text-dark-grey">{product.productType || 'Physical'}</p>
                                </div>

                                <div className="bg-beige/20 p-4 rounded-lg">
                                    <div className="flex items-center text-brown mb-1">
                                        <Tag className="w-4 h-4 mr-1" />
                                        <span className="text-sm font-medium">Status</span>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                        product.status === 'Active' ? 'bg-green-100 text-green-800' :
                                        product.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {product.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Variants Section */}
                    {product.variants && product.variants.length > 0 ? (
                        <div>
                            <h3 className="text-xl font-bold text-dark-grey mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-brown" />
                                Varijante proizvoda ({product.variants.length})
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Atributi
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Cena
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Zalihe
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {product.variants.map((variant, index) => {
                                            const hasCustomPrice = variant.priceOverride !== null && variant.priceOverride !== undefined;
                                            const variantPrice = variant.price;
                                            return (
                                                <tr key={variant.productVariantId || index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-wrap gap-2">
                                                            {variant.attributes && variant.attributes.length > 0 ? (
                                                                variant.attributes.map((attr, attrIndex) => (
                                                                    <span
                                                                        key={attrIndex}
                                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brown/10 text-brown border border-brown/20"
                                                                    >
                                                                        <span className="font-semibold mr-1">{attr.attributeName}:</span>
                                                                        {attr.attributeValue}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 text-sm italic">Nema atributa</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-dark-grey">
                                                                {currencyFormat(variantPrice)}
                                                            </span>
                                                            {hasCustomPrice && (
                                                                <span className="text-xs text-gray-500">
                                                                    Osnova: {currencyFormat(product.price)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex px-2.5 py-1 text-sm font-semibold rounded-full ${
                                                            variant.quantityInStock > 10 ? 'bg-green-100 text-green-800' :
                                                            variant.quantityInStock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {variant.quantityInStock} komada
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Variant Summary */}
                            <div className="mt-4 p-4 bg-brown/5 rounded-lg border border-brown/20">
                                <h4 className="font-semibold text-dark-grey mb-2">Pregled varijanti</h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Ukupno varijanti:</span>
                                        <span className="ml-2 font-semibold text-dark-grey">{product.variants.length}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Zalihe ukupno:</span>
                                        <span className="ml-2 font-semibold text-dark-grey">{totalStock} units</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Raspon cena:</span>
                                        <span className="ml-2 font-semibold text-dark-grey">
                                            {(() => {
                                                const prices = product.variants.map(v => v.price);
                                                const minPrice = Math.min(...prices);
                                                const maxPrice = Math.max(...prices);
                                                return minPrice === maxPrice
                                                    ? currencyFormat(minPrice)
                                                    : `${currencyFormat(minPrice)} - ${currencyFormat(maxPrice)}`;
                                            })()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Nema varijanti</h3>
                            <p className="text-gray-500">Ovaj proizvod nema definisanih varijanti.</p>
                            {product.totalStock !== undefined && (
                                <p className="mt-3 text-sm">
                                    <span className="text-gray-600">Zalihe:</span>
                                    <span className="ml-2 font-semibold text-dark-grey">{product.totalStock} komada</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="w-full md:w-auto px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
