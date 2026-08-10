class NotificationService {
  constructor() {
    this.permission = 'default';
    this.supported = 'Notification' in window;
  }

  async requestPermission() {
    if (!this.supported) {
      console.warn('Notifications not supported');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const result = await Notification.requestPermission();
    this.permission = result;
    return result === 'granted';
  }

  show(title, options = {}) {
    if (!this.supported || this.permission !== 'granted') {
      console.log('Notification not shown:', title, options);
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  showOrderNotification(order, type) {
    const normalizedType = type === 'assigned' || type === 'rider_assigned'
      ? 'rider_assigned'
      : type === 'picked_up' || type === 'out_for_delivery'
        ? 'picked_up'
        : type === 'delivered'
          ? 'delivered'
          : 'order_confirmed';
    return this.showCustomerNotification({
      ...order,
      id: order.id || order.orderId,
      orderId: order.orderId || order.id,
      riderName: order.riderName || 'Your rider',
      currentLocation: order.currentLocation || 'Jhyaap Station Hub',
    }, normalizedType);
  }
  // Customer notifications only
  showCustomerNotification(order, type) {
    const messages = {
      order_confirmed: {
        title: 'Order Confirmed',
        body: `Your order ${order.orderId} has been confirmed`,
        tag: `order-${order.id}`
      },
      rider_assigned: {
        title: 'Rider Assigned',
        body: `${order.riderName} has been assigned to your order`,
        tag: `order-${order.id}`
      },
      picked_up: {
        title: 'Order Picked Up',
        body: `Rider has picked up your order ${order.orderId}`,
        tag: `order-${order.id}`
      },
      rider_nearby: {
        title: 'Rider Nearby',
        body: `Your rider is now at ${order.currentLocation}`,
        tag: `order-${order.id}`
      },
      delivered: {
        title: 'Order Delivered',
        body: `Your order ${order.orderId} has been delivered successfully`,
        tag: `order-${order.id}`
      }
    };

    const message = messages[type] || messages.order_confirmed;
    return this.show(message.title, {
      body: message.body,
      tag: message.tag,
      requireInteraction: true
    });
  }
}

export const notificationService = new NotificationService();
