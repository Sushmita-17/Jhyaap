import { useEffect, useState } from 'react'

let listeners = new Set()
let state = {
  earnings: [],
  loading: false,
  error: null,
}

function emit() {
  for (const l of listeners) l()
}

function setState(partial) {
  state = { ...state, ...partial }
  emit()
}

// Earnings store is now a placeholder - all earnings functionality 
// has been migrated to backend API calls in the Earnings component
export const earningsActions = {
  fetchEarnings: async (riderId, startDate, endDate) => {
    // This function is no longer used - migrated to backend API
    console.warn('earningsActions.fetchEarnings is deprecated - use backend API directly')
  },
  fetchEarningsForExport: async (riderId, startDate, endDate) => {
    // This function is no longer used - migrated to backend API
    console.warn('earningsActions.fetchEarningsForExport is deprecated - use backend API directly')
    return []
  },
  logDeliveryEarnings: async (riderId, orderId, deliveryFee) => {
    // This function is no longer used - migrated to backend API
    console.warn('earningsActions.logDeliveryEarnings is deprecated - use backend API directly')
  },
}

export function useEarningsStore(selector = (s) => s) {
  const [snap, setSnap] = useState(state)

  useEffect(() => {
    const cb = () => setSnap(state)
    listeners.add(cb)
    return () => listeners.delete(cb)
  }, [])

  return selector(snap)
}

