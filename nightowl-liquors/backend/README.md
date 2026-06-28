# Jhyaap Station Backend

FastAPI (customer API) + Django Admin (operations panel) sharing **PostgreSQL**, per [Jhyaap Station Documentation v1.0](../docs/Jhyaap_Station_Documentation_v1.0.txt).

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  FastAPI :8000   │────▶│   PostgreSQL    │
│  (Vite :3000)   │     │  /api/*          │     │                 │
└─────────────────┘     └──────────────────┘     └────────▲────────┘
                                                          │
                        ┌──────────────────┐              │
                        │ Django Admin     │──────────────┘
                        │ :8001/admin      │
                        └──────────────────┘
```

| Service | Port | Purpose |
|---------|------|---------|
| **FastAPI** | 8000 | Public REST API — products, cart, orders, auth |
| **Django Admin** | 8001 | Staff CRUD — inventory, orders, coupons, zones |
| **PostgreSQL** | 5432 | Shared database (Django owns migrations) |

## Quick start (Docker)

```bash
cd backend
cp .env.example .env
docker compose up --build
```

- API docs: http://localhost:8000/docs
- Django Admin: http://localhost:8001/admin/
  - Phone: `9801001101` / Password: `admin123` (seeded)

## Local development (without Docker)

### 1. PostgreSQL

Create database `jhyaap` or run only the db service:

```bash
docker compose up db -d
```

### 2. Python environment

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements-django.txt -r requirements-api.txt
cp .env.example .env
```

### 3. Django — migrations & seed

```bash
cd django_app
python manage.py makemigrations accounts catalog delivery orders marketing
python manage.py migrate
python manage.py seed_jhyaap
python manage.py runserver 8001
```

### 4. FastAPI

```bash
cd backend/api
uvicorn app.main:app --reload --port 8000
```

## API endpoints (Phase 1)

| Group | Base | Key routes |
|-------|------|------------|
| Auth | `/api/auth` | `POST /otp/send`, `POST /otp/verify`, `POST /refresh`, `DELETE /logout` |
| Products | `/api/products` | `GET /`, `GET /trending`, `GET /search`, `GET /{slug}` |
| Categories | `/api/categories` | `GET /`, `GET /{slug}/products` |
| Cart | `/api/cart` | `GET /`, `POST /add`, `PUT /update`, `POST /apply-coupon` |
| Orders | `/api/orders` | `POST /`, `GET /`, `GET /{id}/tracking`, `POST /{id}/payment/confirm` |
| Delivery | `/api/delivery` | `GET /areas`, `GET /zones` |
| Customers | `/api/customers` | `GET /me`, `GET /me/addresses`, `POST /me/addresses` |

### Auth flow

1. `POST /api/auth/otp/send` with `{ "phone": "9801234567" }`
2. In dev mode, OTP is returned in `dev_otp` and printed to console
3. `POST /api/auth/otp/verify` with `{ "phone", "otp", "name" }`
4. Access token in response body; refresh token in `HttpOnly` cookie `jhyaap_refresh`

### Cart sessions

Guest carts use cookie `jhyaap_cart_session` or header `X-Cart-Session`.

## Database schema

Django apps (source of truth for migrations):

- **accounts** — `users`, `customers`, `delivery_staff`, `otp_verifications`, `refresh_tokens`
- **catalog** — `categories`, `brands`, `products`, `product_variants`
- **delivery** — `delivery_zones`, `delivery_areas`, `addresses`
- **orders** — `carts`, `cart_items`, `coupons`, `orders`, `order_items`, `order_status_history`
- **marketing** — `banners`, `offers`, `reviews`, `referrals`

## Delivery zones (seeded)

| Zone | Fee (NPR) | Areas |
|------|-----------|-------|
| A — Core | 80 | Thamel, New Baneshwor, Putalisadak, Durbarmarg |
| B — Mid | 100 | Lazimpat, Baluwatar, Maharajgunj, Naxal, Sinamangal |
| C — Outer | 120 | Koteshwor, Satdobato, Tikathali, Budhanilkantha |
| D — Extended | 150 | Bhaktapur, Lalitpur Core, Patan, Kirtipur |

## Seed data

`python manage.py seed_jhyaap` loads:

- 4 delivery zones + 17 areas
- 8 categories + 29 products (from frontend catalog)
- 3 coupons (JHYAAP20, FIRST100, DELIVERY50)
- Admin superuser

Re-export products from frontend:

```bash
node -e "/* see catalog/management or re-run export script */"
```

Catalog JSON: `django_app/seed/catalog.json`

## Payments (stub)

- **COD** — order confirmed immediately (`status: placed`)
- **eSewa / Khalti** — order starts as `pending_payment`; call `POST /api/orders/{id}/payment/confirm` after gateway callback (wire real SDK verification here)

## Frontend integration

Set in frontend `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

Vite proxy (optional) in `vite.config.ts`:

```ts
server: {
  proxy: { '/api': 'http://localhost:8000' }
}
```

## Phase 2 (not included yet)

- Redis + Celery notifications
- WhatsApp Business API
- AI chatbot (`/api/chat`)
- WebSocket order updates
- Cloudinary image uploads

## Project layout

```
backend/
├── docker-compose.yml
├── .env.example
├── requirements-django.txt
├── requirements-api.txt
├── django_app/          # Django Admin + migrations
│   ├── manage.py
│   ├── config/
│   ├── accounts/
│   ├── catalog/
│   ├── delivery/
│   ├── orders/
│   ├── marketing/
│   └── seed/catalog.json
└── api/                 # FastAPI
    └── app/
        ├── main.py
        ├── models.py
        ├── schemas.py
        ├── routers/
        └── ...
```
