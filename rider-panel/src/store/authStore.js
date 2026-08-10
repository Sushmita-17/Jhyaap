import { useEffect, useState } from 'react'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

let listeners = new Set()
let state = {
  rider: null,
  loading: true,
  error: null,
  isAvailable: true,
}

function emit() {
  for (const l of listeners) l()
}

function setState(partial) {
  state = { ...state, ...partial }
  emit()
}

// Initialize auth on app load - check if rider is already logged in
async function initAuth() {
  try {
    const savedRider = localStorage.getItem('jhyaap_rider_session')
    const savedAvailable = localStorage.getItem('jhyaap_rider_available')
    if (savedRider) {
      const rider = JSON.parse(savedRider)
      setState({
        rider,
        loading: false,
        error: null,
        isAvailable: savedAvailable !== 'false'
      })
    } else {
      setState({ rider: null, loading: false, error: null, isAvailable: true })
    }
  } catch (err) {
    console.error('Auth init error:', err)
    setState({ rider: null, loading: false, error: err.message, isAvailable: true })
  }
}

initAuth()

export function useAuthStore(selector = (s) => s) {
  const [snap, setSnap] = useState(state)

  useEffect(() => {
    const cb = () => setSnap(state)
    listeners.add(cb)
    return () => listeners.delete(cb)
  }, [])

  return selector(snap)
}

// Backend API-based login flow
export const authActions = {
  initAuth,

  login: async (phone, password) => {
    try {
      setState({ error: null })

      const trimmedPhone = phone.trim()
      const trimmedPassword = password.trim()

      if (!trimmedPhone || !trimmedPassword) {
        throw new Error('Phone and password are required')
      }

      const response = await fetch(BACKEND_API_URL + '/api/v1/auth/rider-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: trimmedPhone, password: trimmedPassword }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.detail || 'Invalid phone number or password')

      const rider = {
        id: result.rider.id,
        name: result.rider.name,
        phone: result.rider.phone_number,
        status: result.rider.status,
        vehicle_type: result.rider.vehicle_type,
      }
      localStorage.setItem('jhyaap_rider_session', JSON.stringify(rider))
      localStorage.setItem('jhyaap_rider_token', result.access_token)
      localStorage.setItem('jhyaap_rider_available', 'true')
      setState({ rider, loading: false, error: null, isAvailable: true })
    } catch (err) {
      setState({ error: err.message })
      throw err
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem('jhyaap_rider_session')
      localStorage.removeItem('jhyaap_rider_token')
      localStorage.removeItem('jhyaap_rider_available')
      setState({ rider: null, loading: false, error: null, isAvailable: true })
    } catch (err) {
      setState({ error: err.message })
      throw err
    }
  },

  toggleAvailability: async (isAvailable) => {
    try {
      localStorage.setItem('jhyaap_rider_available', isAvailable ? 'true' : 'false')
      setState({ isAvailable })

      const token = localStorage.getItem('jhyaap_rider_token')
      if (state.rider?.id && token) {
        await fetch(BACKEND_API_URL + '/api/v1/riders/' + state.rider.id + '/availability?is_available=' + String(isAvailable), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token } })
      }
    } catch (err) {
      setState({ error: err.message })
      throw err
    }
  },
}

export function getAuthStoreState() {
  return {
    ...state,
    initAuth,
    login: authActions.login,
    logout: authActions.logout,
    toggleAvailability: authActions.toggleAvailability,
  }
}


