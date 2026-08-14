/**
 * Reusable API Client for Tea Time Cafe Backend.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface FetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
}

export async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers, ...customConfig } = options;

    let url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        const queryString = queryParams.toString();
        if (queryString) {
            url += `${url.includes("?") ? "&" : "?"}${queryString}`;
        }
    }

    const defaultHeaders: Record<string, string> = {};

    // Do not set Content-Type if uploading FormData
    if (!(customConfig.body instanceof FormData)) {
        defaultHeaders["Content-Type"] = "application/json";
    }

    // Inject JWT token if available in client storage
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("teatime_token");
        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const config: RequestInit = {
        ...customConfig,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
            // Keep default message if body is not JSON
        }
        const error: any = new Error(errorMessage);
        error.status = response.status;
        throw error;
    }

    // Return raw blob/buffer if content-type is an image
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("image/")) {
        return (await response.blob()) as unknown as T;
    }

    if (response.status === 204) {
        return {} as T;
    }

    const text = await response.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
}

export const api = {
    // Auth
    login: (credentials: { email: string; password: string }) =>
        apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    getMe: () => apiFetch("/api/auth/me"),

    // Categories
    getCategories: (activeOnly = true) =>
        apiFetch("/api/categories", { params: { active_only: activeOnly } }),
    createCategory: (data: any) =>
        apiFetch("/api/categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (id: number, data: any) =>
        apiFetch(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteCategory: (id: number) =>
        apiFetch(`/api/categories/${id}`, { method: "DELETE" }),

    // Menu Items
    getMenu: (params?: { category_id?: number; is_available?: boolean; is_veg?: boolean; search?: string }) =>
        apiFetch("/api/menu", { params }),
    getMenuItem: (id: number) =>
        apiFetch(`/api/menu/${id}`),
    createMenuItem: (data: any) =>
        apiFetch("/api/menu", { method: "POST", body: JSON.stringify(data) }),
    updateMenuItem: (id: number, data: any) =>
        apiFetch(`/api/menu/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateItemPrice: (id: number, price_paise: number) =>
        apiFetch(`/api/menu/${id}/price`, { method: "PATCH", body: JSON.stringify({ price_paise }) }),
    toggleItemAvailability: (id: number, is_available: boolean) =>
        apiFetch(`/api/menu/${id}/availability`, { method: "PATCH", body: JSON.stringify({ is_available }) }),
    adjustItemStock: (id: number, change_qty: number, reason: string, notes?: string) =>
        apiFetch(`/api/menu/${id}/stock`, { method: "PATCH", body: JSON.stringify({ change_qty, reason, notes }) }),
    deleteMenuItem: (id: number) =>
        apiFetch(`/api/menu/${id}`, { method: "DELETE" }),
    uploadImage: (formData: FormData) =>
        apiFetch("/api/menu/upload-image", { method: "POST", body: formData }),
    getImageUrl: (path?: string | null) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
    },

    // Tables
    getTables: () => apiFetch("/api/tables"),
    getTable: (id: number) => apiFetch(`/api/tables/${id}`),
    createTable: (data: { label: string; qr_code_url?: string }) =>
        apiFetch("/api/tables", { method: "POST", body: JSON.stringify(data) }),
    updateTable: (id: number, data: { label?: string; status?: string }) =>
        apiFetch(`/api/tables/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateTableStatus: (id: number, status: string) =>
        apiFetch(`/api/tables/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    deleteTable: (id: number) =>
        apiFetch(`/api/tables/${id}`, { method: "DELETE" }),
    getTableQrUrl: (id: number, overrideUrl?: string) => {
        const origin = overrideUrl || (typeof window !== "undefined" && window.location.origin ? window.location.origin : "");
        const param = origin ? `?frontend_url=${encodeURIComponent(origin)}` : "";
        return `${API_BASE}/api/tables/${id}/qr${param}`;
    },
    callService: (tableId: number, call_type: string) =>
        apiFetch(`/api/tables/${tableId}/call`, { method: "POST", body: JSON.stringify({ call_type }) }),

    // Orders
    createOrder: (data: { table_id: number; items: Array<{ item_id: number; qty: number; notes?: string }>; customer_notes?: string; payment_method?: string }) =>
        apiFetch("/api/orders", { method: "POST", body: JSON.stringify(data) }),
    getOrder: (orderId: number) =>
        apiFetch(`/api/orders/${orderId}`),
    getOrders: (params?: { status?: string; table_id?: number; date?: string }) =>
        apiFetch("/api/orders", { params }),
    updateOrderStatus: (orderId: number, status: string) =>
        apiFetch(`/api/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

    // Stock & Inventory
    getStockOverview: () => apiFetch("/api/stock"),
    getLowStockItems: () => apiFetch("/api/stock/low"),
    getStockLogs: (params?: { item_id?: number; reason?: string; limit?: number }) =>
        apiFetch("/api/stock/logs", { params }),
    adjustStockManual: (data: { item_id: number; change_qty: number; reason: string; notes?: string }) =>
        apiFetch("/api/stock/adjust", { method: "POST", body: JSON.stringify(data) }),

    // Payments
    createRazorpayOrder: (orderId: number) =>
        apiFetch("/api/payments/create-razorpay-order", { method: "POST", body: JSON.stringify({ order_id: orderId }) }),
    verifyRazorpayPayment: (data: { order_id: number; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        apiFetch("/api/payments/verify-razorpay-payment", { method: "POST", body: JSON.stringify(data) }),
    markCashPaid: (orderId: number, notes?: string) =>
        apiFetch(`/api/payments/${orderId}/mark-cash-paid`, { method: "POST", body: JSON.stringify({ notes }) }),
    getPayments: (params?: { method?: string; status?: string }) =>
        apiFetch("/api/payments", { params }),

    // Service Calls
    getServiceCalls: (status?: string) =>
        apiFetch("/api/service-calls", { params: { status } }),
    createServiceCall: (table_id: number, call_type: string, notes?: string) =>
        apiFetch("/api/service-calls", { method: "POST", body: JSON.stringify({ table_id, call_type, notes }) }),
    attendServiceCall: (callId: number) =>
        apiFetch(`/api/service-calls/${callId}/attend`, { method: "PATCH" }),

    // Analytics
    getAnalyticsSummary: (params?: { start_date?: string; end_date?: string }) =>
        apiFetch("/api/analytics/summary", { params }),
    getRevenueTrend: (days = 7) =>
        apiFetch("/api/analytics/revenue-over-time", { params: { days } }),
    getTopItems: (limit = 10) =>
        apiFetch("/api/analytics/top-items", { params: { limit } }),
    getHourlyDistribution: () =>
        apiFetch("/api/analytics/hourly-distribution"),
    getCategoryBreakdown: () =>
        apiFetch("/api/analytics/category-breakdown"),
    getTableTurnover: () =>
        apiFetch("/api/analytics/table-turnover"),

    // Audit Logs
    getAuditLogs: (params?: { entity_type?: string; limit?: number }) =>
        apiFetch("/api/audit", { params }),

    // Outlet Settings
    getOutlet: (outletId = 1) =>
        apiFetch("/api/outlets", { params: { outlet_id: outletId } }),
    updateOutlet: (outletId: number, data: any) =>
        apiFetch(`/api/outlets?outlet_id=${outletId}`, { method: "PUT", body: JSON.stringify(data) }),
};
