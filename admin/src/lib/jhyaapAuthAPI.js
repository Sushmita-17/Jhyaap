// Backend OTP API client for Jhyaap Station.
// Keep this tiny and dependency-free so the login page wiring stays clean.

export class JhyaapAuthAPIError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'JhyaapAuthAPIError';
    this.status = status;
  }
}

const API_BASE = 'http://127.0.0.1:8001';

async function jsonOrText(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export async function requestOtp(phoneNumber) {
  const res = await fetch(`${API_BASE}/api/v1/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });

  if (!res.ok) {
    const err = await jsonOrText(res).catch(() => null);
    const message =
      (err && typeof err === 'object' && 'detail' in err && err.detail) ||
      (typeof err === 'string' ? err : res.statusText);
    throw new JhyaapAuthAPIError(res.status, message);
  }

  return await res.json();
}

export async function verifyOtp(phoneNumber, otpCode) {
  const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phoneNumber, otp_code: otpCode }),
  });

  if (!res.ok) {
    const err = await jsonOrText(res).catch(() => null);
    const message =
      (err && typeof err === 'object' && 'detail' in err && err.detail) ||
      (typeof err === 'string' ? err : res.statusText);
    throw new JhyaapAuthAPIError(res.status, message);
  }

  return await res.json();
}


