import { useState } from 'react';
import {
    ChevronDown,
    Trash2,
    Edit,
    Download,
    Mail,
    Package,
    Eye,
    EyeOff,
    CheckCircle,
    X
} from 'lucide-react';

interface BulkAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    variant: 'default' | 'danger' | 'success' | 'warning';
    requiresConfirmation?: boolean;
    confirmationMessage?: string;
}

interface Props {
    selectedItems: number[];
    totalItems: number;
    onSelectAll: (selectAll: boolean) => void;
    onBulkAction: (actionId: string, selectedItems: number[]) => void;
    actions: BulkAction[];
    entityName?: string; // "products", "orders", "users", etc.
}

export default function BulkActions({
    selectedItems,
    totalItems,
    onSelectAll,
    onBulkAction,
    actions,
    entityName = 'items'
}: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
    const [isExecuting, setIsExecuting] = useState(false);

    const handleSelectAll = () => {
        const isAllSelected = selectedItems.length === totalItems;
        onSelectAll(!isAllSelected);
    };

    const handleActionClick = (action: BulkAction) => {
        if (action.requiresConfirmation) {
            setConfirmAction(action);
        } else {
            executeBulkAction(action);
        }
        setIsOpen(false);
    };

    const executeBulkAction = async (action: BulkAction) => {
        setIsExecuting(true);
        try {
            await onBulkAction(action.id, selectedItems);
        } finally {
            setIsExecuting(false);
            setConfirmAction(null);
        }
    };

    const getVariantClasses = (variant: string) => {
        switch (variant) {
            case 'danger':
                return 'text-red-700 hover:bg-red-50';
            case 'success':
                return 'text-green-700 hover:bg-green-50';
            case 'warning':
                return 'text-yellow-700 hover:bg-yellow-50';
            default:
                return 'text-gray-700 hover:bg-gray-50';
        }
    };

    const isAllSelected = selectedItems.length === totalItems && totalItems > 0;
    const isPartiallySelected = selectedItems.length > 0 && selectedItems.length < totalItems;

    if (selectedItems.length === 0) {
        return null;
    }

    return (
        <>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Select All Checkbox */}
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(input) => {
                                    if (input) {
                                        input.indeterminate = isPartiallySelected;
                                    }
                                }}
                                onChange={handleSelectAll}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm font-medium text-indigo-900">
                                {isAllSelected
                                    ? `All ${totalItems} ${entityName} selected`
                                    : `${selectedItems.length} of ${totalItems} ${entityName} selected`
                                }
                            </span>
                        </label>

                        {/* Clear Selection */}
                        <button
                            onClick={() => onSelectAll(false)}
                            className="text-sm text-indigo-700 hover:text-indigo-900 font-medium"
                        >
                            Clear selection
                        </button>
                    </div>

                    {/* Bulk Actions Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            disabled={isExecuting}
                            className={`flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                                isExecuting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isExecuting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Bulk Actions
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isOpen && !isExecuting && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    {actions.map((action) => (
                                        <button
                                            key={action.id}
                                            onClick={() => handleActionClick(action)}
                                            className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${getVariantClasses(action.variant)}`}
                                        >
                                            {action.icon}
                                            <span className="ml-2">{action.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    {confirmAction.icon}
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirm {confirmAction.label}
                                </h3>
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-600">
                                {confirmAction.confirmationMessage ||
                                    `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedItems.length} selected ${entityName}? This action cannot be undone.`
                                }
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => executeBulkAction(confirmAction)}
                                disabled={isExecuting}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    confirmAction.variant === 'danger'
                                        ? 'bg-red-600 text-white hover:bg-red-700'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                } ${isExecuting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isExecuting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                        Processing...
                                    </>
                                ) : (
                                    confirmAction.label
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}

// Predefined bulk actions for common use cases
export const productBulkActions: BulkAction[] = [
    {
        id: 'activate',
        label: 'Activate Products',
        icon: <Eye className="w-4 h-4" />,
        variant: 'success'
    },
    {
        id: 'deactivate',
        label: 'Deactivate Products',
        icon: <EyeOff className="w-4 h-4" />,
        variant: 'warning'
    },
    {
        id: 'updatePrices',
        label: 'Update Prices',
        icon: <Edit className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'export',
        label: 'Export Selected',
        icon: <Download className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'delete',
        label: 'Delete Products',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'danger',
        requiresConfirmation: true
    }
];

export const orderBulkActions: BulkAction[] = [
    {
        id: 'updateStatus',
        label: 'Update Status',
        icon: <Package className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'markShipped',
        label: 'Mark as Shipped',
        icon: <CheckCircle className="w-4 h-4" />,
        variant: 'success'
    },
    {
        id: 'sendEmail',
        label: 'Send Email to Customers',
        icon: <Mail className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'export',
        label: 'Export Selected',
        icon: <Download className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'cancel',
        label: 'Cancel Orders',
        icon: <X className="w-4 h-4" />,
        variant: 'danger',
        requiresConfirmation: true,
        confirmationMessage: 'Are you sure you want to cancel the selected orders? Customers will be notified and refunds will be processed automatically.'
    }
];

export const userBulkActions: BulkAction[] = [
    {
        id: 'activate',
        label: 'Activate Users',
        icon: <CheckCircle className="w-4 h-4" />,
        variant: 'success'
    },
    {
        id: 'deactivate',
        label: 'Deactivate Users',
        icon: <X className="w-4 h-4" />,
        variant: 'warning'
    },
    {
        id: 'sendEmail',
        label: 'Send Email',
        icon: <Mail className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'export',
        label: 'Export Selected',
        icon: <Download className="w-4 h-4" />,
        variant: 'default'
    },
    {
        id: 'delete',
        label: 'Delete Users',
        icon: <Trash2 className="w-4 h-4" />,
        variant: 'danger',
        requiresConfirmation: true
    }
];