/** Seconds each stage waits before auto-advancing to the next */
export const AUTO_STATUS_DELAYS_MS = {
  placed: 4000,
  confirmed: 5000,
  preparing: 6000,
};

export const AUTO_DELIVER_ROUTE_PROGRESS = 0.92;

export function nextAutoStatus(status) {
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

export function shouldAutoAdvance(order) {
  // Manual dispatch workflow: Admin packs items, Rider manually picks up order.
  return null;
}

export function shouldAutoDeliver(order) {
  return (
    order.status === 'out_for_delivery' &&
    (order.routeProgress ?? 0) >= AUTO_DELIVER_ROUTE_PROGRESS
  );
}

