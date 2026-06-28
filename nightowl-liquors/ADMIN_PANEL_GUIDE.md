# Jhyaap Station Admin Panel Setup & Usage Guide

## Overview

The admin panel has been fully redesigned with:
- ✨ Beautiful dashboard with KPI cards
- 📊 Advanced analytics with interactive charts
- 📄 Bill/Invoice management system
- 🔐 Admin authentication and authorization
- 🚀 RESTful API endpoints for all admin operations

## Setup Instructions

### 1. Create an Admin User

Navigate to the backend API directory and run the admin creation script:

```bash
cd backend/api
python create_admin.py
```

Follow the prompts to enter:
- Admin phone number (10 digits, must start with 9)
- Admin email address
- Admin password (minimum 8 characters)

Example:
```
🔐 Jhyaap Station Admin User Creation
--------------------------------------------------
Enter admin phone number (10 digits): 9841234567
Enter admin email: admin@jhyaap.com
Enter admin password: ••••••••••••
Confirm password: ••••••••••••
✅ Admin user created successfully!
   Phone: 9841234567
   Email: admin@jhyaap.com
```

### 2. Start the Backend API

```bash
cd backend/api
python -m uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 3. Admin Login

1. Navigate to the admin login page in your application
2. Use the phone number and password created above
3. You'll receive an OTP to verify your identity
4. After verification, you'll be logged in as admin

### 4. Access Admin Panel

Once logged in, navigate to `/admin` routes:
- `/admin/dashboard` - Main dashboard with KPIs
- `/admin/reports` - Reports and analytics
- `/admin/bills` - Bill management
- `/admin/orders` - Order management
- `/admin/products` - Product management
- `/admin/users` - User management
- `/admin/settings` - System settings

## API Endpoints

All endpoints require admin authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### KPI Endpoints

**Get KPI Summary**
```
GET /api/admin/kpis/summary?period=daily
```

Query Parameters:
- `period`: daily | weekly | monthly | yearly

Response:
```json
{
  "period": "daily",
  "total_revenue": 125000,
  "total_orders": 45,
  "avg_order_value": 2777,
  "items_sold": 145,
  "new_customers": 8,
  "repeat_customers": 37,
  "top_category": "Whiskey",
  "top_product": "Johnnie Walker Black Label"
}
```

### Revenue Endpoints

**Get Revenue by Period**
```
GET /api/admin/revenue/by-period?period=monthly
```

Response:
```json
{
  "period": "monthly",
  "labels": ["Jan 2024", "Feb 2024", "Mar 2024"],
  "values": [456000, 523000, 489000],
  "total": 1468000
}
```

### Bills Endpoints

**List Bills**
```
GET /api/admin/bills?page=1&page_size=20&status=delivered&payment_method=cod
```

Query Parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)
- `status`: Order status filter (optional)
- `payment_method`: Payment method filter (optional)

Response:
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "order_number": "JHY-20240115-ABC123",
      "customer_name": "Rajesh Kumar",
      "customer_phone": "9841234567",
      "total_amount": 2850,
      "subtotal": 2500,
      "delivery_fee": 350,
      "discount": 0,
      "payment_method": "cod",
      "payment_status": "pending",
      "order_status": "out_for_delivery",
      "items_count": 3,
      "created_at": "2024-01-15T14:30:00",
      "delivery_address": "Thamel, Kathmandu"
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 20,
  "pages": 8
}
```

**Get Bill Detail**
```
GET /api/admin/bills/550e8400-e29b-41d4-a716-446655440000
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "order_number": "JHY-20240115-ABC123",
  "customer": {
    "name": "Rajesh Kumar",
    "phone": "9841234567"
  },
  "address": {
    "street": "Thamel, Kathmandu",
    "landmark": "Near Bhagwati Park",
    "area": "Kathmandu"
  },
  "items": [
    {
      "product_name": "Johnnie Walker Black Label",
      "quantity": 1,
      "unit_price": 1800,
      "total": 1800
    },
    {
      "product_name": "Raksi (Local)",
      "quantity": 2,
      "unit_price": 350,
      "total": 700
    }
  ],
  "subtotal": 2500,
  "delivery_fee": 350,
  "discount": 0,
  "total": 2850,
  "payment_method": "cod",
  "payment_status": "pending",
  "order_status": "out_for_delivery",
  "status_history": [
    {
      "status": "placed",
      "note": "Order received",
      "created_at": "2024-01-15T14:30:00"
    },
    {
      "status": "confirmed",
      "note": "Order confirmed",
      "created_at": "2024-01-15T14:35:00"
    }
  ],
  "notes": "",
  "created_at": "2024-01-15T14:30:00",
  "age_verified": true
}
```

### Analytics Endpoints

**Get Category Breakdown**
```
GET /api/admin/analytics/categories?period=monthly
```

**Get Payment Methods**
```
GET /api/admin/analytics/payment-methods?period=monthly
```

**Get Order Status**
```
GET /api/admin/analytics/order-status?period=monthly
```

**Get Peak Hours**
```
GET /api/admin/analytics/peak-hours
```

**Get Top Products**
```
GET /api/admin/analytics/top-products?limit=10&period=monthly
```

## Frontend Usage

### Using Admin API Client

```typescript
import * as AdminAPI from '@/lib/adminAPI';

// Fetch KPI summary
const stats = await AdminAPI.getKPISummary('daily');

// Fetch bills
const billsData = await AdminAPI.getBills(1, 20, { status: 'delivered' });

// Get bill details
const billDetail = await AdminAPI.getBillDetail(billId);

// Fetch analytics
const categories = await AdminAPI.getCategoryBreakdown('monthly');
```

### Using Admin Hooks

```typescript
import { useAdminStats, useAdminBills, useAdminAnalytics } from '@/hooks/useAdminData';

export function MyAdminComponent() {
  // Fetch stats
  const { stats, loading, error, refetch } = useAdminStats('daily');

  // Fetch bills
  const { bills, total, pages, loading: billsLoading } = useAdminBills(1, 20);

  // Fetch analytics
  const { data: categories } = useAdminAnalytics('categories', 'monthly');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Revenue: Rs {stats?.total_revenue}</p>
      <p>Orders: {stats?.total_orders}</p>
    </div>
  );
}
```

## Components

### AdminBillsModal

Display detailed bill information in a modal:

```typescript
import { AdminBillsModal } from '@/components/admin/AdminBillsModal';

<AdminBillsModal
  bill={billDetail}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

Features:
- Print bill
- Download PDF
- Copy order number
- View all items
- Status timeline
- Customer information
- Payment details

### Enhanced Reports Page

Located at `/admin/reports`, features:
- KPI cards with real-time updates
- Revenue bar charts by period
- Sales breakdown by category (donut chart)
- Payment method breakdown (donut chart)
- Order status distribution (donut chart)
- Peak order hours heatmap
- Best selling products table
- Recent bills with search functionality
- Bill detail viewer modal
- CSV export functionality

## Security Considerations

1. **Authentication**: All admin endpoints require valid JWT token from authenticated admin user
2. **Authorization**: Checks `user.is_staff == True` and `user.role == 'admin'`
3. **Rate Limiting**: Consider implementing rate limiting for analytics endpoints
4. **Data Privacy**: Customer phone numbers and addresses are visible only to admins
5. **Audit Logging**: Consider adding audit logs for admin actions

## Troubleshooting

### Admin user can't login
- Check if user has `is_staff=True` and `role='admin'` in database
- Verify password is correct (case-sensitive)
- Ensure OTP functionality is working

### API endpoints return 403 Forbidden
- Check if authenticated user has admin privileges
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`

### Bills data not loading
- Verify admin API is running on `/api/admin`
- Check browser console for CORS errors
- Ensure backend API is accessible from frontend

### Charts not rendering
- Check if data is being fetched correctly
- Verify no console errors
- Check if data format matches expected structure

## Future Enhancements

- [ ] Real-time dashboard with WebSocket updates
- [ ] Advanced filtering and search
- [ ] Custom report generation
- [ ] Bulk bill operations
- [ ] Email notifications
- [ ] Mobile-responsive admin panel
- [ ] Dark/Light mode toggle
- [ ] Two-factor authentication
- [ ] Activity audit logs
- [ ] User role management

## Support

For issues or questions about the admin panel:
1. Check the logs in `backend/api/logs/`
2. Review the implementation documentation in `ADMIN_PANEL_IMPLEMENTATION.md`
3. Check the API documentation at `/docs` when API is running
