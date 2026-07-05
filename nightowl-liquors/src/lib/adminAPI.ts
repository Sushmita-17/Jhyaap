/**
 * Admin API Client
 * Services for admin panel operations
 */

const API_BASE = '/api/admin';

export class AdminAPIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AdminAPIError';
  }
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('nightowl_admin_token');
}

async function makeRequest(path: string, options: RequestInit = {}) {
  const authToken = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new AdminAPIError(response.status, error.message || response.statusText);
  }

  return response.json();
}

// --- KPIs ---

export async function getKPISummary(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
  return makeRequest(`/kpis/summary?period=${period}`);
}

// --- Revenue ---

export async function getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
  return makeRequest(`/revenue/by-period?period=${period}`);
}

// --- Bills/Invoices ---

export async function getBills(page: number = 1, pageSize: number = 20, filters?: { status?: string; paymentMethod?: string }) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    ...(filters?.status && { status: filters.status }),
    ...(filters?.paymentMethod && { payment_method: filters.paymentMethod }),
  });
  return makeRequest(`/bills?${params}`);
}

export async function getBillDetail(billId: string) {
  return makeRequest(`/bills/${billId}`);
}

// --- Analytics ---

export async function getCategoryBreakdown(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  return makeRequest(`/analytics/categories?period=${period}`);
}

export async function getPaymentMethodBreakdown(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  return makeRequest(`/analytics/payment-methods?period=${period}`);
}

export async function getOrderStatusBreakdown(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  return makeRequest(`/analytics/order-status?period=${period}`);
}

export async function getPeakHours() {
  return makeRequest('/analytics/peak-hours');
}

export async function getTopProducts(limit: number = 10, period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly') {
  return makeRequest(`/analytics/top-products?limit=${limit}&period=${period}`);
}
