import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

export function useLocationTracking(enabled = true) {
  const { rider } = useAuthStore()
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef(null)
  const intervalRef = useRef(null)

  const sendLocationToBackend = async (position) => {
    if (!rider?.id) return

    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const locationData = {
        rider_id: rider.id,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        accuracy: position.coords.accuracy,
      }

      const response = await fetch(
        `${BACKEND_API_URL}/api/v1/location/rider/${rider.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: 'Bearer ' + token } : {})
          },
          body: JSON.stringify(locationData)
        }
      )

      if (response.ok) {
        setLocation(locationData)
        setError(null)
      } else {
        console.error('Failed to send location to backend')
      }
    } catch (err) {
      console.error('Error sending location:', err)
      setError(err.message)
    }
  }

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)

    // Watch position with high accuracy for mobile
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        sendLocationToBackend(position)
      },
      (err) => {
        setError(err.message)
        console.error('Geolocation error:', err)
      },
      {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000
      }
    )

    // Also send periodic updates every 10 seconds (backup)
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => sendLocationToBackend(position),
        (err) => console.error('Periodic location error:', err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      )
    }, 10000)
  }

  const stopTracking = () => {
    setIsTracking(false)
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (enabled && rider?.id && !isTracking) {
      startTracking()
    }

    return () => {
      stopTracking()
    }
  }, [enabled, rider?.id])

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking
  }
}
