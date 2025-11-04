import { useState } from 'react';
import { X, DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { toast } from 'react-toastify';
import { currencyFormat } from '../../../app/util/util';

interface Product {
    productId: number;
    name: string;
    price: number;
}

interface Props {
    products: Product[];
    onClose: () => void;
    onUpdate: (productIds: number[], updateType: 'increase' | 'decrease' | 'set', value: number) => Promise<void>;
}

export default function BulkPriceUpdateModal({ products, onClose, onUpdate }: Props) {
    const [updateType, setUpdateType] = useState<'increase' | 'decrease' | 'set'>('increase');
    const [valueType, setValueType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState<number>(0);
    const [isUpdating, setIsUpdating] = useState(false);

    const calculateNewPrice = (originalPrice: number): number => {
        if (updateType === 'set') {
            return value;
        }

        if (valueType === 'percentage') {
            const multiplier = updateType === 'increase' ? (1 + value / 100) : (1 - value / 100);
            return Math.round(originalPrice * multiplier);
        } else {
            return updateType === 'increase' ? originalPrice + value : originalPrice - value;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (value <= 0 && updateType !== 'set') {
            toast.error('Vrednost mora biti veća od 0');
            return;
        }

        if (updateType === 'set' && value < 0) {
            toast.error('Cena ne može biti negativna');
            return;
        }

        // Validate that no price becomes negative
        const invalidProducts = products.filter(p => calculateNewPrice(p.price) < 0);
        if (invalidProducts.length > 0) {
            toast.error('Neke cene bi postale negativne. Molimo prilagodite vrednost.');
            return;
        }

        try {
            setIsUpdating(true);
            const productIds = products.map(p => p.productId);
            await onUpdate(productIds, updateType, value);
            toast.success(`Cene za ${products.length} proizvoda su uspešno ažurirane`);
            onClose();
        } catch (error) {
            console.error('Failed to update prices:', error);
            toast.error('Greška pri ažuriranju cena');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center">
                        <DollarSign className="w-6 h-6 text-brown mr-3" />
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Masovno ažuriranje cena</h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'} izabrano
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Update Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tip ažuriranja
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setUpdateType('increase')}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                                    updateType === 'increase'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-green-300'
                                }`}
                            >
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Povećaj
                            </button>
                            <button
                                type="button"
                                onClick={() => setUpdateType('decrease')}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                                    updateType === 'decrease'
                                        ? 'border-red-500 bg-red-50 text-red-700'
                                        : 'border-gray-300 hover:border-red-300'
                                }`}
                            >
                                <TrendingDown className="w-5 h-5 mr-2" />
                                Smanji
                            </button>
                            <button
                                type="button"
                                onClick={() => setUpdateType('set')}
                                className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                                    updateType === 'set'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                <DollarSign className="w-5 h-5 mr-2" />
                                Postavi
                            </button>
                        </div>
                    </div>

                    {/* Value Type (only for increase/decrease) */}
                    {updateType !== 'set' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Vrsta vrednosti
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setValueType('percentage')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                                        valueType === 'percentage'
                                            ? 'border-brown bg-brown-50 text-brown'
                                            : 'border-gray-300 hover:border-brown-300'
                                    }`}
                                >
                                    <Percent className="w-5 h-5 mr-2" />
                                    Procenat (%)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setValueType('fixed')}
                                    className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                                        valueType === 'fixed'
                                            ? 'border-brown bg-brown-50 text-brown'
                                            : 'border-gray-300 hover:border-brown-300'
                                    }`}
                                >
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Fiksna suma (RSD)
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Value Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {updateType === 'set'
                                ? 'Nova cena (RSD)'
                                : `Vrednost ${valueType === 'percentage' ? '(%)' : '(RSD)'}`}
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step={valueType === 'percentage' ? '0.01' : '1'}
                            value={value}
                            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">Pregled promena</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {products.slice(0, 10).map((product) => {
                                const newPrice = calculateNewPrice(product.price);
                                const difference = newPrice - product.price;
                                return (
                                    <div key={product.productId} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                                        <span className="text-sm text-gray-700 truncate flex-1">{product.name}</span>
                                        <div className="flex items-center space-x-3 ml-3">
                                            <span className="text-sm text-gray-500">{currencyFormat(product.price)}</span>
                                            <span className="text-sm font-semibold text-gray-400">→</span>
                                            <span className={`text-sm font-semibold ${difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {currencyFormat(newPrice)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            {products.length > 10 && (
                                <p className="text-xs text-gray-500 text-center pt-2">
                                    i još {products.length - 10} proizvoda...
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Ova akcija će promeniti cene za {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'}.
                            Molimo proverite pregled pre nego što nastavite.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isUpdating}
                        >
                            Otkaži
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-brown text-white rounded-lg hover:bg-dark-grey transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Ažuriranje...' : 'Ažuriraj cene'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
