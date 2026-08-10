# Jhyaap Station Backend Implementation Plan

## Current Backend Status

### ✅ Completed Endpoints:
- **Auth**: Rider login (`/api/v1/auth/rider-login`)
- **Products**: CRUD operations (`/api/v1/products`)
- **Riders**: CRUD operations (`/api/v1/riders`)
- **Orders**: CRUD operations (`/api/v1/orders`)
- **Earnings**: CRUD operations (`/api/v1/earnings`)
- **Settings**: Dynamic settings (`/api/v1/settings`)

### ✅ Infrastructure:
- FastAPI framework
- Supabase database connection
- Rate limiting (slowapi)
- CORS configuration
- JWT authentication
- Password hashing (SHA-256)

---

## Missing Backend Endpoints

### 1. Admin Panel Features

#### 1.1 Coupons Management
**Admin Page**: `AdminCouponsPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/coupons` - List all coupons
- `POST /api/v1/coupons` - Create new coupon
- `PUT /api/v1/coupons/{id}` - Update coupon
- `DELETE /api/v1/coupons/{id}` - Delete coupon
- `POST /api/v1/coupons/{id}/validate` - Validate coupon code

**Database Requirements**:
- `coupons` table with fields: id, code, type, value, min_order, max_uses, uses_count, expires_at, status, created_at

#### 1.2 Categories Management  
**Admin Page**: `AdminCategoriesPage.tsx`
**Status**: Partially handled by products endpoint
**Missing Endpoints**:
- `GET /api/v1/categories` - List all categories
- `POST /api/v1/categories` - Create custom category
- `PUT /api/v1/categories/{id}` - Update category
- `DELETE /api/v1/categories/{id}` - Delete category

#### 1.3 Banners Management
**Admin Page**: `AdminBannersPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/banners` - List all banners
- `POST /api/v1/banners` - Create new banner
- `PUT /api/v1/banners/{id}` - Update banner
- `DELETE /api/v1/banners/{id}` - Delete banner

**Database Requirements**:
- `banners` table with fields: id, title, subtitle, image, cta, link, tag

#### 1.4 Flash Sales Management
**Admin Page**: `AdminFlashSalePage.tsx`
**Missing Endpoints**:
- `GET /api/v1/flash-sales` - List flash sales
- `POST /api/v1/flash-sales` - Create flash sale
- `PUT /api/v1/flash-sales/{id}` - Update flash sale
- `DELETE /api/v1/flash-sales/{id}` - Delete flash sale

#### 1.5 Trending Products Management
**Admin Page**: `AdminTrendingPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/trending` - List trending products
- `POST /api/v1/trending` - Add product to trending
- `DELETE /api/v1/trending/{product_id}` - Remove from trending

#### 1.6 Bulk Images Management
**Admin Page**: `AdminBulkImagesPage.tsx`
**Missing Endpoints**:
- `POST /api/v1/products/bulk-upload` - Bulk upload product images
- `POST /api/v1/images/upload` - Single image upload with processing

#### 1.7 Users/Customers Management
**Admin Page**: `AdminUsersPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/customers` - List all customers
- `GET /api/v1/customers/{id}` - Get customer details
- `PUT /api/v1/customers/{id}` - Update customer
- `DELETE /api/v1/customers/{id}` - Delete customer
- `GET /api/v1/customers/{id}/orders` - Get customer order history

**Database Requirements**:
- `customers` table with fields: id, name, phone_number, email, address, created_at, updated_at

#### 1.8 Professionals Management
**Admin Page**: `AdminProfessionalsPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/professionals` - List professionals
- `POST /api/v1/professionals` - Create professional
- `PUT /api/v1/professionals/{id}` - Update professional
- `DELETE /api/v1/professionals/{id}` - Delete professional

#### 1.9 Reports & Analytics
**Admin Page**: `AdminReportsPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/reports/sales` - Sales reports (daily/weekly/monthly)
- `GET /api/v1/reports/revenue` - Revenue analytics
- `GET /api/v1/reports/orders` - Order statistics
- `GET /api/v1/reports/products` - Product performance
- `GET /api/v1/reports/customers` - Customer analytics
- `GET /api/v1/reports/riders` - Rider performance

#### 1.10 Revenue Management
**Admin Page**: `AdminRevenuePage.tsx`
**Missing Endpoints**:
- `GET /api/v1/revenue/summary` - Revenue summary
- `GET /api/v1/revenue/by-period` - Revenue by time period
- `GET /api/v1/revenue/by-category` - Revenue by category

#### 1.11 Delivery Management
**Admin Page**: `AdminDeliveryPage.tsx`
**Missing Endpoints**:
- `GET /api/v1/delivery/riders` - List all delivery riders with status
- `GET /api/v1/delivery/active-orders` - Get active delivery orders
- `POST /api/v1/delivery/assign` - Assign order to rider
- `PUT /api/v1/delivery/status/{order_id}` - Update delivery status

#### 1.12 Inventory Management
**Admin Page**: `AdminInventoryPage.tsx`
**Status**: Partially handled by products endpoint
**Missing Endpoints**:
- `GET /api/v1/inventory/low-stock` - Get low stock products
- `GET /api/v1/inventory/out-of-stock` - Get out of stock products
- `PUT /api/v1/inventory/{product_id}/stock` - Update stock levels

---

### 2. Nightowl (Customer Frontend) Features

#### 2.1 Customer Authentication
**Missing Endpoints**:
- `POST /api/v1/auth/customer-register` - Customer registration
- `POST /api/v1/auth/customer-login` - Customer login
- `POST /api/v1/auth/customer-otp` - Send OTP for login
- `POST /api/v1/auth/customer-verify` - Verify OTP

#### 2.2 Customer Orders
**Missing Endpoints**:
- `POST /api/v1/orders` - Create customer order
- `GET /api/v1/orders/customer/{customer_id}` - Get customer orders
- `PUT /api/v1/orders/{id}/cancel` - Cancel order

#### 2.3 Customer Profile
**Missing Endpoints**:
- `GET /api/v1/customers/profile` - Get customer profile
- `PUT /api/v1/customers/profile` - Update customer profile
- `POST /api/v1/customers/addresses` - Add address
- `PUT /api/v1/customers/addresses/{id}` - Update address

#### 2.4 Order Tracking
**Missing Endpoints**:
- `GET /api/v1/orders/{id}/tracking` - Get real-time order tracking
- `GET /api/v1/orders/{id}/status` - Get order status updates

#### 2.5 Reviews & Ratings
**Missing Endpoints**:
- `POST /api/v1/products/{id}/reviews` - Add product review
- `GET /api/v1/products/{id}/reviews` - Get product reviews
- `PUT /api/v1/reviews/{id}` - Update review

---

### 3. Rider Panel Features

#### 3.1 Rider Earnings (Current Implementation Uses Supabase Direct)
**Status**: Currently using Supabase direct access - needs backend migration
**Missing Endpoints**:
- `GET /api/v1/earnings/rider/{rider_id}` - Get rider earnings (already exists)
- `GET /api/v1/earnings/rider/{rider_id}/summary` - Earnings summary by period
- `GET /api/v1/earnings/rider/{rider_id}/cash-on-hand` - Cash on hand calculation

#### 3.2 Rider Order Management
**Status**: Partially implemented
**Missing Endpoints**:
- `PUT /api/v1/orders/{id}/accept` - Accept order
- `PUT /api/v1/orders/{id}/reject` - Reject order
- `PUT /api/v1/orders/{id}/pickup` - Mark order as picked up
- `PUT /api/v1/orders/{id}/deliver` - Mark order as delivered
- `POST /api/v1/orders/{id}/location` - Update rider location

#### 3.3 Rider Availability
**Status**: Implemented in auth store but needs backend support
**Missing Endpoints**:
- `PUT /api/v1/riders/{id}/availability` - Update rider availability status
- `GET /api/v1/riders/{id}/availability` - Get rider availability

#### 3.4 Rider Profile
**Missing Endpoints**:
- `GET /api/v1/riders/{id}/profile` - Get rider profile details
- `PUT /api/v1/riders/{id}/profile` - Update rider profile

---

## Database Schema Requirements

### Additional Tables Needed:

```sql
-- Coupons Table
CREATE TABLE coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'percentage', 'flat', 'free_delivery'
    value REAL NOT NULL,
    min_order REAL DEFAULT 0,
    max_uses INTEGER DEFAULT 0,
    uses_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'expired', 'disabled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banners Table
CREATE TABLE banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image TEXT NOT NULL,
    cta TEXT DEFAULT 'Shop Now',
    link TEXT DEFAULT '/products',
    tag TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flash Sales Table
CREATE TABLE flash_sales (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    discount_percentage REAL NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Trending Products Table
CREATE TABLE trending_products (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Product Reviews Table
CREATE TABLE product_reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Customer Addresses Table
CREATE TABLE customer_addresses (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    street TEXT NOT NULL,
    landmark TEXT,
    city TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Tracking Table
CREATE TABLE order_tracking (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    location TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

---

## Implementation Priority

### Phase 1: Critical (High Priority)
1. **Customer Authentication** - Registration, login, OTP
2. **Customer Orders** - Create, view, cancel orders
3. **Customer Profile** - Profile management
4. **Rider Order Actions** - Accept, reject, pickup, deliver
5. **Order Tracking** - Real-time tracking updates

### Phase 2: Important (Medium Priority)
6. **Coupons Management** - Full CRUD operations
7. **Banners Management** - Banner CRUD
8. **Inventory Management** - Stock tracking
9. **Delivery Management** - Rider assignment
10. **Rider Earnings Backend** - Migrate from Supabase direct

### Phase 3: Enhancement (Lower Priority)
11. **Flash Sales** - Time-limited promotions
12. **Trending Products** - Product recommendations
13. **Reviews & Ratings** - Customer feedback
14. **Reports & Analytics** - Business intelligence
15. **Revenue Management** - Financial reporting

---

## Next Steps

1. **Phase 1 Implementation** - Start with critical customer and rider features
2. **Database Migration** - Create additional tables in Supabase
3. **API Development** - Implement missing endpoints
4. **Frontend Integration** - Update frontend to use new backend endpoints
5. **Testing** - Comprehensive testing of new features
6. **Documentation** - Update API documentation

---

## Technical Considerations

### Authentication
- Implement customer JWT tokens (separate from rider tokens)
- Add OTP verification for customer login
- Implement refresh token mechanism

### File Upload
- Add image upload functionality for products and banners
- Implement image compression and optimization
- Add CDN integration for static assets

### Real-time Features
- Implement WebSocket for real-time order tracking
- Add rider location updates
- Implement live order status updates

### Performance
- Add database indexing for frequently queried fields
- Implement caching for product catalog
- Add pagination for large datasets

### Security
- Add API rate limiting for customer endpoints
- Implement CSRF protection
- Add input validation and sanitization
- Implement role-based access control (RBAC)
