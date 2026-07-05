import {
  X,
  Download,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  Clock,
} from 'lucide-react';

interface BillDetail {
  id: string;
  order_number: string;
  customer: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    landmark: string;
    area: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  status_history: Array<{
    status: string;
    note: string;
    created_at: string;
  }>;
  notes: string;
  created_at: string;
  age_verified: boolean;
}

function formatStatusLabel(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AdminBillsModal({
  bill,
  loading = false,
  error = null,
  isOpen,
  onClose,
}: {
  bill?: BillDetail | null;
  loading?: boolean;
  error?: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
    placed: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock },
    confirmed: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: CheckCircle },
    preparing: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Package },
    out_for_delivery: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: Truck },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertCircle },
  };

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
  };

  const getStatusConfig = (status: string) => statusColors[status] || statusColors.placed;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Implement PDF download logic
    console.log('Download PDF for bill:', bill?.order_number);
  };

  const handleCopyOrderNumber = () => {
    if (bill?.order_number) navigator.clipboard.writeText(bill.order_number);
  };

  if (loading || !bill) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-3xl overflow-hidden bg-night-900 rounded-2xl border border-white/10 shadow-2xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-night-800 to-night-700/50 p-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {loading ? 'Loading bill...' : 'Bill not available'}
              </h2>
              {error ? <p className="mt-1 text-sm text-neon-rose">{error}</p> : null}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white/10 transition-colors text-night-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-sm text-night-400">
              {loading
                ? 'Fetching bill details from the admin API.'
                : 'Unable to display invoice details. Try selecting another bill or refresh the page.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-night-900 rounded-2xl border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-night-800 to-night-700/50 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Bill Details</h2>
            <p className="mt-1 text-sm text-night-400">Order {bill.order_number}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyOrderNumber}
              title="Copy order number"
              className="rounded-lg p-2 hover:bg-white/10 transition-colors text-night-300 hover:text-white"
            >
              <Copy className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              title="Print bill"
              className="rounded-lg p-2 hover:bg-white/10 transition-colors text-night-300 hover:text-white"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={handleDownloadPDF}
              title="Download PDF"
              className="rounded-lg p-2 hover:bg-white/10 transition-colors text-night-300 hover:text-white"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-white/10 transition-colors text-night-300 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Payment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-night-800/50 border border-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-night-500 mb-2">Order Status</p>
              <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${getStatusConfig(bill.order_status).bg}`}>
                {(() => {
                  const config = getStatusConfig(bill.order_status);
                  const Icon = config.icon;
                  return (
                    <>
                      <Icon className={`h-4 w-4 ${config.text}`} />
                      <span className={`font-semibold ${config.text}`}>{formatStatusLabel(bill.order_status)}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className="rounded-xl bg-night-800/50 border border-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-night-500 mb-2">Payment Status</p>
              <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 ${paymentStatusColors[bill.payment_status]}`}>
                <span className="font-semibold">{bill.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-night-500">Customer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-night-400 mb-1">Name</p>
                <p className="font-semibold text-white">{bill.customer.name}</p>
              </div>
              <div>
                <p className="text-xs text-night-400 mb-1">Phone</p>
                <p className="font-semibold text-white">{bill.customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-night-500">Delivery Address</h3>
            <div>
              <p className="text-sm text-white">{bill.address.street}</p>
              {bill.address.landmark && <p className="text-sm text-night-300">{bill.address.landmark}</p>}
              <p className="mt-2 text-xs font-semibold text-neon-amber">{bill.address.area}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-xl bg-night-800/30 border border-white/5 overflow-hidden">
            <div className="border-b border-white/5 bg-night-950/50 px-4 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-night-500">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5 bg-night-950/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-night-500">Product</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-night-500">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-night-500">Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-night-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {bill.items.map((item, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">{item.product_name}</td>
                      <td className="px-4 py-3 text-center text-night-300">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-night-300">Rs {item.unit_price.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-semibold text-white">Rs {item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bill Summary */}
          <div className="rounded-xl bg-gradient-to-br from-neon-amber/15 via-night-800/30 to-night-800/10 border border-neon-amber/30 p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-night-300">Subtotal</span>
                <span className="font-semibold text-white">Rs {bill.subtotal.toLocaleString()}</span>
              </div>

              {bill.delivery_fee > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-night-300">Delivery Fee</span>
                  <span className="font-semibold text-white">Rs {bill.delivery_fee.toLocaleString()}</span>
                </div>
              )}

              {bill.discount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-green-400">Discount</span>
                  <span className="font-semibold text-green-400">-Rs {bill.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-neon-amber/30 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-neon-amber">Total Amount</span>
                  <span className="text-2xl font-bold text-neon-amber">Rs {bill.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-night-500 mb-2">Payment Method</p>
              <p className="font-semibold text-white capitalize">{bill.payment_method.replace('_', ' ')}</p>
            </div>

            <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-night-500 mb-2">Order Date</p>
              <p className="font-semibold text-white text-sm">{new Date(bill.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Status History */}
          <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-night-500">Status Timeline</h3>
            <div className="space-y-3">
              {bill.status_history.map((history, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="h-3 w-3 rounded-full bg-neon-amber mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-white capitalize">{history.status.replace('_', ' ')}</p>
                    {history.note && <p className="text-xs text-night-400 mt-1">{history.note}</p>}
                    <p className="text-xs text-night-500 mt-1">{new Date(history.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div className="rounded-xl bg-night-800/30 border border-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-night-500 mb-2">Special Notes</p>
              <p className="text-sm text-night-300 italic">{bill.notes}</p>
            </div>
          )}

          {/* Age Verification */}
          {bill.age_verified && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
              <p className="text-sm text-green-400 font-semibold">Age verification completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
