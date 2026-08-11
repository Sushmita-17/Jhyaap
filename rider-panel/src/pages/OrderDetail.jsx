import { useEffect, useState } from 'react'

import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { paymentStatusBadge } from '../utils/timeUtils'
import LeafletRiderMap from '../components/LeafletRiderMap'
import { Phone, MapPin, Navigation, Bike, CheckCircle, Home, Banknote, Clock } from 'lucide-react'

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://127.0.0.1:8001'

const statusFlow = ['pending','accepted','out_for_delivery','picked_up','delivered']

// ETA mapping for different areas (in minutes)
const ETA_MAP = {
  "Thamel": 35, "New Baneshwor": 35, "Putalisadak": 35, "Durbarmarg": 35,
  "New Road": 35, "Kamaladi": 35, "Asan": 35, "Maitighar": 35,
  "Lazimpat": 45, "Baluwatar": 45, "Maharajgunj": 45, "Naxal": 45,
  "Sinamangal": 45, "Chabahil": 45, "Gaushala": 45, "Gongabu": 45,
  "Samakhusi": 45, "Balaju": 45, "Swayambhu": 45, "Boudha": 45,
  "Koteshwor": 60, "Jorpati": 60, "Kapan": 60, "Budhanilkantha": 60,
  "Kalanki": 60, "Kalimati": 60, "Teku": 60, "Tripureshwor": 60,
  "Shankhamul": 60, "Kirtipur": 75, "Panga": 75, "Nayabazar": 75,
  "Satdobato": 60, "Tikathali": 60, "Pulchowk": 55, "Jawalakhel": 55,
  "Kupondole": 55, "Sanepa": 55, "Ekantakuna": 55, "Lagankhel": 55,
  "Kumaripati": 55, "Imadol": 65, "Lubhu": 65, "Godawari": 90,
  "Bungamati": 85, "Harisiddhi": 85, "Thaiba": 90, "Patan": 70,
  "Dhobighat": 75, "Nakhipot": 75, "Chapagaun": 75, "Balkhu": 75,
  "Satungal": 75, "Kuleshwor": 75, "Thapathali": 70, "Machhegaun": 75,
  "Bhaktapur": 90, "Madhyapur Thimi": 85, "Suryabinayak": 95,
  "Jagati": 90, "Kausaltar": 85, "Balkot": 90, "Sallaghari": 95,
  "Changunarayan": 100, "Sirutar": 95, "Bode": 90, "Siddhapur": 90,
  "Tatopati": 90, "Byasi": 90, "Gatthaghar": 90, "Kamalbinayak": 90,
  "Nagarkot": 90
}

const calculateETA = (address) => {
  if (!address) return 45 // default ETA
  
  const addressStr = typeof address === 'string' ? address : address.street || address.area || ''
  
  // Try to match area name (case insensitive)
  for (const [area, eta] of Object.entries(ETA_MAP)) {
    if (addressStr.toLowerCase().includes(area.toLowerCase())) {
      return eta
    }
  }
  
  return 45 // default ETA if no match
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rider } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMode, setPaymentMode] = useState('full_cash') // 'full_cash' | 'online' | 'split'
  const [cashAmount, setCashAmount] = useState('')
  const [onlineAmount, setOnlineAmount] = useState('')
  const [deliveryProgress, setDeliveryProgress] = useState(0)
  const [deliveryStatus, setDeliveryStatus] = useState('')

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const response = await fetch(BACKEND_API_URL + '/api/v1/orders/' + encodeURIComponent(id), {
        headers: token ? { Authorization: 'Bearer ' + token } : {},
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.detail || 'Could not load order')
      const sourceAddress = result.address && typeof result.address === 'object' ? result.address : {}
      const latitude = result.destination_latitude ?? result.delivery_latitude ?? result.latitude ?? result.destinationCoords?.lat ?? sourceAddress.latitude ?? sourceAddress.lat
      const longitude = result.destination_longitude ?? result.delivery_longitude ?? result.longitude ?? result.destinationCoords?.lng ?? sourceAddress.longitude ?? sourceAddress.lng
      setOrder({
        ...result,
        customer_name: result.customer_name || 'Customer',
        address: {
          ...sourceAddress,
          street: result.delivery_address || sourceAddress.street || '',
          area: sourceAddress.area || result.delivery_address || '',
          latitude,
          longitude,
        },
        destinationCoords: latitude != null && longitude != null ? { lat: Number(latitude), lng: Number(longitude) } : result.destinationCoords,
        total_amount: result.total,
      })
    } catch (err) {
      console.error('Error fetching order:', err)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id])

  const openMaps = () => {
    if (order?.delivery_location_url) {
      window.open(order.delivery_location_url, '_blank')
    }
  }

  const handleProgressUpdate = (progress, currentPosition) => {
    setDeliveryProgress(progress)
    console.log('Delivery Progress:', progress + '%', 'Position:', currentPosition)
  }

  const handleStatusUpdate = (status) => {
    setDeliveryStatus(status)
    console.log('Delivery Status Updated:', status)
    
    // Map custom status to order status flow
    const statusMapping = {
      'left_hub': 'out_for_delivery',
      'on_the_way': 'out_for_delivery',
      'halfway': 'out_for_delivery',
      'near_destination': 'out_for_delivery',
      'delivered': 'delivered'
    }
    
    if (statusMapping[status] && order?.status !== statusMapping[status]) {
      setOrder(prev => ({ ...prev, status: statusMapping[status] }))
      
      // When near destination, send notification to customer
      if (status === 'near_destination') {
        sendCustomerNotification()
      }
      
      // When order is delivered, automatically show payment modal
      if (status === 'delivered') {
        setTimeout(() => {
          setShowPaymentModal(true)
        }, 1000)
      }
    }
  }

  const sendCustomerNotification = async () => {
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      await fetch(BACKEND_API_URL + '/api/v1/orders/' + encodeURIComponent(id) + '/notify-arrival', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}) 
        },
        body: JSON.stringify({
          message: 'Rider is arriving at your location',
          rider_name: rider?.name,
          order_id: id
        })
      })
      console.log('Customer notification sent')
    } catch (err) {
      console.error('Failed to send customer notification:', err)
    }
  }

  const acceptOrder = async () => {
    if (updating) return;
    setUpdating(true);
    
    try {
      await updateStatus('accepted')
      setDeliveryStatus('waiting');
      setDeliveryProgress(0);
    } catch (err) {
      console.error('Error accepting order:', err);
    } finally {
      setUpdating(false);
    }
  }

  const handleConfirmPaymentAndDeliver = async ({ cash, online }) => {
    setUpdating(true)
    try {
      const token = localStorage.getItem('jhyaap_rider_token')
      const riderId = rider?.id
      const totalAmount = Number(order?.total || order?.total_amount || 0)
      const paymentConfirmed = cash + online >= totalAmount ? 'true' : 'false'
      const response = await fetch(BACKEND_API_URL + '/api/v1/orders/rider/' + encodeURIComponent(riderId) + '/deliver/' + encodeURIComponent(id) + '?payment_confirmed=' + paymentConfirmed, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ cash_amount: Number(cash || 0), online_amount: Number(online || 0) }),
      })
      if (!response.ok) {
        let detail = 'Failed to mark order delivered'
        try {
          const body = await response.json()
          detail = body.detail || detail
        } catch {}
        throw new Error(detail)
      }
      if (order) {
        setOrder({ ...order, status: 'delivered', payment_status: 'paid' })
        setDeliveryProgress(100)
        setDeliveryStatus('delivered')
      }
      alert('Order marked as delivered. Payment recorded.')
      setShowPaymentModal(false)
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      console.error('Error confirming payment/delivery:', err)
      alert('Failed to confirm payment/delivery. Please try again.')
    } finally {
      setUpdating(false)
    }
  }


  const updateStatus = async (newStatus) => {
    // Demo mode - update status locally
    setUpdating(true)
    try {
      // If marking as delivered, handle payment modal flow
      if (newStatus === 'delivered') {
        // show payment modal
        setShowPaymentModal(true)
        return
      }

      const token = localStorage.getItem('jhyaap_rider_token')
      const riderId = rider?.id
      const endpoint = newStatus === 'accepted'
        ? BACKEND_API_URL + '/api/v1/orders/rider/' + encodeURIComponent(riderId) + '/accept/' + encodeURIComponent(id)
        : newStatus === 'picked_up'
          ? BACKEND_API_URL + '/api/v1/orders/rider/' + encodeURIComponent(riderId) + '/pickup/' + encodeURIComponent(id)
          : BACKEND_API_URL + '/api/v1/orders/' + encodeURIComponent(id) + '/status?status=' + encodeURIComponent(newStatus)
      const response = await fetch(endpoint, {
        method: newStatus === 'accepted' || newStatus === 'out_for_delivery' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
      })
      if (!response.ok) throw new Error('Failed to update order status')
      if (order) {
        setOrder({ ...order, status: newStatus })
        const manualProgressByStatus = { accepted: 0, out_for_delivery: 25, picked_up: 50 }
        setDeliveryProgress(manualProgressByStatus[newStatus] ?? deliveryProgress)
        setDeliveryStatus(newStatus)
        
        // Start live location tracking when order is picked up
        if (newStatus === 'picked_up') {
          setDeliveryStatus('on_the_way')
          setDeliveryProgress(0)
          console.log('Live location tracking started.')
        }
      }
    } catch (err) {
      console.error('Error updating order:', err)
      alert('Failed to update order status. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleCallCustomer = () => {
    if (order?.customer?.phone_number) {
      window.location.href = `tel:${order.customer.phone_number}`
    }
  }

  if (!order) return <p className="rider-page p-6 text-gray-400 text-sm">Loading...</p>

  const currentIndex = statusFlow.indexOf(order.status)
  const nextStatus = statusFlow[currentIndex + 1]

  const nextLabelMap = {
    accepted: 'Accept Order',
    out_for_delivery: 'Pick Up Order',
    picked_up: 'Start Delivery',
    delivered: 'Mark as Delivered',
    pending: 'Accept Order',
  }

  return (
    <div className="rider-page pb-24">
      <button
        onClick={() => navigate('/dashboard')}
        className="text-sm text-gray-400 mb-4 hover:text-gray-200"
      >
        ← Back
      </button>

      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold mb-1 tracking-tight">Order #{String(order.id).slice(0, 8)}</h1>
          <p className="text-sm text-gray-400">{order.status?.replace(/_/g, ' ').toUpperCase()}</p>
        </div>

        <div className="flex items-center gap-2">
          {order.customer?.phone_number && (
            <a
              href={`tel:${order.customer.phone_number}`}
              className="text-xs px-3 py-2 rounded-md bg-[#2a221c] text-gray-300 hover:bg-[#3a3228] transition"
            >
              Call Customer
            </a>
          )}
        </div>
      </div>

      {/* Delivery Address */}
      <section className="rider-card p-4 mb-4">
        <h2 className="text-sm font-semibold mb-3">Delivery Address</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-300">{order.address?.street}</p>
          {order.address?.landmark && (
            <p className="text-sm text-gray-400">{order.address.landmark}</p>
          )}
          {order.delivery_notes && (
            <div className="mt-3 pt-3 border-t border-[#2a221c]">
              <p className="text-xs text-gray-500 mb-1">Special Instructions:</p>
              <p className="text-sm text-gray-300">{order.delivery_notes}</p>
            </div>
          )}
        </div>
        
        {/* ETA Display */}
        {order.status === 'out_for_delivery' || order.status === 'picked_up' ? (
          <div className="mt-4 pt-3 border-t border-[#2a221c]">
            <div className="flex items-center gap-2 text-[#C9A84C]">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-semibold">
                ETA: {calculateETA(order.address)} minutes
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Estimated arrival time based on delivery area
            </p>
          </div>
        ) : null}
      </section>

      {/* OpenStreetMap & Live Location */}
      <div className="rider-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold">Delivery Map & Navigation</h2>
            <p className="text-xs text-gray-400">OpenStreetMap Interactive Route</p>
          </div>
          {order.delivery_location_url && (
            <button
              onClick={openMaps}
              className="px-3 py-1.5 bg-[#C9A84C] text-[#0F0B08] rounded-md text-xs font-semibold hover:bg-[#b8973b] transition"
            >
              External Navigation
            </button>
          )}
        </div>
        
        {/* Delivery Progress Indicator */}
        {order.status === 'out_for_delivery' && deliveryProgress < 100 && (
          <div className="mb-3 p-3 bg-[#1a1512] rounded-lg border border-[#2a221c]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#C9A84C]">Delivery Progress</span>
              <span className="text-xs font-bold text-emerald-400">{deliveryProgress}%</span>
            </div>
            <div className="w-full bg-[#0F0B08] rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span> Jhyaap Hub</span>
              <span>{deliveryStatus === 'delivered' ? 'Arrived' : 'Destination'}</span>
            </div>
            {deliveryStatus && (
              <div className="mt-2 text-[10px] text-amber-400 font-medium">
                Status: {deliveryStatus.replace(/_/g, ' ').toUpperCase()}
              </div>
            )}
          </div>
        )}

        {/* Delivery Completed Button */}
        {deliveryProgress >= 100 && order.status !== 'delivered' && (
          <div className="mb-3 p-4 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Delivery Completed</h3>
                <p className="text-xs text-gray-400">Order successfully delivered to customer</p>
              </div>
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full rider-btn rider-btn-primary py-3 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              Collect Payment
            </button>
          </div>
        )}

        {/* Payment Collection After Delivered */}
        {order.status === 'delivered' && (
          <div className="mb-3 p-4 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Order Delivered</h3>
                <p className="text-xs text-gray-400">Payment status: {order.payment_status === 'paid' ? 'PAID' : 'PENDING'}</p>
              </div>
              <div className="text-2xl">Home</div>
            </div>
            {order.payment_status !== 'paid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full rider-btn rider-btn-primary py-3 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Collect Payment
              </button>
            )}
          </div>
        )}
        <LeafletRiderMap
          orderId={id}
          orderStatus={order.status}
          destinationLat={order.destinationCoords?.lat ?? order.address?.latitude ?? order.latitude}
          destinationLng={order.destinationCoords?.lng ?? order.address?.longitude ?? order.longitude}
          destinationName={order.address?.street || order.address?.area || 'Customer Delivery Address'}
          destinationLocationUrl={order.delivery_location_url}
          manualProgress={deliveryProgress}
          height="260px"
          onProgressUpdate={handleProgressUpdate}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>

      {/* Payment Card */}
      <div className="rider-card p-4 mb-4">
        <h2 className="text-sm font-semibold mb-2">Payment</h2>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400">Method</p>
            <p className="text-sm text-[#F5ECD7] font-semibold">{(order.payment_method || 'COD').toUpperCase()}</p>
          </div>
          <div>
            {(() => {
              const badge = paymentStatusBadge(order.payment_status || 'unpaid')
              return (
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
                  {(order.payment_status || 'unpaid').toUpperCase()}
                </span>
              )
            })()}
          </div>
        </div>

        {order.payment_status === 'paid' && order.payment_method && order.payment_method !== 'cod' && (
          <p className="text-xs text-gray-400">Already paid — no cash to collect.</p>
        )}
      </div>

      {/* Order Items */}
      <section className="rider-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Items</h2>
          <span className="text-xs text-gray-400">
            {order.order_items?.length || 0} {order.order_items?.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="space-y-2 mb-3">
          {order.order_items?.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-gray-300 truncate pr-3">
                {item.product?.name} × {item.quantity}
              </span>
              <span className="text-gray-400 shrink-0">NPR {Number(item.price || 0).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1 pt-3 border-t border-[#2a221c]">
          {order.subtotal && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Subtotal</span>
              <span>NPR {Number(order.subtotal).toFixed(2)}</span>
            </div>
          )}
          {order.delivery_fee && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Delivery Fee</span>
              <span>NPR {Number(order.delivery_fee).toFixed(2)}</span>
            </div>
          )}
          {order.tax && (
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tax</span>
              <span>NPR {Number(order.tax).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-[#2a221c]">
            <span className="text-gray-200">Total</span>
            <span className="text-[#C9A84C]">NPR {Number(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </section>

          {/* Status Update Button */}
      {nextStatus && order.status !== 'delivered' ? (
        <button
          onClick={() => updateStatus(nextStatus)}
          disabled={updating}
          className="w-full rider-btn rider-btn-primary text-[#0F0B08] py-3 font-semibold"
        >
              {updating
                ? 'Updating...'
                : nextLabelMap[nextStatus] || `Mark as ${nextStatus.replace(/_/g, ' ')}`}
            </button>
          ) : order.status === 'delivered' ? (
            <div className="rider-card p-4 text-center border-emerald-500/30 bg-emerald-900/20">
              <p className="text-sm text-emerald-400"> This order has been completed and delivered.</p>
            </div>
          ) : (
            <div className="rider-card p-4 text-center">
              <p className="text-sm text-gray-400"> This order is already completed.</p>
            </div>
          )}

          {/* Payment Modal (bottom sheet) */}
          {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowPaymentModal(false)} />
              <div className="w-full sm:max-w-md bg-[#1a1512] rounded-t-3xl sm:rounded-2xl border border-[#2a221c] p-4 sm:p-6 animate-slide-up max-h-[80vh] overflow-y-auto z-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold"> Payment Collection</h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-gray-400 mb-4">Order Total: NPR {Number(order.total || order.total_amount || 0).toFixed(2)}</p>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setPaymentMode('full_cash')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${paymentMode === 'full_cash' ? 'bg-[#C9A84C] text-[#0F0B08]' : 'bg-[#2a221c] text-gray-300'}`}
                  >
                    Full Cash
                  </button>
                  <button
                    onClick={() => setPaymentMode('online')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${paymentMode === 'online' ? 'bg-[#C9A84C] text-[#0F0B08]' : 'bg-[#2a221c] text-gray-300'}`}
                  >
                    Already Paid Online
                  </button>
                  <button
                    onClick={() => setPaymentMode('split')}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${paymentMode === 'split' ? 'bg-[#C9A84C] text-[#0F0B08]' : 'bg-[#2a221c] text-gray-300'}`}
                  >
                    Split
                  </button>
                </div>

                {paymentMode === 'full_cash' && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Receiving full cash</p>
                  </div>
                )}

                {paymentMode === 'online' && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">Confirming online payment — no cash expected</p>
                  </div>
                )}

                {paymentMode === 'split' && (
                  <div className="space-y-2 mb-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Cash amount</label>
                      <input type="number" value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className="w-full bg-[#0F0B08] border border-[#2a221c] rounded-md px-3 py-2 text-sm text-gray-300" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Online amount</label>
                      <input type="number" value={onlineAmount} onChange={(e) => setOnlineAmount(e.target.value)} className="w-full bg-[#0F0B08] border border-[#2a221c] rounded-md px-3 py-2 text-sm text-gray-300" />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setShowPaymentModal(false)} className="flex-1 px-3 py-2 rounded-md bg-[#2a221c] text-gray-300">Cancel</button>
                  <button
                    onClick={async () => {
                      const total = Number(order.total || order.total_amount || 0)
                      if (paymentMode === 'full_cash') {
                        await handleConfirmPaymentAndDeliver({ cash: total, online: 0 })
                      } else if (paymentMode === 'online') {
                        await handleConfirmPaymentAndDeliver({ cash: 0, online: total })
                      } else {
                        const c = Number(cashAmount || 0)
                        const o = Number(onlineAmount || 0)
                        if (c + o !== total) {
                          alert('Split amounts must sum to order total')
                          return
                        }
                        await handleConfirmPaymentAndDeliver({ cash: c, online: o })
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-md bg-[#C9A84C] text-[#0F0B08] font-semibold"
                  >
                    {updating ? 'Processing...' : 'Confirm & Deliver'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )
}
