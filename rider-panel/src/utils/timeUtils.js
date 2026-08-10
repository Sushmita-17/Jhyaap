export function getRelativeTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export function paymentMethodBadge(method) {
  const badges = {
    cod: { label: 'COD', bg: 'bg-blue-500/20', text: 'text-blue-300', icon: '' },
    esewa: { label: 'ESEWA', bg: 'bg-green-500/20', text: 'text-green-300', icon: '' },
    khalti: { label: 'KHALTI', bg: 'bg-purple-500/20', text: 'text-purple-300', icon: '' },
  }
  return badges[method] || badges.cod
}

export function paymentStatusBadge(status) {
  const badges = {
    paid: { bg: 'bg-green-500/20', text: 'text-green-300' },
    partial: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
    unpaid: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  }
  return badges[status] || badges.unpaid
}

