import { Order } from '@/types';

/** Seconds each stage waits before auto-advancing to the next */
export const AUTO_STATUS_DELAYS_MS: Record<string, number> = {
  placed: 4000,
  confirmed: 5000,
  preparing: 6000,
};

export const AUTO_DELIVER_ROUTE_PROGRESS = 0.92;

export function nextAutoStatus(status: Order['status']): Order['status'] | null {
  switch (status) {
    case 'placed':
      return 'confirmed';
    case 'confirmed':
      return 'preparing';
    case 'preparing':
      return 'out_for_delivery';
    default:
      return null;
  }
}

export function shouldAutoAdvance(order: Order): Order['status'] | null {
  if (order.status === 'delivered' || order.status === 'cancelled') return null;

  const statusAt = new Date(order.statusUpdatedAt ?? order.createdAt).getTime();
  const elapsed = Date.now() - statusAt;
  const delay = AUTO_STATUS_DELAYS_MS[order.status];

  if (delay && elapsed >= delay) {
    return nextAutoStatus(order.status);
  }

  return null;
}

export function shouldAutoDeliver(order: Order): boolean {
  return (
    order.status === 'out_for_delivery' &&
    (order.routeProgress ?? 0) >= AUTO_DELIVER_ROUTE_PROGRESS
  );
}
