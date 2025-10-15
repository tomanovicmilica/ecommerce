import { useState } from 'react';
import {
    Download,
    FileText,
    FileSpreadsheet,
    Filter,
    CheckCircle,
    X,
    Loader
} from 'lucide-react';
// Removed date-fns dependency - using built-in date formatting

interface ExportOptions {
    format: 'csv' | 'xlsx' | 'pdf';
    dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
    filters?: Record<string, any>;
    columns?: string[];
}

interface Props {
    entityType: 'products' | 'orders' | 'users' | 'analytics';
    onExport: (options: ExportOptions) => Promise<void>;
    availableColumns?: Array<{ key: string; label: string }>;
    availableFilters?: Array<{ key: string; label: string; type: 'select' | 'text' | 'date' }>;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExportManager({
    entityType,
    onExport,
    availableColumns = [],
    availableFilters = [],
    isOpen,
    onClose
}: Props) {
    const [exportOptions, setExportOptions] = useState<ExportOptions>({
        format: 'csv',
        dateRange: 'month',
        columns: availableColumns.map(col => col.key),
        filters: {}
    });
    const [isExporting, setIsExporting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const formatOptions = [
        { value: 'csv', label: 'CSV', icon: FileText, description: 'Comma-separated values' },
        { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, description: 'Excel spreadsheet' },
        { value: 'pdf', label: 'PDF', icon: FileText, description: 'Portable document format' }
    ];

    const dateRangeOptions = [
        { value: 'all', label: 'All Time' },
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'This Week' },
        { value: 'month', label: 'This Month' },
        { value: 'quarter', label: 'This Quarter' },
        { value: 'year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await onExport(exportOptions);
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    const handleColumnToggle = (columnKey: string) => {
        setExportOptions(prev => ({
            ...prev,
            columns: prev.columns?.includes(columnKey)
                ? prev.columns.filter(col => col !== columnKey)
                : [...(prev.columns || []), columnKey]
        }));
    };

    const handleFilterChange = (filterKey: string, value: any) => {
        setExportOptions(prev => ({
            ...prev,
            filters: {
                ...prev.filters,
                [filterKey]: value
            }
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Export {entityType.charAt(0).toUpperCase() + entityType.slice(1)}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Configure your export settings and download your data
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Export Format */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Export Format
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {formatOptions.map((format) => {
                            const Icon = format.icon;
                            return (
                                <label
                                    key={format.value}
                                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                                        exportOptions.format === format.value
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="format"
                                        value={format.value}
                                        checked={exportOptions.format === format.value}
                                        onChange={(e) => setExportOptions(prev => ({
                                            ...prev,
                                            format: e.target.value as ExportOptions['format']
                                        }))}
                                        className="sr-only"
                                    />
                                    <Icon className="w-5 h-5 text-gray-400 mr-2" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{format.label}</p>
                                        <p className="text-xs text-gray-500">{format.description}</p>
                                    </div>
                                    {exportOptions.format === format.value && (
                                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-indigo-500" />
                                    )}
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Date Range */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Range
                    </label>
                    <select
                        value={exportOptions.dateRange}
                        onChange={(e) => setExportOptions(prev => ({
                            ...prev,
                            dateRange: e.target.value as ExportOptions['dateRange']
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        {dateRangeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {/* Custom Date Range */}
                    {exportOptions.dateRange === 'custom' && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={exportOptions.customStartDate || ''}
                                    onChange={(e) => setExportOptions(prev => ({
                                        ...prev,
                                        customStartDate: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={exportOptions.customEndDate || ''}
                                    onChange={(e) => setExportOptions(prev => ({
                                        ...prev,
                                        customEndDate: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Advanced Options Toggle */}
                <div className="mb-4">
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        <Filter className="w-4 h-4 mr-1" />
                        Advanced Options
                        <span className="ml-1">
                            {showAdvanced ? '▼' : '▶'}
                        </span>
                    </button>
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                    <div className="space-y-6 mb-6 p-4 bg-gray-50 rounded-lg">
                        {/* Column Selection */}
                        {availableColumns.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Columns to Export
                                </label>
                                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                    {availableColumns.map(column => (
                                        <label key={column.key} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={exportOptions.columns?.includes(column.key) || false}
                                                onChange={() => handleColumnToggle(column.key)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">{column.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Filters */}
                        {availableFilters.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Filters
                                </label>
                                <div className="space-y-3">
                                    {availableFilters.map(filter => (
                                        <div key={filter.key}>
                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                {filter.label}
                                            </label>
                                            {filter.type === 'text' && (
                                                <input
                                                    type="text"
                                                    value={exportOptions.filters?.[filter.key] || ''}
                                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                />
                                            )}
                                            {filter.type === 'date' && (
                                                <input
                                                    type="date"
                                                    value={exportOptions.filters?.[filter.key] || ''}
                                                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Export Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Format: {formatOptions.find(f => f.value === exportOptions.format)?.label}</li>
                        <li>• Date Range: {dateRangeOptions.find(d => d.value === exportOptions.dateRange)?.label}</li>
                        {exportOptions.columns && (
                            <li>• Columns: {exportOptions.columns.length} selected</li>
                        )}
                        {Object.keys(exportOptions.filters || {}).length > 0 && (
                            <li>• Filters: {Object.keys(exportOptions.filters || {}).length} applied</li>
                        )}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        disabled={isExporting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting || (exportOptions.columns?.length === 0)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isExporting ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Utility function to generate CSV content
export function generateCSV(data: any[], columns: string[]): string {
    const headers = columns.join(',');
    const rows = data.map(item =>
        columns.map(col => {
            const value = item[col];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
        }).join(',')
    );

    return [headers, ...rows].join('\n');
}

// Utility function to trigger file download
export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}