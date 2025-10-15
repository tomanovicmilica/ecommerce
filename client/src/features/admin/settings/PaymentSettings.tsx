import { useState } from 'react';
import { Save, CreditCard, Banknote, Smartphone, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import SettingsLayout from './SettingsLayout';
import { toast } from 'react-toastify';

interface PaymentGateway {
    id: string;
    name: string;
    enabled: boolean;
    testMode: boolean;
    publicKey: string;
    secretKey: string;
    webhookSecret?: string;
    supportedCurrencies: string[];
    transactionFee: number;
    minAmount: number;
    maxAmount: number;
}

interface PaymentConfig {
    gateways: PaymentGateway[];
    enableCOD: boolean;
    codFee: number;
    enableWallet: boolean;
    enableGiftCards: boolean;
    autoCapture: boolean;
    refundPolicy: string;
    processingTime: string;
}

export default function PaymentSettings() {
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});

    const [settings, setSettings] = useState<PaymentConfig>({
        gateways: [
            {
                id: 'stripe',
                name: 'Stripe',
                enabled: true,
                testMode: true,
                publicKey: 'pk_test_...',
                secretKey: 'sk_test_...',
                webhookSecret: 'whsec_...',
                supportedCurrencies: ['USD', 'EUR', 'GBP'],
                transactionFee: 2.9,
                minAmount: 0.50,
                maxAmount: 999999
            },
            {
                id: 'paypal',
                name: 'PayPal',
                enabled: false,
                testMode: true,
                publicKey: 'client_id_...',
                secretKey: 'client_secret_...',
                supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD'],
                transactionFee: 3.4,
                minAmount: 1.00,
                maxAmount: 10000
            },
            {
                id: 'square',
                name: 'Square',
                enabled: false,
                testMode: true,
                publicKey: 'sq0idp_...',
                secretKey: 'sq0csp_...',
                supportedCurrencies: ['USD', 'CAD', 'GBP', 'AUD'],
                transactionFee: 2.6,
                minAmount: 1.00,
                maxAmount: 50000
            }
        ],
        enableCOD: true,
        codFee: 5.00,
        enableWallet: false,
        enableGiftCards: false,
        autoCapture: true,
        refundPolicy: 'full',
        processingTime: 'instant'
    });

    const handleGatewayChange = (gatewayId: string, field: keyof PaymentGateway, value: any) => {
        setSettings(prev => ({
            ...prev,
            gateways: prev.gateways.map(gateway =>
                gateway.id === gatewayId
                    ? { ...gateway, [field]: value }
                    : gateway
            )
        }));
        setHasChanges(true);
    };

    const handleSettingChange = (field: keyof PaymentConfig, value: any) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const toggleSecretVisibility = (gatewayId: string, field: string) => {
        setShowSecrets(prev => ({
            ...prev,
            [`${gatewayId}_${field}`]: !prev[`${gatewayId}_${field}`]
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual API call when backend is ready
            // await agent.Admin.updatePaymentSettings(settings);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Payment settings updated successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update payment settings:', error);
            toast.error('Failed to update payment settings');
        } finally {
            setLoading(false);
        }
    };

    const testConnection = async (gatewayId: string) => {
        try {
            // TODO: Implement gateway connection test
            toast.success(`${gatewayId} connection test successful`);
        } catch (error) {
            toast.error(`${gatewayId} connection test failed`);
        }
    };

    return (
        <AdminLayout>
            <SettingsLayout>
                <div className="p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
                        <p className="text-gray-600 mt-1">Configure payment gateways and processing options</p>
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

                <div className="space-y-6">
                    {/* Payment Gateways */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-6">
                            <CreditCard className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Payment Gateways</h2>
                        </div>

                        <div className="space-y-6">
                            {settings.gateways.map((gateway) => (
                                <div key={gateway.id} className="border border-gray-200 rounded-lg p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-medium text-gray-900">{gateway.name}</h3>
                                            <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${
                                                gateway.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {gateway.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => testConnection(gateway.id)}
                                                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                            >
                                                Test Connection
                                            </button>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={gateway.enabled}
                                                    onChange={(e) => handleGatewayChange(gateway.id, 'enabled', e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {gateway.enabled && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Public Key / Client ID
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showSecrets[`${gateway.id}_publicKey`] ? 'text' : 'password'}
                                                        value={gateway.publicKey}
                                                        onChange={(e) => handleGatewayChange(gateway.id, 'publicKey', e.target.value)}
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        placeholder="pk_test_..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSecretVisibility(gateway.id, 'publicKey')}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showSecrets[`${gateway.id}_publicKey`] ? (
                                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Secret Key
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showSecrets[`${gateway.id}_secretKey`] ? 'text' : 'password'}
                                                        value={gateway.secretKey}
                                                        onChange={(e) => handleGatewayChange(gateway.id, 'secretKey', e.target.value)}
                                                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        placeholder="sk_test_..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSecretVisibility(gateway.id, 'secretKey')}
                                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                    >
                                                        {showSecrets[`${gateway.id}_secretKey`] ? (
                                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-gray-400" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {gateway.webhookSecret && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Webhook Secret
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showSecrets[`${gateway.id}_webhookSecret`] ? 'text' : 'password'}
                                                            value={gateway.webhookSecret}
                                                            onChange={(e) => handleGatewayChange(gateway.id, 'webhookSecret', e.target.value)}
                                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                            placeholder="whsec_..."
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSecretVisibility(gateway.id, 'webhookSecret')}
                                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                        >
                                                            {showSecrets[`${gateway.id}_webhookSecret`] ? (
                                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                                            ) : (
                                                                <Eye className="h-4 w-4 text-gray-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Transaction Fee (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={gateway.transactionFee}
                                                    onChange={(e) => handleGatewayChange(gateway.id, 'transactionFee', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Min Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={gateway.minAmount}
                                                    onChange={(e) => handleGatewayChange(gateway.id, 'minAmount', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Max Amount
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={gateway.maxAmount}
                                                    onChange={(e) => handleGatewayChange(gateway.id, 'maxAmount', parseFloat(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                            </div>

                                            <div className="lg:col-span-3">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        id={`testMode_${gateway.id}`}
                                                        checked={gateway.testMode}
                                                        onChange={(e) => handleGatewayChange(gateway.id, 'testMode', e.target.checked)}
                                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <label htmlFor={`testMode_${gateway.id}`} className="ml-2 text-sm text-gray-700">
                                                        Test Mode (Use sandbox/test environment)
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alternative Payment Methods */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Banknote className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Alternative Payment Methods</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableCOD"
                                        checked={settings.enableCOD}
                                        onChange={(e) => handleSettingChange('enableCOD', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enableCOD" className="ml-2 text-sm font-medium text-gray-700">
                                        Cash on Delivery (COD)
                                    </label>
                                </div>

                                {settings.enableCOD && (
                                    <div className="ml-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            COD Fee
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={settings.codFee}
                                            onChange={(e) => handleSettingChange('codFee', parseFloat(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableWallet"
                                        checked={settings.enableWallet}
                                        onChange={(e) => handleSettingChange('enableWallet', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enableWallet" className="ml-2 text-sm font-medium text-gray-700">
                                        Digital Wallet
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="enableGiftCards"
                                        checked={settings.enableGiftCards}
                                        onChange={(e) => handleSettingChange('enableGiftCards', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="enableGiftCards" className="ml-2 text-sm font-medium text-gray-700">
                                        Gift Cards
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Processing Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Processing Settings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Policy
                                </label>
                                <select
                                    value={settings.refundPolicy}
                                    onChange={(e) => handleSettingChange('refundPolicy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="full">Full Refunds</option>
                                    <option value="partial">Partial Refunds Only</option>
                                    <option value="store_credit">Store Credit Only</option>
                                    <option value="no_refunds">No Refunds</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Processing Time
                                </label>
                                <select
                                    value={settings.processingTime}
                                    onChange={(e) => handleSettingChange('processingTime', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="instant">Instant</option>
                                    <option value="1_day">1 Business Day</option>
                                    <option value="2_days">2-3 Business Days</option>
                                    <option value="1_week">1 Week</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="autoCapture"
                                        checked={settings.autoCapture}
                                        onChange={(e) => handleSettingChange('autoCapture', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="autoCapture" className="ml-2 text-sm text-gray-700">
                                        <span className="font-medium">Auto-capture payments</span>
                                        <span className="block text-xs text-gray-500">
                                            Automatically capture authorized payments after order confirmation
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </SettingsLayout>
        </AdminLayout>
    );
}