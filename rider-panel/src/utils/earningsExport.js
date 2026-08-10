/**
 * Generate and download CSV file for earnings
 * @param {Array} earnings - Array of earnings records
 * @param {string} filename - Name of the CSV file
 */
export function downloadCSV(earnings, filename = 'earnings.csv') {
  // Create CSV header
  const headers = ['Date', 'Order ID', 'Delivery Fee (NPR)']
  
  // Create CSV rows
  const rows = earnings.map((earning) => [
    new Date(earning.earned_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    earning.order_id,
    earning.delivery_fee,
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n')

  // Create Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Calculate earnings total for an array of records
 */
export function calculateTotal(earnings) {
  return earnings.reduce((sum, item) => sum + (item.delivery_fee || 0), 0)
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return `रु ${Number(amount || 0).toFixed(2)}`
}

/**
 * Format date for display
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format time for display
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

