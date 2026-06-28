import { useState, useCallback, useEffect } from 'react';
import * as AdminAPI from '@/lib/adminAPI';

export interface AdminStats {
  period: string;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  items_sold: number;
  new_customers: number;
  repeat_customers: number;
  top_category: string;
  top_product: string;
}

export interface BillData {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  items_count: number;
  created_at: string;
  delivery_address: string;
}

export interface BillDetail {
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

export interface AnalyticsData {
  period: string;
  labels: string[];
  values: number[];
  data?: any[];
}

export function useAdminStats(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getKPISummary(period);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminBills(page: number = 1, pageSize: number = 20, filters?: { status?: string; paymentMethod?: string }) {
  const [bills, setBills] = useState<BillData[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getBills(page, pageSize, filters);
      setBills(data.items);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filters]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return { bills, total, pages, loading, error, refetch: fetchBills };
}

export function useAdminBillDetail(billId: string | null) {
  const [bill, setBill] = useState<BillDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBill = useCallback(async () => {
    if (!billId) {
      setBill(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await AdminAPI.getBillDetail(billId);
      setBill(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bill');
    } finally {
      setLoading(false);
    }
  }, [billId]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  return { bill, loading, error, refetch: fetchBill };
}

export function useAdminAnalytics(type: 'categories' | 'payment' | 'status' | 'peak-hours' | 'products', period?: string) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (type) {
        case 'categories':
          result = await AdminAPI.getCategoryBreakdown(period as any || 'monthly');
          break;
        case 'payment':
          result = await AdminAPI.getPaymentMethodBreakdown(period as any || 'monthly');
          break;
        case 'status':
          result = await AdminAPI.getOrderStatusBreakdown(period as any || 'monthly');
          break;
        case 'peak-hours':
          result = await AdminAPI.getPeakHours();
          break;
        case 'products':
          result = await AdminAPI.getTopProducts(10, period as any || 'monthly');
          break;
        default:
          throw new Error('Invalid analytics type');
      }
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [type, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Utility function to format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleString();
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

// Utility function to get status color
export function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    placed: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    confirmed: { bg: 'bg-amber-500/20', text: 'text-amber-400' },
    preparing: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
    out_for_delivery: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    delivered: { bg: 'bg-green-500/20', text: 'text-green-400' },
    cancelled: { bg: 'bg-red-500/20', text: 'text-red-400' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    completed: { bg: 'bg-green-500/20', text: 'text-green-400' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400' },
  };
  return colors[status] || { bg: 'bg-gray-500/20', text: 'text-gray-400' };
}

// Utility function to generate PDF (placeholder)
export async function generateBillPDF(bill: BillDetail): Promise<Blob> {
  // TODO: Implement actual PDF generation
  // Can use libraries like jsPDF or html2pdf
  console.log('Generating PDF for bill:', bill.order_number);
  return new Blob(['PDF content'], { type: 'application/pdf' });
}

// Utility function to print bill
export function printBill(billId: string) {
  // Open bill in new window for printing
  const url = `/admin/bills/${billId}/print`;
  window.open(url, '_blank');
}
