from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .routers import admin, auth, cart, categories, customers, delivery, orders, products


settings = get_settings()

app = FastAPI(
    title='Jhyaap Station API',
    description='FastAPI backend for Jhyaap Station — liquor delivery, Kathmandu Valley',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

API_PREFIX = '/api'

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(cart.router, prefix=API_PREFIX)
app.include_router(delivery.router, prefix=API_PREFIX)
app.include_router(customers.router, prefix=API_PREFIX)
app.include_router(orders.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'jhyaap-api', 'version': '1.0.0'}


@app.get('/api')
def api_root():
    return {
        'message': 'Jhyaap Station API',
        'docs': '/docs',
        'endpoints': {
            'auth': '/api/auth',
            'products': '/api/products',
            'categories': '/api/categories',
            'cart': '/api/cart',
            'orders': '/api/orders',
            'delivery': '/api/delivery',
            'customers': '/api/customers',
            'admin': '/api/admin',
        },
    }
