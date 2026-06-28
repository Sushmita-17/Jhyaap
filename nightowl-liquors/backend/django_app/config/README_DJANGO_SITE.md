Django website backend status

This Django project currently serves only /admin/ (Django admin site).

The React frontend uses FastAPI as its public backend (e.g. /api/products, /api/auth, /api/orders, /api/cart).

If you want Django to serve pages and/or proxy API calls to FastAPI, implement:
- config/urls.py: add URL patterns for website routes and/or /api/* proxy endpoints
- views: template rendering and/or JSON proxy

Default architecture (per backend/README.md):
- React -> FastAPI :8000 -> PostgreSQL
- Django :8001 -> admin CRUD

