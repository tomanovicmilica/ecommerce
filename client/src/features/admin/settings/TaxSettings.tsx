import { useState } from 'react';
import { Save, Calculator, MapPin, Plus, Trash2, AlertCircle } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import SettingsLayout from './SettingsLayout';
import { toast } from 'react-toastify';

interface TaxRate {
    id: string;
    name: string;
    rate: number;
    type: 'percentage' | 'fixed';
    country: string;
    state?: string;
    city?: string;
    zipCode?: string;
    enabled: boolean;
    priority: number;
    taxClass: string;
    includeShipping: boolean;
}

interface TaxClass {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
}

interface TaxConfig {
    enabled: boolean;
    pricesIncludeTax: boolean;
    displayPricesIncludingTax: boolean;
    enableTaxCalculation: boolean;
    defaultTaxClass: string;
    shippingTaxable: boolean;
    digitalGoodsTaxable: boolean;
    taxRoundingMode: 'round' | 'floor' | 'ceil';
    taxClasses: TaxClass[];
    taxRates: TaxRate[];
    taxReports: boolean;
    compoundTaxes: boolean;
}

export default function TaxSettings() {
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'classes' | 'rates'>('general');

    const [settings, setSettings] = useState<TaxConfig>({
        enabled: true,
        pricesIncludeTax: false,
        displayPricesIncludingTax: true,
        enableTaxCalculation: true,
        defaultTaxClass: 'standard',
        shippingTaxable: true,
        digitalGoodsTaxable: true,
        taxRoundingMode: 'round',
        compoundTaxes: false,
        taxReports: true,
        taxClasses: [
            {
                id: 'standard',
                name: 'Standard Rate',
                description: 'Standard tax rate for most products',
                enabled: true
            },
            {
                id: 'reduced',
                name: 'Reduced Rate',
                description: 'Reduced tax rate for essential items',
                enabled: true
            },
            {
                id: 'zero',
                name: 'Zero Rate',
                description: 'No tax applied',
                enabled: true
            },
            {
                id: 'exempt',
                name: 'Tax Exempt',
                description: 'Exempt from all taxes',
                enabled: true
            }
        ],
        taxRates: [
            {
                id: 'us_standard',
                name: 'US Standard Sales Tax',
                rate: 8.25,
                type: 'percentage',
                country: 'US',
                state: 'CA',
                enabled: true,
                priority: 1,
                taxClass: 'standard',
                includeShipping: true
            },
            {
                id: 'eu_vat',
                name: 'EU VAT Standard',
                rate: 21,
                type: 'percentage',
                country: 'DE',
                enabled: true,
                priority: 1,
                taxClass: 'standard',
                includeShipping: true
            },
            {
                id: 'uk_vat',
                name: 'UK VAT',
                rate: 20,
                type: 'percentage',
                country: 'GB',
                enabled: true,
                priority: 1,
                taxClass: 'standard',
                includeShipping: true
            }
        ]
    });

    const handleSettingChange = (field: keyof TaxConfig, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleTaxClassChange = (classId: string, field: keyof TaxClass, value: any) => {
        setSettings(prev => ({
            ...prev,
            taxClasses: prev.taxClasses.map(taxClass =>
                taxClass.id === classId ? { ...taxClass, [field]: value } : taxClass
            )
        }));
        setHasChanges(true);
    };

    const handleTaxRateChange = (rateId: string, field: keyof TaxRate, value: any) => {
        setSettings(prev => ({
            ...prev,
            taxRates: prev.taxRates.map(rate =>
                rate.id === rateId ? { ...rate, [field]: value } : rate
            )
        }));
        setHasChanges(true);
    };

    const addTaxClass = () => {
        const newClass: TaxClass = {
            id: `class_${Date.now()}`,
            name: 'New Tax Class',
            description: '',
            enabled: true
        };

        setSettings(prev => ({
            ...prev,
            taxClasses: [...prev.taxClasses, newClass]
        }));
        setHasChanges(true);
    };

    const removeTaxClass = (classId: string) => {
        if (confirm('Are you sure you want to remove this tax class?')) {
            setSettings(prev => ({
                ...prev,
                taxClasses: prev.taxClasses.filter(taxClass => taxClass.id !== classId)
            }));
            setHasChanges(true);
        }
    };

    const addTaxRate = () => {
        const newRate: TaxRate = {
            id: `rate_${Date.now()}`,
            name: 'New Tax Rate',
            rate: 0,
            type: 'percentage',
            country: 'US',
            enabled: true,
            priority: 1,
            taxClass: 'standard',
            includeShipping: false
        };

        setSettings(prev => ({
            ...prev,
            taxRates: [...prev.taxRates, newRate]
        }));
        setHasChanges(true);
    };

    const removeTaxRate = (rateId: string) => {
        if (confirm('Are you sure you want to remove this tax rate?')) {
            setSettings(prev => ({
                ...prev,
                taxRates: prev.taxRates.filter(rate => rate.id !== rateId)
            }));
            setHasChanges(true);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual API call when backend is ready
            // await agent.Admin.updateTaxSettings(settings);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Tax settings updated successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update tax settings:', error);
            toast.error('Failed to update tax settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <SettingsLayout>
                <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tax Settings</h1>
                        <p className="text-gray-600 mt-1">Configure tax classes, rates, and calculation rules</p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || loading}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {hasChanges && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                            <p className="text-yellow-800">You have unsaved changes. Don't forget to save your settings.</p>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'general', name: 'General', icon: Calculator },
                            { id: 'classes', name: 'Tax Classes', icon: Calculator },
                            { id: 'rates', name: 'Tax Rates', icon: MapPin }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="mr-2 h-5 w-5" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* General Settings */}
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tax Configuration</h2>

                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enabled"
                                        checked={settings.enabled}
                                        onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enabled" className="ml-2 text-sm font-medium text-gray-700">
                                        Enable tax calculation
                                    </label>
                                </div>

                                {settings.enabled && (
                                    <div className="ml-6 space-y-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="pricesIncludeTax"
                                                checked={settings.pricesIncludeTax}
                                                onChange={(e) => handleSettingChange('pricesIncludeTax', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="pricesIncludeTax" className="ml-2 text-sm text-gray-700">
                                                Product prices include tax
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="displayPricesIncludingTax"
                                                checked={settings.displayPricesIncludingTax}
                                                onChange={(e) => handleSettingChange('displayPricesIncludingTax', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="displayPricesIncludingTax" className="ml-2 text-sm text-gray-700">
                                                Display prices including tax
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="shippingTaxable"
                                                checked={settings.shippingTaxable}
                                                onChange={(e) => handleSettingChange('shippingTaxable', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="shippingTaxable" className="ml-2 text-sm text-gray-700">
                                                Shipping is taxable
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="digitalGoodsTaxable"
                                                checked={settings.digitalGoodsTaxable}
                                                onChange={(e) => handleSettingChange('digitalGoodsTaxable', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="digitalGoodsTaxable" className="ml-2 text-sm text-gray-700">
                                                Digital goods are taxable
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="compoundTaxes"
                                                checked={settings.compoundTaxes}
                                                onChange={(e) => handleSettingChange('compoundTaxes', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                            />
                                            <label htmlFor="compoundTaxes" className="ml-2 text-sm text-gray-700">
                                                Enable compound taxes
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Default Tax Class
                                                </label>
                                                <select
                                                    value={settings.defaultTaxClass}
                                                    onChange={(e) => handleSettingChange('defaultTaxClass', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    {settings.taxClasses.map(taxClass => (
                                                        <option key={taxClass.id} value={taxClass.id}>
                                                            {taxClass.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tax Rounding
                                                </label>
                                                <select
                                                    value={settings.taxRoundingMode}
                                                    onChange={(e) => handleSettingChange('taxRoundingMode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="round">Round to nearest cent</option>
                                                    <option value="floor">Round down</option>
                                                    <option value="ceil">Round up</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tax Classes */}
                {activeTab === 'classes' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Tax Classes</h2>
                            <button
                                onClick={addTaxClass}
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Class
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.taxClasses.map((taxClass) => (
                                <div key={taxClass.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{taxClass.name}</h3>
                                            <p className="text-sm text-gray-500">{taxClass.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => removeTaxClass(taxClass.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={taxClass.enabled}
                                                    onChange={(e) => handleTaxClassChange(taxClass.id, 'enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {taxClass.enabled && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Class Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={taxClass.name}
                                                    onChange={(e) => handleTaxClassChange(taxClass.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={taxClass.description}
                                                    onChange={(e) => handleTaxClassChange(taxClass.id, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tax Rates */}
                {activeTab === 'rates' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Tax Rates</h2>
                            <button
                                onClick={addTaxRate}
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Rate
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.taxRates.map((rate) => (
                                <div key={rate.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{rate.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {rate.rate}{rate.type === 'percentage' ? '%' : ' fixed'} - {rate.country}
                                                {rate.state && `, ${rate.state}`}
                                                {rate.city && `, ${rate.city}`}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => removeTaxRate(rate.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={rate.enabled}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {rate.enabled && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Rate Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rate.name}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Rate
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={rate.rate}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={rate.type}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="percentage">Percentage</option>
                                                    <option value="fixed">Fixed Amount</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Country
                                                </label>
                                                <select
                                                    value={rate.country}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'country', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="US">United States</option>
                                                    <option value="CA">Canada</option>
                                                    <option value="GB">United Kingdom</option>
                                                    <option value="DE">Germany</option>
                                                    <option value="FR">France</option>
                                                    <option value="AU">Australia</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tax Class
                                                </label>
                                                <select
                                                    value={rate.taxClass}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'taxClass', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    {settings.taxClasses.map(taxClass => (
                                                        <option key={taxClass.id} value={taxClass.id}>
                                                            {taxClass.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    State/Province
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rate.state || ''}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'state', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Optional"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rate.city || ''}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'city', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Optional"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    ZIP Code
                                                </label>
                                                <input
                                                    type="text"
                                                    value={rate.zipCode || ''}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'zipCode', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="Optional"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Priority
                                                </label>
                                                <input
                                                    type="number"
                                                    value={rate.priority}
                                                    onChange={(e) => handleTaxRateChange(rate.id, 'priority', parseInt(e.target.value) || 1)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    min="1"
                                                />
                                            </div>

                                            <div className="lg:col-span-5">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`includeShipping_${rate.id}`}
                                                        checked={rate.includeShipping}
                                                        onChange={(e) => handleTaxRateChange(rate.id, 'includeShipping', e.target.checked)}
                                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`includeShipping_${rate.id}`} className="ml-2 text-sm text-gray-700">
                                                        Apply tax to shipping costs
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}