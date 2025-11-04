import axios, { AxiosError, type AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { router } from "../router/Routes";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true; // jer backend koristi AllowCredentials

const responseBody = (response: AxiosResponse) => response.data;

// Request interceptor to add Authorization header
axios.interceptors.request.use(config => {
    const user = localStorage.getItem('user');
    if (user) {
        const token = JSON.parse(user).token;
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axios.interceptors.response.use(async response => {
    return response
}, (error: AxiosError) => {
    if (!error.response) {
        // Network error or no response
        toast.error('Network error. Please check your connection.');
        return Promise.reject(error);
    }

    const {data, status} = error.response as AxiosResponse;
    const url = error.config?.url || '';

    // URLs to skip toast notifications for (let components handle these)
    const silentErrorUrls = [
        'order',
        'digitaldownloads',
        'addresses',
        'admin/notifications',
        'admin/activity',
        'admin/settings',
        'admin/export',
        'admin/analytics'
    ];

    const shouldSkipToast = silentErrorUrls.some(skipUrl => url.includes(skipUrl));

    switch (status) {
        case 400:
            if (data?.errors) {
                const modelStateErrors: string[] = [];
                for (const key in data.errors) {
                    if (data.errors[key]) {
                        modelStateErrors.push(data.errors[key])
                    }
                }
                throw modelStateErrors.flat();
            }
            if (!shouldSkipToast) {
                toast.error(data?.title || 'Bad request');
            }
            break;
        case 401:
            // Don't show toast for login/register/currentUser endpoints - let the components handle it
            if (!url.includes('login') && !url.includes('register') && !url.includes('currentUser') && !shouldSkipToast) {
                const user = localStorage.getItem('user');
                if (user) {
                    // Token exists but is expired/invalid - log out and redirect
                    console.log('[AUTH] 401 Unauthorized - Token expired. Logging out.');
                    localStorage.removeItem('user');
                    toast.error('Your session has expired. Please log in again.');
                    setTimeout(() => router.navigate('/login'), 1000);
                } else {
                    // No user in storage
                    toast.error(data?.title || 'Unauthorized');
                }
            }
            // For silent URLs (orders, digitaldownloads, etc.) - do nothing, let components handle it
            break;
        case 403:
            if (!shouldSkipToast) {
                toast.error('You are not allowed to do that!');
            }
            break;
        case 404:
            if (!shouldSkipToast) {
                toast.error('Resource not found');
            }
            break;
        case 500:
            if (!shouldSkipToast) {
                router.navigate('/server-error', {state: {error: data}});
            }
            break;
        default:
            if (!shouldSkipToast) {
                toast.error(`An error occurred: ${status}`);
            }
            break;
    }

    return Promise.reject(error.response);
})

function createFormData(item: any) {
    let formData = new FormData();
    for (const key in item) {
        const value = item[key];

        // Skip undefined or null values
        if (value === undefined || value === null) continue;

        // Handle arrays (like images or variants)
        if (Array.isArray(value)) {
            if (key === 'images') {
                // Append each image file
                value.forEach((file: File) => {
                    formData.append('File', file);
                });
            } else if (key === 'variants') {
                // Serialize variants as JSON
                formData.append(key, JSON.stringify(value));
            } else {
                // For other arrays, append each item
                value.forEach((val: any) => {
                    formData.append(key, val);
                });
            }
        } else {
            formData.append(key, value);
        }
    }
    return formData;
}

const requests = {
    get: (url: string, params?: URLSearchParams) => axios.get(url, {params}).then(responseBody),
    post: (url: string, body: {}) => axios.post(url, body).then(responseBody),
    put: (url: string, body: {}) => axios.put(url, body).then(responseBody),
    delete: (url: string) => axios.delete(url).then(responseBody),
    postForm: (url: string, data: FormData) => axios.post(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody),
    putForm: (url: string, data: FormData) => axios.put(url, data, {
        headers: {'Content-type': 'multipart/form-data'}
    }).then(responseBody)
}

const Catalog = {
    list: (params: URLSearchParams) => axios.get('products', {params}).then(response => {
        const items = response.data;
        const pagination = response.headers['pagination'];

        return {
            items,
            metaData: pagination ? JSON.parse(pagination) : null
        };
    }),
    details: (productId: number) => requests.get(`products/${productId}`),
    fetchFilters: () => requests.get('products/filters'),
    addProductVariant: (productId: number, attributeValueIds: number[], quantity: number) => {
  return requests.post(`products/${productId}/variants`, {
    attributeValueIds,
    quantity
  });
}
}


const Category = {
    list: () => requests.get('category'),
    fetch: (id: number) => requests.get(`category/${id}`),
    create: (values: any) => requests.post('category', values)
}

const Basket = {
    get: () => requests.get('basket'),
    addItem: (productId: number, quantity = 1, attributeValueIds: number[]) => {
        return requests.post(`basket?productId=${productId}&quantity=${quantity}`, attributeValueIds);
    },
    removeItem: (productId: number, attributeValueIds: number[], quantity = 1) => {
        return axios.delete(`basket?productId=${productId}&quantity=${quantity}`, { data: attributeValueIds }).then(responseBody);
    }
}

const Account = {
    login: (values: any) => requests.post('account/login', values),
    register: (values: any) => requests.post('account/register', values),
    currentUser: () => requests.get('account/currentUser'),
    fetchAddress: () => requests.get('account/savedAddress'),
    updateUser: (user: any) => requests.putForm('account/updateUser', createFormData(user)),
    changePassword: (values: { currentPassword: string; newPassword: string }) =>
        requests.put('account/changePassword', values),

    getAddresses: () => requests.get('account/addresses'),
    addAddress: (address: any) => requests.post('account/addresses', address),
    updateAddress: (id: number, address: any) => requests.put(`account/addresses/${id}`, address),
    deleteAddress: (id: number) => requests.delete(`account/addresses/${id}`),
    setDefaultAddress: (id: number) => requests.put(`account/addresses/${id}/default`, {})
}

const Payments = {
    createPaymentIntent: () => requests.post('payments', {})
}

const Orders = {
    create: (values: any) => requests.post('order', values),
    list: () => requests.get('order'),
    fetch: (id: number) => requests.get(`order/${id}`),
    getStatusHistory: (id: number) => requests.get(`order/${id}/status-history`),
    updateTracking: (id: number, trackingNumber: string) => requests.put(`order/${id}/tracking`, { trackingNumber })
}

const DigitalDownloads = {
    getUserDownloads: () => requests.get('digitaldownloads'),
    getDownloadToken: (downloadId: number) => requests.get(`digitaldownloads/${downloadId}/token`),
    downloadFile: (token: string) => {
        return axios.get(`digitaldownloads/download/${token}`, {
            responseType: 'blob'
        }).then(response => {
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'download';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            return {
                blob: response.data,
                filename: filename
            };
        });
    },
    markDownloadCompleted: (downloadId: number) => requests.post(`digitaldownloads/${downloadId}/complete`, {}),
    getDownloadStatus: (downloadId: number) => requests.get(`digitaldownloads/${downloadId}/status`),
    resetDownload: (downloadId: number) => requests.post(`digitaldownloads/${downloadId}/reset`, {}),
    syncDownloadUrl: (downloadId: number) => requests.post(`digitaldownloads/${downloadId}/sync-url`, {})
}

const Admin = {
   
    getProducts: (params?: URLSearchParams) => requests.get('products/admin', params),
    createProduct: (product: any) => requests.postForm('products', createFormData(product)),
    updateProduct: (_id: number, product: any) => requests.putForm(`products`, createFormData(product)),
    deleteProduct: (id: number) => requests.delete(`products/${id}`),
    updateProductStatus: (id: number, status: string) => requests.put(`products/${id}/status`, { status }),
    bulkUpdatePrices: (productIds: number[], updateType: string, value: number) =>
        requests.put('products/bulk-update-prices', {
            ProductIds: productIds,
            UpdateType: updateType,
            Value: value
        }),

    getCategories: () => requests.get('category/admin'),
    createCategory: (category: any) => requests.post('category', category),
    updateCategory: (id: number, category: any) => requests.put(`category/${id}`, category),
    deleteCategory: (id: number) => requests.delete(`category/${id}`),

    getAttributes: () => requests.get('attributes'),
    createAttribute: (attribute: any) => requests.post('attributes', attribute),
    updateAttribute: (id: number, attribute: any) => requests.put(`attributes/${id}`, attribute),
    deleteAttribute: (id: number) => requests.delete(`attributes/${id}`),
    addAttributeValue: (attributeId: number, value: any) => requests.post(`attributes/${attributeId}/values`, value),
    deleteAttributeValue: (attributeId: number, valueId: number) => requests.delete(`attributes/${attributeId}/values/${valueId}`),

    getOrders: (params?: URLSearchParams) => requests.get('order/admin', params),
    updateOrderStatus: (id: number, status: string) =>
        requests.put(`order/admin/${id}/status`, { Status: status }),
    addOrderStatusUpdate: (orderId: number, data: { status: string; notes?: string; trackingNumber?: string; sendCustomerEmail?: boolean }) =>
        requests.post(`order/admin/${orderId}/status-update`, {
            Status: data.status,
            Notes: data.notes,
            TrackingNumber: data.trackingNumber,
            SendCustomerEmail: data.sendCustomerEmail
        }),
    getOrderStatusHistory: (orderId: number) => requests.get(`order/admin/${orderId}/status-history`),
    updateOrderTracking: (orderId: number, trackingNumber: string, notes?: string) =>
        requests.put(`order/admin/${orderId}/tracking`, {
            TrackingNumber: trackingNumber,
            Notes: notes
        }),
    saveOrderNotes: (orderId: number, notes: string) =>
        requests.put(`order/admin/${orderId}/notes`, { Notes: notes }),
    sendOrderEmail: (orderId: number, subject: string, message: string) =>
        requests.post(`order/admin/${orderId}/send-email`, {
            Subject: subject,
            Message: message
        }),
    bulkUpdateOrderStatus: (orderIds: number[], status: string) =>
        requests.put('order/admin/bulk-update-status', {
            OrderIds: orderIds,
            Status: status
        }),

    getUsers: (params?: URLSearchParams) => requests.get('admin/users', params),
    updateUserRole: (id: number, role: string) => requests.put(`admin/users/${id}/role`, { role }),
    updateUser: (id: number, userData: { firstName?: string; lastName?: string; email?: string; role?: string; status?: string }) =>
        requests.put(`admin/users/${id}`, userData),
    suspendUser: (id: number) => requests.put(`admin/users/${id}/suspend`, {}),
    unsuspendUser: (id: number) => requests.put(`admin/users/${id}/unsuspend`, {}),
    sendEmailToUser: (id: number, subject: string, message: string) =>
        requests.post(`admin/users/${id}/send-email`, { Subject: subject, Message: message }),

    getRoles: () => requests.get('admin/roles'),
    createRole: (name: string) => requests.post('admin/roles', { name }),
    deleteRole: (id: number) => requests.delete(`admin/roles/${id}`),

    getDashboardStats: () => requests.get('admin/dashboard/stats'),
    getLowStockProducts: () => requests.get('admin/inventory/low-stock'),

    updateStock: (productId: number, variantId: number, quantity: number, reason: string) =>
        requests.put(`products/admin/stock/adjust`, { productId, variantId, quantity, reason }),

    // System Settings
    getSystemSettings: () => requests.get('admin/settings'),
    updateSystemSettings: (settings: any) => requests.put('admin/settings', settings),
}

const agent = {
    Catalog,
    Category,
    Basket,
    Account,
    Payments,
    Orders,
    DigitalDownloads,
    Admin
}

export default agent;