from typing import Any, Dict, List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.db.database import fetch_all_products

router = APIRouter(prefix="/chatbot", tags=["chatbot"])


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    user_name: Optional[str] = None
    user_id: Optional[str] = None
    products: List[Dict[str, Any]] = Field(default_factory=list)
    orders: List[Dict[str, Any]] = Field(default_factory=list)
    loyalty_points: int = 0


def reply_for(message: ChatMessage) -> str:
    text = message.message.lower().strip()
    name = (message.user_name or 'there').split(' ')[0]
    products = message.products
    if not products:
        try:
            products = fetch_all_products()[:100]
        except Exception:
            products = []

    if any(word in text for word in ['hi', 'hello', 'hey', 'namaste', 'help']):
        return f"Namaste {name}. I can help with products, delivery, order status, payments, store location, and loyalty points."
    if any(word in text for word in ['track', 'order status', 'where is my order', 'delivery status', 'gps']):
        orders = [o for o in message.orders if not message.user_id or o.get('customer_id') == message.user_id or o.get('userId') == message.user_id]
        order = sorted(orders, key=lambda item: item.get('created_at') or item.get('createdAt') or '', reverse=True)[0] if orders else None
        if not order:
            return "No orders were found for your account. Place an order and I can help you track it."
        return f"Order {order.get('id', 'unknown')} is currently {str(order.get('status', 'pending')).replace('_', ' ')}."
    if any(word in text for word in ['loyalty', 'points', 'reward']):
        return f"Your current loyalty balance is {message.loyalty_points} points."
    if any(word in text for word in ['location', 'address', 'store', 'map', 'direction']):
        return "Jhyaap Station serves Kathmandu Valley. Open the delivery map or contact support for directions."
    if any(word in text for word in ['payment', 'pay', 'cod', 'esewa', 'khalti']):
        return "Available payment methods are Cash on Delivery, eSewa, and Khalti where enabled for the order."
    if any(word in text for word in ['deliver', 'area', 'zone', 'kathmandu', 'bhaktapur', 'lalitpur']):
        return "We deliver across Kathmandu, Lalitpur, and Bhaktapur. Delivery time depends on the destination and current rider availability."

    category = next((value for value in ['whisky', 'whiskey', 'vodka', 'wine', 'beer'] if value in text), None)
    if category or any(word in text for word in ['recommend', 'popular', 'best', 'suggest']):
        available = [p for p in products if p.get('inStock', p.get('instock', True))]
        if category:
            available = [p for p in available if category in str(p.get('category', '')).lower() or category in str(p.get('subcategory', '')).lower()]
        available = sorted(available, key=lambda item: float(item.get('rating') or 0), reverse=True)[:3]
        if available:
            return 'Recommended products:\n' + '\n'.join(f"- {p.get('name', 'Product')} — NPR {p.get('price', 0)}" for p in available)

    return "I can help with products, order tracking, delivery areas, payments, store location, and loyalty points."


@router.post('/message')
def chatbot_message(payload: ChatMessage):
    return {'message': reply_for(payload), 'source': 'backend'}