import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../store/themeStore.jsx'

/**
 * ThemeToggle — Sun/Moon pill toggle matching the website navbar switch.
 * Uses the rider-panel theme store (jhyaap_rider_theme).
 */
export default function ThemeToggle({ size = 'md' }) {
  const { isDark, toggleTheme } = useTheme()
  const isMobile = size === 'sm'

  return (
    <button
      onClick={toggleTheme}
      className={`rider-theme-toggle relative rounded-full p-1 transition-all duration-300 ${
        isDark ? 'bg-[#C9A84C]' : 'bg-gray-200'
      } ${isMobile ? 'w-9 h-5' : 'w-12 h-6'}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <div
        className={`absolute top-1 rounded-full transition-all duration-300 ${
          isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'
        } ${isDark ? 'left-7 bg-black shadow-md' : 'left-1 bg-white shadow-md'}`}
      />
      <Sun
        className={`absolute transition-opacity duration-300 z-10 ${
          isMobile
            ? 'left-1 top-1 w-2 h-2'
            : 'left-1.5 top-1 w-3 h-3'
        } ${isDark ? 'opacity-0' : 'opacity-100 text-gray-600'}`}
      />
      <Moon
        className={`absolute transition-opacity duration-300 z-10 ${
          isMobile
            ? 'right-1 top-1 w-2 h-2'
            : 'right-1.5 top-1 w-3 h-3'
        } ${isDark ? 'opacity-100 text-white' : 'opacity-0'}`}
      />
    </button>
  )
}
