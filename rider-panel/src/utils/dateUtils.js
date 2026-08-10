/**
 * Get start and end of today
 */
export function getTodayRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  return { start, end }
}

/**
 * Get start and end of current week (Monday to Sunday)
 */
export function getCurrentWeekRange() {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  const start = new Date(today.getFullYear(), today.getMonth(), diff)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return { start, end }
}

/**
 * Get start and end of current month
 */
export function getCurrentMonthRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return { start, end }
}

/**
 * Get start and end of last 3 months
 */
export function getLast3MonthsRange() {
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate())
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return { start, end }
}

/**
 * Group earnings by day
 */
export function groupByDay(earnings) {
  const grouped = {}
  earnings.forEach((earning) => {
    const date = new Date(earning.earned_at).toLocaleDateString('en-US')
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(earning)
  })
  return grouped
}

/**
 * Group earnings by week
 */
export function groupByWeek(earnings) {
  const grouped = {}
  earnings.forEach((earning) => {
    const date = new Date(earning.earned_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1))
    const weekKey = weekStart.toLocaleDateString('en-US')
    
    if (!grouped[weekKey]) {
      grouped[weekKey] = []
    }
    grouped[weekKey].push(earning)
  })
  return grouped
}

/**
 * Get day name from date
 */
export function getDayName(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
}

/**
 * Get short day name
 */
export function getShortDayName(date) {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
}

/**
 * Paginate array
 */
export function paginate(array, page = 1, pageSize = 20) {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return array.slice(start, end)
}

/**
 * Get total pages
 */
export function getTotalPages(total, pageSize = 20) {
  return Math.ceil(total / pageSize)
}

