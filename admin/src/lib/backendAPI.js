const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

async function request(path, options = {}) {
  const adminToken = typeof window !== 'undefined' ? window.localStorage.getItem('nightowl_admin_token') : null;
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(adminToken ? { Authorization: 'Bearer ' + adminToken } : {}), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || ('API request failed: ' + response.status));
  return body;
}

export async function uploadPaymentScreenshot(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const adminToken = typeof window !== 'undefined' ? window.localStorage.getItem('nightowl_admin_token') : null;
  const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
  
  const response = await fetch(API_BASE + '/api/v1/uploads/payment-screenshot', {
    method: 'POST',
    headers: adminToken ? { Authorization: 'Bearer ' + adminToken } : {},
    body: formData,
  });
  
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || 'Upload failed');
  return body;
}

export function createBackendOrder(order) {
  return request('/api/v1/orders/customer/create', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: order.userId,
      client_order_id: order.id,
      items: order.items.map((item) => ({
        product_id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: Number(item.product?.price ?? item.price),
      })),
      delivery_address: [order.address.label, order.address.street, order.address.area].filter(Boolean).join(', '),
      delivery_notes: order.notes || null,
      payment_method: order.paymentMethod || 'cod',
      payment_screenshot: order.paymentScreenshot || null,
    }),
  });
}

export function getBackendOrders() {
  return request('/api/v1/orders');
}

export function updateBackendOrderStatus(orderId, status) {
  return request('/api/v1/orders/' + encodeURIComponent(orderId) + '/status?status=' + encodeURIComponent(status), { method: 'PATCH' });
}

export function getBackendCustomerOrders(customerId) {
  return request('/api/v1/orders/customer/' + encodeURIComponent(customerId));
}
export function createBackendRider(rider) {
  return request('/api/v1/riders', { method: 'POST', body: JSON.stringify({
    name: rider.name,
    phone_number: rider.phone_number,
    password: rider.password,
    vehicle_type: rider.vehicle_type,
    status: rider.status || 'active',
  }) });
}

export function updateBackendRider(id, rider) {
  return request('/api/v1/riders/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(rider) });
}

export function deleteBackendRider(id) {
  return request('/api/v1/riders/' + encodeURIComponent(id), { method: 'DELETE' });
}

export function getBackendRiders() {
  return request('/api/v1/riders');
}

export function getBackendCoupons() {
  return request('/api/v1/coupons');
}

export function getBackendCustomers() {
  return request('/api/v1/customers');
}
export function getBackendSalesSummary(days = 7) {
  return request('/api/v1/reports/sales/summary?days=' + encodeURIComponent(days));
}

export function getBackendDailySales(days = 7) {
  return request('/api/v1/reports/sales/daily?days=' + encodeURIComponent(days));
}

export function getBackendPopularProducts(limit = 5) {
  return request('/api/v1/reports/products/popular?limit=' + encodeURIComponent(limit));
}




