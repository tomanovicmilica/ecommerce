import { useState } from 'react';
import { Save, Truck, MapPin, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import SettingsLayout from './SettingsLayout';
import { toast } from 'react-toastify';

interface ShippingZone {
    id: string;
    name: string;
    countries: string[];
    enabled: boolean;
}

interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    zoneId: string;
    enabled: boolean;
    type: 'flat_rate' | 'free' | 'weight_based' | 'calculated';
    cost: number;
    minOrderValue?: number;
    maxWeight?: number;
    estimatedDays: string;
    trackingEnabled: boolean;
}

interface ShippingConfig {
    zones: ShippingZone[];
    methods: ShippingMethod[];
    freeShippingThreshold: number;
    weightUnit: string;
    dimensionUnit: string;
    originAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    packagingOptions: string[];
    enableInsurance: boolean;
    enableSignatureRequired: boolean;
}

export default function ShippingSettings() {
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState<'zones' | 'methods' | 'general'>('general');

    const [settings, setSettings] = useState<ShippingConfig>({
        zones: [
            {
                id: 'domestic',
                name: 'Domestic',
                countries: ['US'],
                enabled: true
            },
            {
                id: 'international',
                name: 'International',
                countries: ['CA', 'UK', 'AU', 'DE', 'FR'],
                enabled: true
            }
        ],
        methods: [
            {
                id: 'standard',
                name: 'Standard Shipping',
                description: 'Regular delivery via postal service',
                zoneId: 'domestic',
                enabled: true,
                type: 'flat_rate',
                cost: 9.99,
                estimatedDays: '5-7',
                trackingEnabled: true
            },
            {
                id: 'express',
                name: 'Express Shipping',
                description: 'Fast delivery within 2-3 business days',
                zoneId: 'domestic',
                enabled: true,
                type: 'flat_rate',
                cost: 19.99,
                estimatedDays: '2-3',
                trackingEnabled: true
            },
            {
                id: 'free',
                name: 'Free Shipping',
                description: 'Free delivery for orders over $50',
                zoneId: 'domestic',
                enabled: true,
                type: 'free',
                cost: 0,
                minOrderValue: 50,
                estimatedDays: '7-10',
                trackingEnabled: false
            }
        ],
        freeShippingThreshold: 50,
        weightUnit: 'lbs',
        dimensionUnit: 'in',
        originAddress: {
            street: '123 Main Street',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US'
        },
        packagingOptions: ['Small Box', 'Medium Box', 'Large Box', 'Envelope'],
        enableInsurance: true,
        enableSignatureRequired: false
    });

    const handleSettingChange = (field: keyof ShippingConfig, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleAddressChange = (field: keyof typeof settings.originAddress, value: string) => {
        setSettings(prev => ({
            ...prev,
            originAddress: {
                ...prev.originAddress,
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleZoneChange = (zoneId: string, field: keyof ShippingZone, value: any) => {
        setSettings(prev => ({
            ...prev,
            zones: prev.zones.map(zone =>
                zone.id === zoneId ? { ...zone, [field]: value } : zone
            )
        }));
        setHasChanges(true);
    };

    const handleMethodChange = (methodId: string, field: keyof ShippingMethod, value: any) => {
        setSettings(prev => ({
            ...prev,
            methods: prev.methods.map(method =>
                method.id === methodId ? { ...method, [field]: value } : method
            )
        }));
        setHasChanges(true);
    };

    const addShippingMethod = () => {
        const newMethod: ShippingMethod = {
            id: `method_${Date.now()}`,
            name: 'New Shipping Method',
            description: '',
            zoneId: 'domestic',
            enabled: true,
            type: 'flat_rate',
            cost: 0,
            estimatedDays: '5-7',
            trackingEnabled: false
        };

        setSettings(prev => ({
            ...prev,
            methods: [...prev.methods, newMethod]
        }));
        setHasChanges(true);
    };

    const removeShippingMethod = (methodId: string) => {
        if (confirm('Are you sure you want to remove this shipping method?')) {
            setSettings(prev => ({
                ...prev,
                methods: prev.methods.filter(method => method.id !== methodId)
            }));
            setHasChanges(true);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual API call when backend is ready
            // await agent.Admin.updateShippingSettings(settings);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Shipping settings updated successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update shipping settings:', error);
            toast.error('Failed to update shipping settings');
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
                        <h1 className="text-3xl font-bold text-gray-900">Shipping Settings</h1>
                        <p className="text-gray-600 mt-1">Configure shipping zones, methods, and delivery options</p>
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
                            { id: 'general', name: 'General', icon: MapPin },
                            { id: 'zones', name: 'Shipping Zones', icon: MapPin },
                            { id: 'methods', name: 'Shipping Methods', icon: Truck }
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
                        {/* Origin Address */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Origin Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.originAddress.street}
                                        onChange={(e) => handleAddressChange('street', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.originAddress.city}
                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State/Province
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.originAddress.state}
                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP/Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        value={settings.originAddress.zipCode}
                                        onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <select
                                        value={settings.originAddress.country}
                                        onChange={(e) => handleAddressChange('country', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                        <option value="DE">Germany</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* General Options */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Options</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Weight Unit
                                    </label>
                                    <select
                                        value={settings.weightUnit}
                                        onChange={(e) => handleSettingChange('weightUnit', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="lbs">Pounds (lbs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="oz">Ounces (oz)</option>
                                        <option value="g">Grams (g)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Dimension Unit
                                    </label>
                                    <select
                                        value={settings.dimensionUnit}
                                        onChange={(e) => handleSettingChange('dimensionUnit', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="in">Inches (in)</option>
                                        <option value="cm">Centimeters (cm)</option>
                                        <option value="ft">Feet (ft)</option>
                                        <option value="m">Meters (m)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Free Shipping Threshold
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={settings.freeShippingThreshold}
                                        onChange={(e) => handleSettingChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableInsurance"
                                        checked={settings.enableInsurance}
                                        onChange={(e) => handleSettingChange('enableInsurance', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enableInsurance" className="ml-2 text-sm text-gray-700">
                                        Enable shipping insurance options
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableSignatureRequired"
                                        checked={settings.enableSignatureRequired}
                                        onChange={(e) => handleSettingChange('enableSignatureRequired', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enableSignatureRequired" className="ml-2 text-sm text-gray-700">
                                        Enable signature required option
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shipping Zones */}
                {activeTab === 'zones' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Zones</h2>
                        <div className="space-y-4">
                            {settings.zones.map((zone) => (
                                <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{zone.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                Countries: {zone.countries.join(', ')}
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={zone.enabled}
                                                onChange={(e) => handleZoneChange(zone.id, 'enabled', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Shipping Methods */}
                {activeTab === 'methods' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Shipping Methods</h2>
                            <button
                                onClick={addShippingMethod}
                                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Method
                            </button>
                        </div>

                        <div className="space-y-4">
                            {settings.methods.map((method) => (
                                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900">{method.name}</h3>
                                            <p className="text-sm text-gray-500">{method.description}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => removeShippingMethod(method.id)}
                                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={method.enabled}
                                                    onChange={(e) => handleMethodChange(method.id, 'enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {method.enabled && (
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Method Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.name}
                                                    onChange={(e) => handleMethodChange(method.id, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Type
                                                </label>
                                                <select
                                                    value={method.type}
                                                    onChange={(e) => handleMethodChange(method.id, 'type', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                >
                                                    <option value="flat_rate">Flat Rate</option>
                                                    <option value="free">Free</option>
                                                    <option value="weight_based">Weight Based</option>
                                                    <option value="calculated">Calculated</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Cost
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={method.cost}
                                                    onChange={(e) => handleMethodChange(method.id, 'cost', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Estimated Days
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.estimatedDays}
                                                    onChange={(e) => handleMethodChange(method.id, 'estimatedDays', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                    placeholder="5-7"
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.description}
                                                    onChange={(e) => handleMethodChange(method.id, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="md:col-span-4">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`tracking_${method.id}`}
                                                        checked={method.trackingEnabled}
                                                        onChange={(e) => handleMethodChange(method.id, 'trackingEnabled', e.target.checked)}
                                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`tracking_${method.id}`} className="ml-2 text-sm text-gray-700">
                                                        Enable tracking for this method
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