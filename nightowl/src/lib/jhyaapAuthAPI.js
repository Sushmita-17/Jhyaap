// Backend API client for Jhyaap Station Customer Auth.

function extractErrorMessage(err, defaultMsg = 'An error occurred.') {
  if (!err) return defaultMsg;
  const detail = typeof err === 'object' && err !== null && 'detail' in err ? err.detail : err;
  if (!detail) return defaultMsg;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === 'string' ? d : d?.msg || d?.message || JSON.stringify(d)))
      .join(', ');
  }
  if (typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return String(detail);
}

export class JhyaapAuthAPIError extends Error {
  constructor(status, message) {
    const formattedMessage = extractErrorMessage(message);
    super(formattedMessage);
    this.name = 'JhyaapAuthAPIError';
    this.status = status;
  }
}

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

async function jsonOrText(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function requestOtp(phoneNumber) {
  const res = await fetch(`${API_BASE}/api/v1/customers/otp/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  const body = await jsonOrText(res).catch(() => null);
  if (!res.ok) {
    throw new JhyaapAuthAPIError(res.status, body || res.statusText);
  }

  return body;
}

export async function verifyOtp(phoneNumber, otpCode) {
  const res = await fetch(`${API_BASE}/api/v1/customers/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber, otp: otpCode }),
  });

  const body = await jsonOrText(res).catch(() => null);
  if (!res.ok) {
    throw new JhyaapAuthAPIError(res.status, body || res.statusText);
  }

  return {
    customer_id: body.customer?.id,
    access_token: body.access_token,
    customer: body.customer
  };
}

export async function loginCustomer(phoneNumber, password) {
  const res = await fetch(`${API_BASE}/api/v1/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber, password }),
  });
  const body = await jsonOrText(res).catch(() => ({}));
  if (!res.ok) throw new JhyaapAuthAPIError(res.status, body || 'Invalid phone number or password.');
  return body;
}

export async function completeCustomerProfile(customerId, token, profile) {
  const res = await fetch(`${API_BASE}/api/v1/customers/${encodeURIComponent(customerId)}/complete-profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + token 
    },
    body: JSON.stringify(profile),
  });
  const body = await jsonOrText(res).catch(() => ({}));
  if (!res.ok) throw new JhyaapAuthAPIError(res.status, body || 'Unable to complete customer profile.');
  return body;
}

export async function resetCustomerPassword(customerId, token, newPassword) {
  const res = await fetch(`${API_BASE}/api/v1/customers/${encodeURIComponent(customerId)}/reset-password`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + token 
    },
    body: JSON.stringify({ new_password: newPassword }),
  });
  const body = await jsonOrText(res).catch(() => ({}));
  if (!res.ok) throw new JhyaapAuthAPIError(res.status, body || 'Unable to reset password.');
  return body;
}
