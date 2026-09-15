const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

async function request(path, options = {}) {
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || ('API request failed: ' + response.status));
  return body;
}

export async function getDeliveryFees() {
  return request('/api/v1/delivery-fees');
}

export async function uploadPaymentScreenshot(file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
  
  const response = await fetch(API_BASE + '/api/v1/uploads/payment-screenshot', {
    method: 'POST',
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
      client_order_id: null, // Let backend generate sequential order number
      items: order.items.map((item) => ({
        product_id: item.product?.id || item.id,
        name: item.product?.name || item.name,
        quantity: item.quantity,
        price: Number(item.product?.price ?? item.price),
      })),
      delivery_address: [order.address.label, order.address.street, order.address.area].filter(Boolean).join(', '),
      delivery_notes: order.notes || null,
      payment_method: order.paymentMethod || 'cod',
      coupon_code: order.couponCode || null,
      payment_screenshot: order.paymentScreenshot || null,
      customer_phone: order.customerPhone || null, // Include customer phone number
    }),
  });
}

export function getBackendOrders() {
  return request('/api/v1/orders');
}

export function getBackendCustomerOrders(customerId) {
  return request('/api/v1/orders/customer/' + encodeURIComponent(customerId));
}
export function getDeliveryRating(orderId) {
  return request('/api/v1/orders/' + encodeURIComponent(orderId) + '/rating');
}

export function submitDeliveryRating(orderId, customerId, rating, review) {
  return request('/api/v1/orders/' + encodeURIComponent(orderId) + '/rating', {
    method: 'POST',
    body: JSON.stringify({ customer_id: customerId, rating, review: review || null }),
  });
}

export function validateCoupon(code, orderAmount) {
  return request('/api/v1/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, order_amount: Number(orderAmount) }),
  });
}

export function changeCustomerPassword(customerId, currentPassword, newPassword, token) {
  return request('/api/v1/customers/' + encodeURIComponent(customerId) + '/password', {
    method: 'PUT',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}




export function deleteCustomerAccount(customerId, token) {
  return request('/api/v1/customers/' + encodeURIComponent(customerId), {
    method: 'DELETE',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });
}
