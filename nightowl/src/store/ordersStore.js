import { create } from 'zustand';
import { createRiderAtStore } from '@/lib/riders';
import {
  STORE_LOCATION,
  bearingBetween,
  getAreaCoordinates,
  interpolatePoint,
} from '@/lib/deliveryLocations';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { shouldAutoAdvance, shouldAutoDeliver } from '@/lib/orderAutomation';
import { useNotificationStore } from '@/store/notificationStore';
import { createBackendOrder } from '@/lib/backendAPI';

const generateOrderId = () => `ORD_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

const generateETA = () => {
  const now = new Date();
  const eta = new Date(now.getTime() + 45 * 60000);
  return eta.toISOString();
};

const loadOrdersFromStorage = () => {
  try {
    const stored = localStorage.getItem('jhyaap_orders');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveOrdersToStorage = (orders) => {
  localStorage.setItem('jhyaap_orders', JSON.stringify(orders));
};

function applyRiderForDelivery(order) {
  if (!order.deliveryRider) return order;
  return {
    ...order,
    deliveryRider: {
      ...order.deliveryRider,
      status: 'driving',
      speed: 22 + Math.random() * 12,
      updatedAt: new Date().toISOString(),
    },
  };
}

function applyRiderPicking(order) {
  if (!order.deliveryRider) return order;
  const store = order.storeCoords ?? STORE_LOCATION;
  return {
    ...order,
    deliveryRider: {
      ...order.deliveryRider,
      lat: store.lat,
      lng: store.lng,
      status: 'picking',
      speed: 0,
      heading: 45 + Math.random() * 90,
      updatedAt: new Date().toISOString(),
    },
  };
}

function earnLoyaltyForOrder(order, userId) {
  if (!userId || order.pointsEarned) return;
  const points = useLoyaltyStore.getState().calculateEarnPoints(order.total);
  if (points > 0) {
    useLoyaltyStore.getState().earnPoints(userId, points, order.id, `Earned from order ${order.id}`);
  }
  return points;
}

export const useOrdersStore = create((set, get) => ({
  orders: loadOrdersFromStorage(),
  selectedOrderId: null,
  hydrateOrders: (orders) => set({ orders }),

  createOrder: async (items, address, paymentMethod, discount, userId, pointsRedeemed = 0, notes, couponCode, paymentScreenshot = null) => {
    const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const providedLat = Number(address.lat ?? address.latitude);
    const providedLng = Number(address.lng ?? address.longitude);
    const destination = Number.isFinite(providedLat) && Number.isFinite(providedLng)
      ? { lat: providedLat, lng: providedLng, label: address.label }
      : getAreaCoordinates(address.area);
    const rider = createRiderAtStore();

    const tempId = generateOrderId();
    const newOrder = {
      id: tempId,
      orderNumber: null, // Will be set from backend
      items,
      subtotal,
      discount,
      deliveryFee: address.deliveryFee,
      total: subtotal - discount + address.deliveryFee,
      status: 'placed',
      address: {
        ...address,
        lat: destination.lat,
        lng: destination.lng,
      },
      paymentMethod,
      couponCode,
      notes,
      userId,
      createdAt: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString(),
      eta: generateETA(),
      deliveryStaffName: rider.name,
      deliveryStaffPhone: rider.phone,
      deliveryRider: rider,
      storeCoords: { ...STORE_LOCATION },
      destinationCoords: { ...destination, label: address.label },
      routeProgress: 0,
      pointsRedeemed,
      paymentScreenshot,
    };

    if (pointsRedeemed > 0) {
      useLoyaltyStore.getState().redeemPoints(userId, pointsRedeemed, tempId);
    }

    // Save locally first
    set((state) => {
      const updated = [...state.orders, newOrder];
      saveOrdersToStorage(updated);
      return { orders: updated };
    });

    try {
      const backendOrder = await createBackendOrder(newOrder);
      // Update with backend order number
      const updatedOrder = {
        ...newOrder,
        id: backendOrder.id,
        orderNumber: backendOrder.order_number,
      };

      // Replace temp order with backend order
      set((state) => {
        const updated = state.orders.map(o => o.id === tempId ? updatedOrder : o);
        saveOrdersToStorage(updated);
        return { orders: updated };
      });

      // Add notification for new order
      useNotificationStore.getState().addNotification({
        type: 'order',
        title: 'New Order Received',
        message: `Order No ${backendOrder.order_number} placed for Rs ${newOrder.total.toLocaleString()}`,
        actionUrl: `/admin/orders`,
      });

      return updatedOrder;
    } catch (error) {
      console.warn('Backend order sync failed; local order retained:', error.message);
      // Add notification for new order with temp ID
      useNotificationStore.getState().addNotification({
        type: 'order',
        title: 'New Order Received',
        message: `Order ${tempId} placed for Rs ${newOrder.total.toLocaleString()}`,
        actionUrl: `/admin/orders`,
      });
      return newOrder;
    }
  },

  updateOrderStatus: (orderId, status, userId) => {
    set((state) => {
      const updated = state.orders.map((order) => {
        if (order.id !== orderId) return order;

        let next = { ...order, status, statusUpdatedAt: new Date().toISOString() };

        if (status === 'preparing') {
          next = applyRiderPicking(next);
          useNotificationStore.getState().addNotification({
            type: 'order',
            title: 'Order Preparing',
            message: `Order ${orderId} is now being prepared`,
            actionUrl: `/admin/orders`,
          });
        }

        if (status === 'out_for_delivery') {
          next = applyRiderForDelivery(next);
          useNotificationStore.getState().addNotification({
            type: 'delivery',
            title: 'Order Out for Delivery',
            message: `Order ${orderId} is now out for delivery`,
            actionUrl: `/admin/orders`,
          });
        }

        if (status === 'delivered') {
          const earned = earnLoyaltyForOrder(next, userId ?? order.userId);
          next = { ...next, pointsEarned: earned ?? next.pointsEarned };
          if (next.deliveryRider) {
            next = {
              ...next,
              deliveryRider: {
                ...next.deliveryRider,
                status: 'arrived',
                speed: 0,
                lat: next.destinationCoords?.lat ?? next.deliveryRider.lat,
                lng: next.destinationCoords?.lng ?? next.deliveryRider.lng,
                updatedAt: new Date().toISOString(),
              },
              routeProgress: 1,
            };
          }
          useNotificationStore.getState().addNotification({
            type: 'delivery',
            title: 'Order Delivered',
            message: `Order ${orderId} has been delivered successfully`,
            actionUrl: `/admin/orders`,
          });
        }

        return next;
      });
      saveOrdersToStorage(updated);
      return { orders: updated };
    });
  },

  tickRiderPosition: (orderId) => {
    get().tickActiveDeliveries(orderId);
  },

  tickActiveDeliveries: (onlyOrderId) => {
    set((state) => {
      const updated = state.orders.map((order) => {
        if (onlyOrderId && order.id !== onlyOrderId) return order;
        if (!order.deliveryRider) return order;

        const store = order.storeCoords ?? STORE_LOCATION;

        if (order.status === 'preparing' || order.status === 'confirmed') {
          const wobble = 0.00008;
          const t = Date.now() / 1200;
          return {
            ...order,
            deliveryRider: {
              ...order.deliveryRider,
              lat: store.lat + Math.sin(t) * wobble,
              lng: store.lng + Math.cos(t * 0.8) * wobble,
              status: (order.status === 'preparing' ? 'picking' : 'idle'),
              speed: 0,
              heading: 30 + Math.sin(t * 0.5) * 20,
              updatedAt: new Date().toISOString(),
            },
          };
        }

        if (order.status !== 'out_for_delivery') return order;

        const dest = order.destinationCoords ?? getAreaCoordinates(order.address.area);
        const progress = Math.min(1, (order.routeProgress ?? 0) + 0.04 + Math.random() * 0.03);
        const position = interpolatePoint(store, dest, progress);
        const heading = bearingBetween(
          { lat: order.deliveryRider.lat, lng: order.deliveryRider.lng },
          dest
        );
        const riderStatus = progress >= 1 ? 'arrived' : 'driving';

        return {
          ...order,
          routeProgress: progress,
          deliveryRider: {
            ...order.deliveryRider,
            lat: position.lat,
            lng: position.lng,
            heading,
            speed: progress >= 1 ? 0 : 20 + Math.random() * 15,
            status: riderStatus,
            updatedAt: new Date().toISOString(),
          },
        };
      });
      saveOrdersToStorage(updated);
      return { orders: updated };
    });
  },

  advanceOrderPipeline: () => {
    const orders = get().orders;

    for (const order of orders) {
      const nextStatus = shouldAutoAdvance(order);
      if (nextStatus) {
        get().updateOrderStatus(order.id, nextStatus, order.userId);
        continue;
      }

      const fresh = get().getOrderById(order.id);
      if (fresh && shouldAutoDeliver(fresh)) {
        get().updateOrderStatus(fresh.id, 'delivered', fresh.userId);
      }
    }
  },

  getOrders: () => get().orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  getOrderById: (id) => get().orders.find((o) => o.id === id),

  selectOrder: (id) => set({ selectedOrderId: id }),

  getOrdersCount: () => get().orders.length,

  clearOrders: () => {
    set({ orders: [] });
    saveOrdersToStorage([]);
  },
}));




