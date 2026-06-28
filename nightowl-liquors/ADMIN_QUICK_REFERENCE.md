# 🎯 Admin Panel Quick Reference

## Project Structure

```
nightowl-liquors/
├── backend/
│   ├── api/
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   │   └── admin.py ⭐ NEW - Admin API endpoints
│   │   │   ├── deps.py (✏️ UPDATED - added get_current_admin)
│   │   │   └── main.py (✏️ UPDATED - registered admin router)
│   │   └── create_admin.py ⭐ NEW - Admin user creation script
│   │
│   └── django_app/
│       └── accounts/
│           └── management/
│               └── commands/
│                   └── create_admin.py ⭐ NEW - Django management command
│
├── src/
│   ├── components/
│   │   └── admin/
│   │       └── AdminBillsModal.tsx ⭐ NEW - Bill detail modal
│   │
│   ├── hooks/
│   │   └── useAdminData.ts ⭐ NEW - Admin data management hooks
│   │
│   ├── lib/
│   │   └── adminAPI.ts ⭐ NEW - Admin API client
│   │
│   └── pages/
│       └── admin/
│           └── AdminReportsPage.tsx (✏️ UPDATED - added bills section)
│
├── ADMIN_PANEL_GUIDE.md ⭐ NEW - Complete setup guide
└── ADMIN_PANEL_IMPLEMENTATION.md ⭐ NEW - Technical documentation
```

## Key API Endpoints

```
GET  /api/admin/kpis/summary              - Get KPI metrics
GET  /api/admin/revenue/by-period         - Get revenue trends
GET  /api/admin/bills                     - List bills
GET  /api/admin/bills/{bill_id}           - Get bill details
GET  /api/admin/analytics/categories      - Category breakdown
GET  /api/admin/analytics/payment-methods - Payment breakdown
GET  /api/admin/analytics/order-status    - Status breakdown
GET  /api/admin/analytics/peak-hours      - Peak hours analysis
GET  /api/admin/analytics/top-products    - Top products
```

## Quick Start

### 1. Create Admin User

**FastAPI Backend:**
```bash
cd backend/api
python create_admin.py
```

**Django Backend:**
```bash
cd backend/django_app
python manage.py create_admin
```

### 2. Access Admin Panel

1. Navigate to admin login page
2. Enter phone and password created above
3. Verify OTP
4. Access reports at `/admin/reports`

### 3. View Bills

- Click "View" button on any bill in the Recent Bills section
- Modal will open with complete bill details
- Use print or download buttons as needed

## Frontend Components

### AdminBillsModal
```typescript
import { AdminBillsModal } from '@/components/admin/AdminBillsModal';

<AdminBillsModal
  bill={billDetail}
  isOpen={isOpen}
  onClose={handleClose}
/>
```

### Custom Hooks
```typescript
import { useAdminStats, useAdminBills } from '@/hooks/useAdminData';

const { stats, loading } = useAdminStats('daily');
const { bills, total } = useAdminBills(1, 20);
```

### API Client
```typescript
import * as AdminAPI from '@/lib/adminAPI';

const kpis = await AdminAPI.getKPISummary('daily');
const bills = await AdminAPI.getBills(1, 20);
```

## Admin Features

✨ **Dashboard**
- Real-time KPI cards
- Revenue trends
- Sales breakdown

📊 **Analytics**
- Category breakdown
- Payment methods
- Order status
- Peak hours
- Top products

📄 **Bills Management**
- Search bills
- View details
- Print bills
- Download PDF
- View status history

## Authentication

All endpoints require admin JWT token:
```
Authorization: Bearer <access_token>
```

User must have:
- `is_staff = True`
- `role = 'admin'`

## Troubleshooting

### Bills not loading?
1. Check API is running on `/api/admin`
2. Verify authentication token is valid
3. Check browser console for errors

### Can't login as admin?
1. Verify user was created with admin script
2. Check user is_staff and role in database
3. Verify OTP functionality

### Charts not rendering?
1. Check if data is being fetched
2. Verify data structure matches component expectations
3. Look for JavaScript errors in console

## Documentation Files

- **ADMIN_PANEL_GUIDE.md** - Setup & usage guide
- **ADMIN_PANEL_IMPLEMENTATION.md** - Technical docs
- **This file** - Quick reference

## Files to Know

| File | Purpose |
|------|---------|
| `backend/api/app/routers/admin.py` | All admin API endpoints |
| `src/pages/admin/AdminReportsPage.tsx` | Main reports dashboard |
| `src/components/admin/AdminBillsModal.tsx` | Bill detail viewer |
| `src/lib/adminAPI.ts` | API client functions |
| `src/hooks/useAdminData.ts` | React hooks for data |
| `backend/api/create_admin.py` | Admin user creation |

## Admin Panel URL Routes

```
/admin                    - Admin dashboard
/admin/reports           - Reports & analytics
/admin/bills             - Bill management
/admin/orders            - Order management
/admin/products          - Product management
/admin/users             - User management
/admin/settings          - System settings
```

## Theme & Styling

All components use:
- **Primary Color**: neon-amber (#f59e0b)
- **Background**: night-900/night-800
- **Text**: white/night-300
- **Accent**: Various for status indicators

Example:
```tsx
className="bg-night-900 border-neon-amber text-white"
```

## Support Resources

1. Check API docs at `http://localhost:8000/docs` (when running)
2. Review implementation docs
3. Check component prop types
4. Use browser dev tools for debugging
5. Check backend logs for errors
