import { authActions, useAuthStore } from '../store/authStore'

/**
 * AvailabilitySwitch — compact pill switch matching the original Rider Panel UI.
 *
 * Original appearance:
 *  - Small pill-shaped button
 *  - Light/white background
 *  - Thin rounded border
 *  - Green status dot on the left
 *  - "Available" label in green text
 *  - Compact size, positioned top-right of the header
 *
 * Online  ->  🟢 Available
 * Offline ->  ⚪ Unavailable
 *
 * Clicking toggles the rider's availability.
 */
export default function AvailabilitySwitch({ className = '' }) {
  const { rider, isAvailable } = useAuthStore()

  const toggleAvailability = async () => {
    if (!rider?.id) return
    try {
      await authActions.toggleAvailability(!isAvailable)
    } catch (err) {
      console.error('Error toggling availability:', err)
    }
  }

  return (
    <button
      type="button"
      onClick={toggleAvailability}
      className={`inline-flex min-h-[32px] shrink-0 items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold shadow-sm transition ${className} ${
        isAvailable
          ? 'border-emerald-500/60 text-emerald-600 hover:shadow'
          : 'border-gray-300 text-gray-400 hover:border-gray-400'
      }`}
      aria-label={isAvailable ? 'Available' : 'Unavailable'}
      aria-pressed={isAvailable}
      title={isAvailable ? 'You are available — tap to go offline' : 'You are offline — tap to go online'}
    >
      <span
        className={`h-2 w-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-gray-400'}`}
        aria-hidden="true"
      />
      {isAvailable ? 'Available' : 'Unavailable'}
    </button>
  )
}
