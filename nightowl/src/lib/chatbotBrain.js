import { POINTS_PER_100_RS, POINTS_TO_RUPEE, MIN_REDEEM_POINTS } from '@/store/loyaltyStore';
import { STORE_INFO, storeLocationReply } from '@/lib/storeInfo';

import { getAllAreaNames } from '@/data/deliveryAreas';

const CHATBOT_API_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001') + '/api/v1/chatbot/message';

function matchAny(text, keywords) {
  return keywords.some((k) => text.includes(k));
}

function topProducts(products, category, limit = 3) {
  let list = products.filter((p) => p.inStock);
  if (category) {
    list = list.filter(
      (p) => p.category.toLowerCase().includes(category) || p.subcategory.toLowerCase().includes(category)
    );
  }
  return list.sort((a, b) => b.rating - a.rating).slice(0, limit);
}

function formatProductList(products) {
  if (products.length === 0) return 'Nothing in stock for that right now — try another category.';
  return products
    .map((p) => `• ${p.name} — Rs ${p.price.toLocaleString()} (${p.volume}, ${p.abv})`)
    .join('\n');
}

function latestActiveOrder(orders, userId) {
  const list = userId ? orders.filter((o) => o.userId === userId) : orders;
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

export async function getChatbotReply(message, context) {
  try {
    const response = await fetch(CHATBOT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, user_name: context.userName || null, user_id: context.userId || null, products: context.products || [], orders: context.orders || [], loyalty_points: context.loyaltyPoints || 0 }),
    });
    if (response.ok) {
      const result = await response.json();
      if (result.message) return result.message;
    }
  } catch (error) {
    console.warn('Backend chatbot unavailable; using local response:', error);
  }

  // Local fallback keeps the chat usable while the API is restarting.

  await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

  const text = message.toLowerCase().trim();
  const greeting = context.userName ? context.userName.split(' ')[0] : 'there';

    if (!text) {
      return `Hey ${greeting}! I'm Jhyaap Station AI — ask me about our location, orders, delivery, loyalty points, or product picks.`;
  }

  if (matchAny(text, ['hi', 'hello', 'hey', 'namaste', 'help'])) {
    return `Namaste ${greeting}! 👋 I'm your Jhyaap Station assistant.\n\nI can help with:\n• Store location & Google Maps\n• Live order tracking\n• Delivery areas & timing\n• Loyalty points & promo codes\n• Instagram & Facebook\n• Product recommendations\n\nWhat do you need?`;
  }

  if (matchAny(text, ['location', 'address', 'where are you', 'store', 'map', 'google map', 'find you', 'directions', 'kaha', 'kaha cha', 'kaha ho', 'jhyaap station', 'about store', 'store info', 'shop location', 'liquor store'])) {
    return storeLocationReply();
  }

  if (matchAny(text, ['instagram', 'insta', 'facebook', 'social', 'follow'])) {
    return {
      type: 'social',
      text: `Follow **${STORE_INFO.name}** on social media:\n\n• Instagram: ${STORE_INFO.instagram}\n• Facebook: ${STORE_INFO.facebook}\n\n📍 Store location: ${STORE_INFO.googleMapsUrl}`,
      social: {
        instagram: STORE_INFO.instagram,
        facebook: STORE_INFO.facebook,
        whatsapp: STORE_INFO.whatsapp
      }
    };
  }

  if (matchAny(text, ['track', 'order status', 'where is my order', 'delivery status', 'live track', 'gps'])) {
    const order = latestActiveOrder(context.orders, context.userId);
    if (!order) {
        return 'No orders found yet. Place an order and I\'ll track it automatically — live GPS starts when your rider heads out.';
    }
    const rider = order.deliveryRider;
    const live = order.status === 'out_for_delivery';
    let reply = `Order **${order.id}**\nStatus: **${order.status.replace(/_/g, ' ')}**\nTotal: Rs ${order.total.toLocaleString()}\nArea: ${order.address.area}`;
    if (rider) {
      reply += `\nRider: ${rider.name} (${rider.vehicle})`;
      if (live) {
          reply += `\n📡 Live GPS active — ${Math.round(rider.speed)} km/h, ${rider.status}`;
      }
    }
    if (order.status === 'placed' || order.status === 'confirmed' || order.status === 'preparing') {
        reply += '\n\nYour order will auto-advance — live map appears when out for delivery (~15 sec after placing).';
    }
    return reply;
  }

  if (matchAny(text, ['loyalty', 'points', 'reward', 'redeem'])) {
    return `**Loyalty Points**\n\nYour balance: **${context.loyaltyPoints} pts** (Rs ${Math.floor(context.loyaltyPoints / POINTS_TO_RUPEE)})\n\n• Earn ${POINTS_PER_100_RS} pt per Rs 100 spent\n• Redeem ${POINTS_TO_RUPEE} pts = Rs 1\n• Min redeem: ${MIN_REDEEM_POINTS} pts\n• Use the slider at checkout`;
  }

  if (matchAny(text, ['coupon', 'promo', 'discount', 'code'])) {
    return `**Promo codes** at checkout:\n\n• **JHYAAP20** — 20% off (min Rs 500)\n• **FIRST100** — Rs 100 off\n• **DELIVERY50** — 50% off delivery (min Rs 1000)\n\nPlus auto 10% off orders above Rs 5,000.`;
  }

  if (matchAny(text, ['deliver', 'area', 'zone', 'kathmandu', 'bhaktapur', 'where do you deliver', 'delivery area', 'service area'])) {
    return {
      type: 'delivery',
      text: `We deliver across Kathmandu, Lalitpur & Bhaktapur Valley including:\n${getAllAreaNames().slice(0, 12).map((a) => `• ${a}`).join('\n')}\n• …and ${getAllAreaNames().length - 12}+ more areas on our live map.\n\n🕐 **Delivery Hours:** 10:00 PM to 4:00 AM (NST)\n⏱️ **Delivery Time:** 30–90 min by zone\n🎁 **Free Delivery:** Orders above Rs 3,000\n\nCheck your area on the map during checkout!`,
      delivery: {
        cities: STORE_INFO.deliveryCities,
        totalAreas: getAllAreaNames().length,
        hours: '10:00 PM to 4:00 AM',
        freeDeliveryThreshold: 3000
      }
    };
  }

  if (matchAny(text, ['hour', 'open', 'close', 'time', 'night', 'timing', 'when'])) {
    return {
      type: 'hours',
      text: `**${STORE_INFO.name}** - Night Delivery Hours\n\n🕙 **Delivery Hours:** 10:00 PM to 4:00 AM (NST)\n📍 **Location:** ${STORE_INFO.address}\n🚚 **Service Area:** Kathmandu, Lalitpur & Bhaktapur Valley\n\n💡 **How It Works:**\n• Place your order online during delivery hours\n• Orders auto-process - no need to call\n• Live GPS tracking when rider heads out\n• Cash, eSewa, or Khalti payment options\n\n📞 Need help? Call ${STORE_INFO.phone}`,
      hours: {
        deliveryStart: '10:00 PM',
        deliveryEnd: '4:00 AM',
        location: STORE_INFO.address,
        googleMapsUrl: STORE_INFO.googleMapsUrl
      }
    };
  }

  if (matchAny(text, ['payment', 'pay', 'cod', 'esewa', 'khalti'])) {
    return 'Payment options:\n• **Cash on Delivery**\n• **eSewa**\n• **Khalti**\n\n18+ only — ID verified at delivery.';
  }

  if (matchAny(text, ['whisky', 'whiskey', 'scotch', 'bourbon'])) {
    const picks = topProducts(context.products, 'whisk');
    return `Top whisky picks tonight:\n\n${formatProductList(picks)}\n\nBrowse all in Products â†’ Whiskey.`;
  }

  if (matchAny(text, ['vodka'])) {
    return `Vodka picks:\n\n${formatProductList(topProducts(context.products, 'vodka'))}`;
  }

  if (matchAny(text, ['wine'])) {
    return `Wine picks:\n\n${formatProductList(topProducts(context.products, 'wine'))}`;
  }

  if (matchAny(text, ['beer'])) {
    return `Beer picks:\n\n${formatProductList(topProducts(context.products, 'beer'))}`;
  }

  if (matchAny(text, ['recommend', 'popular', 'best', 'suggest'])) {
    return `Staff picks right now:\n\n${formatProductList(topProducts(context.products))}`;
  }

  if (matchAny(text, ['price', 'cost', 'how much'])) {
    const product = context.products.find(
      (p) => p.inStock && (text.includes(p.name.toLowerCase()) || text.includes(p.brand.toLowerCase()))
    );
    if (product) {
      return `${product.name} is **Rs ${product.price.toLocaleString()}** (${product.volume}, ${product.abv}). ${product.inStock ? 'In stock âœ…' : 'Out of stock'}`;
    }
    return `Prices vary by brand. Popular range: Rs 1,500–9,000. Search products or ask "recommend whisky".`;
  }

  if (matchAny(text, ['contact', 'phone', 'call', 'whatsapp', 'human', 'agent', 'support', 'help'])) {
    return {
      type: 'contact',
      text: `**Contact ${STORE_INFO.name}**\n\n📞 **Phone:** ${STORE_INFO.phone}\n📞 **Secondary:** ${STORE_INFO.phone2}\n📧 **Email:** ${STORE_INFO.email}\n💬 **WhatsApp:** ${STORE_INFO.whatsapp}\n\n📍 **Location:** ${STORE_INFO.googleMapsUrl}\n\nFor quick support, WhatsApp us directly!`,
      contact: {
        phone: STORE_INFO.phone,
        phone2: STORE_INFO.phone2,
        email: STORE_INFO.email,
        whatsapp: STORE_INFO.whatsapp,
        googleMapsUrl: STORE_INFO.googleMapsUrl
      }
    };
  }

  if (matchAny(text, ['admin', 'staff'])) {
    return 'Staff/admin panel is at `/station/night-desk` — login required. Customers use this chat for store help.';
  }

  const product = context.products.find(
    (p) =>
      p.inStock &&
      (text.includes(p.name.toLowerCase().slice(0, 8)) ||
        text.includes(p.brand.toLowerCase()) ||
        p.tags.some((t) => text.includes(t)))
  );
  if (product) {
    return `**${product.name}**\nRs ${product.price.toLocaleString()} Â· ${product.volume} Â· ${product.abv}\nRating: ${product.rating}/5 (${product.reviews} reviews)\n${product.inStock ? 'âœ… In stock' : 'âŒ Out of stock'}`;
  }

  return `I'm not sure about that one. Try asking:\n• "Store location"\n• "Track my order"\n• "Instagram"\n• "Delivery areas"\n\nOr WhatsApp us at ${STORE_INFO.phone}`;
}

export const QUICK_PROMPTS = [
  'Store location',
  'Track my order',
  'Delivery areas',
  'Loyalty points',
  'Instagram',
];

