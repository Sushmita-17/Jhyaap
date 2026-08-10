from fastapi import APIRouter

from app.api.v1.endpoints import auth, settings, products, riders, orders, earnings, customers, coupons, banners, categories, delivery, reports, notifications, tracking, websocket, chatbot, uploads

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(settings.router)
api_router.include_router(products.router)
api_router.include_router(riders.router)
api_router.include_router(orders.router)
api_router.include_router(earnings.router)
api_router.include_router(customers.router)
api_router.include_router(coupons.router)
api_router.include_router(banners.router)
api_router.include_router(categories.router)
api_router.include_router(delivery.router)
api_router.include_router(reports.router)
api_router.include_router(notifications.router)
api_router.include_router(tracking.router)
api_router.include_router(websocket.router)
api_router.include_router(chatbot.router)
api_router.include_router(uploads.router)
