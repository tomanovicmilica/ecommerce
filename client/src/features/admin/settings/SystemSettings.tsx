import { useState } from 'react';
import { Save, Globe, Mail, Clock, Database, Shield, AlertCircle } from 'lucide-react';
import AdminLayout from '../layout/AdminLayout';
import SettingsLayout from './SettingsLayout';
import { toast } from 'react-toastify';

interface SystemConfig {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    currency: string;
    language: string;
    maintenanceMode: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    allowRegistration: boolean;
    requireEmailVerification: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    backupFrequency: string;
    logLevel: string;
}

export default function SystemSettings() {
    const [loading, setLoading] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const [settings, setSettings] = useState<SystemConfig>({
        siteName: 'E-Commerce Store',
        siteDescription: 'Your premier online shopping destination',
        adminEmail: 'admin@ecommerce.com',
        timezone: 'UTC',
        currency: 'USD',
        language: 'en',
        maintenanceMode: false,
        emailNotifications: true,
        smsNotifications: false,
        allowRegistration: true,
        requireEmailVerification: true,
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        backupFrequency: 'daily',
        logLevel: 'info'
    });

    const handleInputChange = (field: keyof SystemConfig, value: string | number | boolean) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // TODO: Replace with actual API call when backend is ready
            // await agent.Admin.updateSystemSettings(settings);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('System settings updated successfully');
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to update settings:', error);
            toast.error('Failed to update system settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            setSettings({
                siteName: 'E-Commerce Store',
                siteDescription: 'Your premier online shopping destination',
                adminEmail: 'admin@ecommerce.com',
                timezone: 'UTC',
                currency: 'USD',
                language: 'en',
                maintenanceMode: false,
                emailNotifications: true,
                smsNotifications: false,
                allowRegistration: true,
                requireEmailVerification: true,
                sessionTimeout: 30,
                maxLoginAttempts: 5,
                backupFrequency: 'daily',
                logLevel: 'info'
            });
            setHasChanges(true);
        }
    };

    return (
        <AdminLayout>
            <SettingsLayout>
                <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-gray-600 mt-1">Configure general system settings and preferences</p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Reset to Default
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || loading}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
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
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Globe className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter site name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Description
                                </label>
                                <textarea
                                    value={settings.siteDescription}
                                    onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter site description"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone
                                </label>
                                <select
                                    value={settings.timezone}
                                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="Europe/London">London (GMT)</option>
                                    <option value="Europe/Berlin">Berlin (CET)</option>
                                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Currency
                                </label>
                                <select
                                    value={settings.currency}
                                    onChange={(e) => handleInputChange('currency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="JPY">JPY - Japanese Yen</option>
                                    <option value="CAD">CAD - Canadian Dollar</option>
                                    <option value="AUD">AUD - Australian Dollar</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <select
                                    value={settings.language}
                                    onChange={(e) => handleInputChange('language', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Shield className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={settings.sessionTimeout}
                                    onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value) || 0)}
                                    min="5"
                                    max="1440"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value) || 0)}
                                    min="3"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="allowRegistration"
                                        checked={settings.allowRegistration}
                                        onChange={(e) => handleInputChange('allowRegistration', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="allowRegistration" className="ml-2 text-sm text-gray-700">
                                        Allow user registration
                                    </label>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="requireEmailVerification"
                                        checked={settings.requireEmailVerification}
                                        onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="requireEmailVerification" className="ml-2 text-sm text-gray-700">
                                        Require email verification
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Mail className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={settings.emailNotifications}
                                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                                    Enable email notifications
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="smsNotifications"
                                    checked={settings.smsNotifications}
                                    onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
                                    Enable SMS notifications
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* System Maintenance */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center mb-4">
                            <Database className="w-5 h-5 text-indigo-600 mr-2" />
                            <h2 className="text-xl font-semibold text-gray-900">System Maintenance</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Backup Frequency
                                </label>
                                <select
                                    value={settings.backupFrequency}
                                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Log Level
                                </label>
                                <select
                                    value={settings.logLevel}
                                    onChange={(e) => handleInputChange('logLevel', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="error">Error</option>
                                    <option value="warn">Warning</option>
                                    <option value="info">Info</option>
                                    <option value="debug">Debug</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="maintenanceMode"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                                        className="h-4 w-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                                    />
                                    <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
                                        <span className="font-medium">Maintenance Mode</span>
                                        <span className="block text-xs text-gray-500">
                                            When enabled, the site will be unavailable to customers
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