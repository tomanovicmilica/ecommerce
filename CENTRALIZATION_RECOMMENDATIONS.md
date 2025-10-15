# Centralization & Refactoring Recommendations

## Executive Summary

This document identifies areas where your React e-commerce application can benefit from centralization to reduce component complexity, improve maintainability, and eliminate code duplication.

---

## 🎯 Top Priority Centralizations

### 1. **Create Reusable CRUD Hook Pattern**

**Problem:** Components like `CategoryManagement`, `ProductManagement`, `OrderManagement` all repeat the same CRUD logic:
- Fetch data on mount
- Loading states
- Error handling with toast
- Create/Update/Delete operations
- Search/filter state management

**Solution:** Create a generic `useAdminCRUD` hook

**File:** `src/app/hooks/useAdminCRUD.tsx`

```typescript
interface UseCRUDOptions<T> {
  entityName: string; // 'products', 'categories', etc.
  fetchFn: (params?: URLSearchParams) => Promise<T[]>;
  createFn?: (data: any) => Promise<T>;
  updateFn?: (id: number, data: any) => Promise<T>;
  deleteFn?: (id: number) => Promise<void>;
  searchFields?: (keyof T)[]; // Fields to search in
}

export function useAdminCRUD<T extends { id: number }>(options: UseCRUDOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    fetchItems();
  }, [searchTerm, filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const data = await options.fetchFn(params);
      setItems(data);
    } catch (error) {
      console.error(`Failed to fetch ${options.entityName}:`, error);
      toast.error(`Failed to load ${options.entityName}`);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (data: any) => {
    if (!options.createFn) return;
    try {
      await options.createFn(data);
      toast.success(`${options.entityName} created successfully`);
      await fetchItems();
    } catch (error) {
      console.error(`Failed to create ${options.entityName}:`, error);
      toast.error(`Failed to create ${options.entityName}`);
      throw error;
    }
  };

  const updateItem = async (id: number, data: any) => {
    if (!options.updateFn) return;
    try {
      await options.updateFn(id, data);
      toast.success(`${options.entityName} updated successfully`);
      await fetchItems();
    } catch (error) {
      console.error(`Failed to update ${options.entityName}:`, error);
      toast.error(`Failed to update ${options.entityName}`);
      throw error;
    }
  };

  const deleteItem = async (id: number) => {
    if (!options.deleteFn) return;
    if (!confirm(`Are you sure you want to delete this ${options.entityName}?`)) return;
    try {
      await options.deleteFn(id);
      toast.success(`${options.entityName} deleted successfully`);
      await fetchItems();
    } catch (error) {
      console.error(`Failed to delete ${options.entityName}:`, error);
      toast.error(`Failed to delete ${options.entityName}`);
      throw error;
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => {
      return options.searchFields?.some(field => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [items, searchTerm]);

  return {
    items,
    filteredItems,
    loading,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    selectedItems,
    setSelectedItems,
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  };
}
```

**Usage in CategoryManagement.tsx:**

```typescript
export default function CategoryManagement() {
  const {
    filteredItems: categories,
    loading,
    searchTerm,
    setSearchTerm,
    createItem,
    updateItem,
    deleteItem
  } = useAdminCRUD<Category>({
    entityName: 'category',
    fetchFn: agent.Admin.getCategories,
    createFn: agent.Admin.createCategory,
    updateFn: agent.Admin.updateCategory,
    deleteFn: agent.Admin.deleteCategory,
    searchFields: ['name', 'description']
  });

  // Component now has 70% less code!
  // Just focus on UI rendering
}
```

**Impact:**
- ✅ Reduces component code by **60-70%**
- ✅ Standardizes CRUD operations across all admin pages
- ✅ Makes adding new admin pages trivial (< 50 lines of code)

---

### 2. **Create Reusable Admin Table Component**

**Problem:** Every admin page recreates table structure, headers, loading states, empty states, and row actions.

**Solution:** Create `AdminDataTable` component

**File:** `src/components/admin/AdminDataTable.tsx`

```typescript
interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  actions?: {
    icon: React.ReactNode;
    label: string;
    onClick: (item: T) => void;
    color?: 'primary' | 'danger' | 'warning';
  }[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function AdminDataTable<T extends { id: number }>({
  data,
  columns,
  loading,
  selectable,
  selectedIds = [],
  onSelectionChange,
  actions = [],
  emptyMessage = 'No data found',
  emptyIcon
}: AdminDataTableProps<T>) {
  if (loading) return <LoadingComponent />;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data.map(item => item.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-light-grey/20">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-4 py-3 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-3 text-right">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map(item => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </td>
              )}
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render
                    ? col.render(item)
                    : String(item[col.key as keyof T] || '-')}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-2">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(item)}
                        className={`p-1 hover:text-${action.color || 'brown'} transition-colors`}
                        title={action.label}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-12">
          {emptyIcon && <div className="mb-4">{emptyIcon}</div>}
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
```

**Usage:**

```typescript
<AdminDataTable
  data={categories}
  columns={[
    {
      key: 'name',
      label: 'Category',
      render: (cat) => (
        <div className="flex items-center space-x-3">
          <Folder className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="font-medium">{cat.name}</p>
            <p className="text-xs text-gray-500">ID: {cat.id}</p>
          </div>
        </div>
      )
    },
    { key: 'description', label: 'Description' },
    {
      key: 'productCount',
      label: 'Products',
      render: (cat) => (
        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
          {cat.productCount} products
        </span>
      )
    }
  ]}
  actions={[
    { icon: <Edit />, label: 'Edit', onClick: handleEdit },
    { icon: <Trash2 />, label: 'Delete', onClick: handleDelete, color: 'danger' }
  ]}
  selectable
  selectedIds={selectedCategories}
  onSelectionChange={setSelectedCategories}
  loading={loading}
  emptyMessage="No categories found"
/>
```

**Impact:**
- ✅ Eliminates 100+ lines of table boilerplate per component
- ✅ Consistent UI/UX across all admin tables
- ✅ Easy to add new admin pages

---

### 3. **Create Reusable Modal System**

**Problem:** Every component creates its own modal with repeated backdrop, positioning, and close logic.

**Solution:** Create centralized modal context + component

**File:** `src/components/common/Modal.tsx`

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg p-6 w-full ${sizeClasses[size]} mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">{children}</div>
        {footer && <div className="border-t pt-4">{footer}</div>}
      </div>
    </div>
  );
}
```

**Usage:**

```typescript
<Modal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  title="Create Category"
  footer={
    <>
      <button onClick={() => setShowCreateModal(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </>
  }
>
  <CategoryForm onSubmit={handleCreate} />
</Modal>
```

---

### 4. **Create Centralized Form Components**

**Problem:** Forms repeat field validation, error display, and styling.

**Solution:** Create reusable form components

**File:** `src/components/forms/FormField.tsx`

```typescript
interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select';
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[]; // For select
  rows?: number; // For textarea
}

export function FormField({
  label,
  name,
  type = 'text',
  required,
  error,
  value,
  onChange,
  placeholder,
  options,
  rows = 3
}: FormFieldProps) {
  const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
    error ? 'border-red-500' : 'border-gray-300'
  }`;

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={baseClasses}
          placeholder={placeholder}
          required={required}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          placeholder={placeholder}
          required={required}
        />
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

**Usage:**

```typescript
<FormField
  label="Category Name"
  name="name"
  value={name}
  onChange={setName}
  required
  error={errors.name}
  placeholder="Enter category name"
/>
```

---

### 5. **Create Centralized Filter Component**

**Problem:** Every admin page recreates search and filter UI.

**Solution:** Reusable `AdminFilters` component

**File:** `src/components/admin/AdminFilters.tsx`

```typescript
interface FilterConfig {
  type: 'search' | 'select' | 'date';
  key: string;
  label?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

interface AdminFiltersProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}

export function AdminFilters({ filters, values, onChange }: AdminFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filters.map(filter => {
          if (filter.type === 'search') {
            return (
              <div key={filter.key} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={filter.placeholder || 'Search...'}
                  value={values[filter.key] || ''}
                  onChange={(e) => onChange(filter.key, e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-brown"
                />
              </div>
            );
          }

          if (filter.type === 'select') {
            return (
              <select
                key={filter.key}
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brown"
              >
                <option value="">{filter.label || 'All'}</option>
                {filter.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
```

**Usage:**

```typescript
<AdminFilters
  filters={[
    { type: 'search', key: 'search', placeholder: 'Search products...' },
    {
      type: 'select',
      key: 'category',
      label: 'All Categories',
      options: categories.map(c => ({ value: c.name, label: c.name }))
    },
    {
      type: 'select',
      key: 'status',
      label: 'All Statuses',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    }
  ]}
  values={filters}
  onChange={(key, value) => setFilters({ ...filters, [key]: value })}
/>
```

---

### 6. **Create Centralized Status Badge Component**

**Problem:** Status badges are repeated with similar logic across components.

**Solution:** Reusable `StatusBadge` component

**File:** `src/components/common/StatusBadge.tsx`

```typescript
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusConfig {
  color: StatusType;
  label: string;
}

const statusStyles: Record<StatusType, string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200'
};

interface StatusBadgeProps {
  status: string;
  mapping: Record<string, StatusConfig>;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, mapping, size = 'md' }: StatusBadgeProps) {
  const config = mapping[status] || { color: 'neutral', label: status };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${
        statusStyles[config.color]
      } ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
```

**Usage:**

```typescript
// Define once per domain
const orderStatusMapping: Record<string, StatusConfig> = {
  'Delivered': { color: 'success', label: 'Delivered' },
  'Shipped': { color: 'info', label: 'Shipped' },
  'Processing': { color: 'warning', label: 'Processing' },
  'Cancelled': { color: 'error', label: 'Cancelled' },
  'Pending': { color: 'neutral', label: 'Pending' }
};

// Use anywhere
<StatusBadge status={order.status} mapping={orderStatusMapping} />
```

---

### 7. **Create API Request Wrapper Hook**

**Problem:** Every component repeats loading/error state management for API calls.

**Solution:** Create `useApiRequest` hook

**File:** `src/app/hooks/useApiRequest.tsx`

```typescript
interface UseApiRequestOptions<T> {
  immediate?: boolean; // Auto-execute on mount
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiRequest<T = any, Args extends any[] = any[]>(
  apiFunction: (...args: Args) => Promise<T>,
  options: UseApiRequestOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = async (...args: Args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);

      if (options.successMessage) {
        toast.success(options.successMessage);
      }

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err);

      if (options.errorMessage) {
        toast.error(options.errorMessage);
      }

      options.onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute };
}
```

**Usage:**

```typescript
// Simple case
const { data: categories, loading, execute: fetchCategories } = useApiRequest(
  agent.Admin.getCategories,
  {
    immediate: true,
    errorMessage: 'Failed to load categories'
  }
);

// Complex case with args
const { loading: deleting, execute: deleteCategory } = useApiRequest(
  agent.Admin.deleteCategory,
  {
    successMessage: 'Category deleted',
    onSuccess: () => fetchCategories()
  }
);

// Usage
await deleteCategory(categoryId);
```

---

### 8. **Create Centralized Confirmation Dialog**

**Problem:** Every delete operation uses native `confirm()` which is ugly and not customizable.

**Solution:** Reusable `ConfirmDialog` component + context

**File:** `src/components/common/ConfirmDialog.tsx`

```typescript
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 text-white rounded-lg ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Context for global usage
const ConfirmDialogContext = createContext<{
  confirm: (options: Omit<ConfirmDialogProps, 'isOpen' | 'onConfirm' | 'onCancel'>) => Promise<boolean>;
} | null>(null);

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<any>(null);

  const confirm = (options: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        ...options,
        isOpen: true,
        onConfirm: () => {
          resolve(true);
          setDialogState(null);
        },
        onCancel: () => {
          resolve(false);
          setDialogState(null);
        }
      });
    });
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      {dialogState && <ConfirmDialog {...dialogState} />}
    </ConfirmDialogContext.Provider>
  );
}

export const useConfirm = () => {
  const context = useContext(ConfirmDialogContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmDialogProvider');
  return context.confirm;
};
```

**Usage:**

```typescript
const confirm = useConfirm();

const handleDelete = async (id: number) => {
  const confirmed = await confirm({
    title: 'Delete Category',
    message: 'Are you sure you want to delete this category? This action cannot be undone.',
    confirmText: 'Delete',
    variant: 'danger'
  });

  if (confirmed) {
    await deleteCategory(id);
  }
};
```

---

### 9. **Create Constants File for Repeated Values**

**Problem:** Colors, statuses, configurations are hardcoded throughout the app.

**Solution:** Centralize constants

**File:** `src/app/constants/admin.ts`

```typescript
export const ADMIN_CONSTANTS = {
  STATUS_COLORS: {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Inactive: 'bg-gray-100 text-gray-800 border-gray-200',
    'Out of Stock': 'bg-red-100 text-red-800 border-red-200'
  },

  ORDER_STATUSES: [
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Cancelled', label: 'Cancelled' }
  ],

  PRODUCT_TYPES: [
    { value: '0', label: '📦 Physical' },
    { value: '1', label: '💾 Digital' }
  ],

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
  },

  DEBOUNCE_DELAY: 500
};
```

**File:** `src/app/constants/messages.ts`

```typescript
export const MESSAGES = {
  SUCCESS: {
    CREATED: (entity: string) => `${entity} created successfully`,
    UPDATED: (entity: string) => `${entity} updated successfully`,
    DELETED: (entity: string) => `${entity} deleted successfully`
  },
  ERROR: {
    LOAD_FAILED: (entity: string) => `Failed to load ${entity}`,
    CREATE_FAILED: (entity: string) => `Failed to create ${entity}`,
    UPDATE_FAILED: (entity: string) => `Failed to update ${entity}`,
    DELETE_FAILED: (entity: string) => `Failed to delete ${entity}`
  },
  CONFIRM: {
    DELETE: (entity: string) => `Are you sure you want to delete this ${entity}?`
  }
};
```

---

### 10. **Create Utility Functions File**

**Problem:** Currency formatting, date formatting, etc. are repeated.

**Solution:** Already have `src/app/util/util.ts` - expand it!

**File:** `src/app/util/util.ts` (additions)

```typescript
// Add to existing file:

export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'short') {
    return d.toLocaleDateString('sr-RS');
  }
  return d.toLocaleDateString('sr-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'Active': 'bg-green-100 text-green-800',
    'Inactive': 'bg-gray-100 text-gray-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Processing': 'bg-yellow-100 text-yellow-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
```

---

## 📊 Implementation Priority Matrix

| Centralization | Impact | Effort | Priority | Lines Saved |
|----------------|--------|--------|----------|-------------|
| useAdminCRUD Hook | 🔥🔥🔥 | Medium | **HIGH** | ~500 |
| AdminDataTable | 🔥🔥🔥 | High | **HIGH** | ~300 |
| AdminFilters | 🔥🔥 | Low | **HIGH** | ~200 |
| useApiRequest | 🔥🔥🔥 | Medium | **MEDIUM** | ~400 |
| Modal Component | 🔥🔥 | Low | **MEDIUM** | ~150 |
| FormField | 🔥 | Low | **MEDIUM** | ~100 |
| StatusBadge | 🔥 | Low | **LOW** | ~50 |
| ConfirmDialog | 🔥 | Medium | **LOW** | ~80 |
| Constants | 🔥 | Low | **LOW** | ~100 |

---

## 🎯 Before & After Example

### Before (CategoryManagement.tsx): **269 lines**

```typescript
export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await agent.Admin.getCategories();
      setCategories(response);
    } catch (error) {
      console.error('Failed:', error);
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  // ... 200 more lines
}
```

### After: **~80 lines (70% reduction!)**

```typescript
export default function CategoryManagement() {
  const {
    filteredItems: categories,
    loading,
    searchTerm,
    setSearchTerm,
    createItem,
    updateItem,
    deleteItem
  } = useAdminCRUD<Category>({
    entityName: 'category',
    fetchFn: agent.Admin.getCategories,
    createFn: agent.Admin.createCategory,
    updateFn: agent.Admin.updateCategory,
    deleteFn: agent.Admin.deleteCategory,
    searchFields: ['name']
  });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Category Management"
        count={categories.length}
        onAdd={() => setShowModal(true)}
      />

      <AdminFilters
        filters={[
          { type: 'search', key: 'search', placeholder: 'Search categories...' }
        ]}
        values={{ search: searchTerm }}
        onChange={(key, val) => setSearchTerm(val)}
      />

      <AdminDataTable
        data={categories}
        columns={categoryColumns}
        actions={[
          { icon: <Edit />, label: 'Edit', onClick: (cat) => handleEdit(cat) },
          { icon: <Trash2 />, label: 'Delete', onClick: (cat) => deleteItem(cat.id) }
        ]}
        loading={loading}
      />
    </AdminLayout>
  );
}
```

---

## 📈 Expected Benefits

### Code Reduction
- **60-70% less code** in admin components
- **300-500 lines saved** per admin page
- **~2000 total lines removed** across all admin pages

### Maintainability
- ✅ Single source of truth for UI patterns
- ✅ Consistent behavior across features
- ✅ Easier to add new features
- ✅ Simpler testing (test shared components once)

### Performance
- ✅ Less bundle size (shared components)
- ✅ Better memoization opportunities
- ✅ Consistent loading states

### Developer Experience
- ✅ Faster feature development
- ✅ Less context switching
- ✅ Easier onboarding for new developers
- ✅ Less bug surface area

---

## 🚀 Recommended Implementation Order

### Phase 1: Foundation (Week 1)
1. Create `useAdminCRUD` hook
2. Create `AdminDataTable` component
3. Create `AdminFilters` component
4. Refactor `CategoryManagement` as proof of concept

### Phase 2: Core Components (Week 2)
5. Create `Modal` component
6. Create `FormField` components
7. Create `useApiRequest` hook
8. Refactor 2-3 more admin pages

### Phase 3: Polish (Week 3)
9. Create `StatusBadge` component
10. Create `ConfirmDialog` + context
11. Centralize constants and utilities
12. Refactor remaining admin pages

---

## 💡 Additional Recommendations

### 11. Create Admin Page Layout Template

```typescript
// src/components/admin/AdminPageLayout.tsx
export function AdminPageLayout({
  title,
  description,
  actions,
  filters,
  children
}: AdminPageLayoutProps) {
  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-brown to-beige rounded-xl p-6 text-white shadow-sm mb-6">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="mt-2 opacity-90">{description}</p>}
        </div>

        {actions && <div className="flex justify-end space-x-3 mb-6">{actions}</div>}

        {filters && <div className="mb-6">{filters}</div>}

        {children}
      </div>
    </AdminLayout>
  );
}
```

### 12. Create Empty State Component

```typescript
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="w-12 h-12 text-gray-300 mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {action}
    </div>
  );
}
```

### 13. Create Loading Skeleton Components

```typescript
export function TableSkeleton({ rows = 5, columns = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-10 bg-gray-200 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎓 Learning Resources

For your team to understand these patterns:

1. **Custom Hooks**: [React Docs - Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
2. **Compound Components**: [Kent C. Dodds - Advanced React Patterns](https://kentcdodds.com/blog/compound-components-with-react-hooks)
3. **Context API**: [React Docs - Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context)

---

## 📝 Conclusion

Implementing these centralizations will:
- **Reduce your codebase by ~20-30%**
- **Make new features 2-3x faster to build**
- **Reduce bugs significantly**
- **Improve consistency across the app**

Start with Phase 1 (high-priority items) and you'll see immediate benefits. The `useAdminCRUD` hook alone will transform your admin pages.

---

**Questions or need help implementing? Let me know!**
