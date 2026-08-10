# Jhyaap Station - Rider Panel

A mobile-first React + Vite delivery rider application for Jhyaap Station, a late-night delivery service in Nepal. Riders can view assigned orders, track deliveries, and manage their earnings.

## Tech Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Supabase (Auth + Database)
- **Routing**: React Router DOM 6
- **Language**: JavaScript (no TypeScript)

## Design Theme

- **Background**: `#0F0B08` (Dark brown)
- **Primary Accent**: `#C9A84C` (Gold)
- **Text**: `#F5ECD7` (Warm white)
- **Card Background**: `#1a1512`
- **Border**: `#2a221c`
- **Mobile-first**: Optimized for phone screens

## Project Structure

```
src/
├── lib/
│   └── supabaseClient.js          # Supabase client initialization
├── store/
│   ├── authStore.js               # Auth state management (Zustand)
│   └── earningsStore.js           # Earnings data management
├── pages/
│   ├── Login.jsx                  # OTP login flow
│   ├── Dashboard.jsx              # Orders with 3 tabs
│   ├── OrderDetail.jsx            # Detailed order view
│   └── Earnings.jsx               # Daily/Weekly/Monthly earnings
├── components/
│   ├── BottomNav.jsx              # Bottom navigation bar
│   └── OrderCard.jsx              # Order list card
├── utils/
│   ├── earningsExport.js          # CSV export utilities
│   └── dateUtils.js               # Date range helpers
├── App.jsx                        # Main app with routing
├── main.jsx                       # React entry point
└── index.css                      # Tailwind + custom styles
```

## Features

### 1. Authentication (Credential-based Login)
- Phone number + password login
- Credentials created by admin panel
- Simple, reliable login without OTP delays
- Session stored in localStorage
- Works offline after initial login (displays cached data)

**Files**: `pages/Login.jsx`, `store/authStore.js`

### 2. Orders Dashboard
- **Three tabs**: Pending | In Progress | Completed
- **Pending**: Orders with status "accepted" or "preparing"
- **In Progress**: Orders with status "out_for_delivery"
- **Completed**: Orders with status "delivered", paginated (20 per page)
- Polling refresh every 15 seconds
- Quick order details visible on card

**Files**: `pages/Dashboard.jsx`, `components/OrderCard.jsx`

### 3. Order Detail View
- Full delivery address + landmark
- Delivery notes/special instructions
- Itemized product list with quantities and prices
- Order total breakdown (subtotal, delivery fee, tax)
- **Customer phone number** — tap to call (`tel:` link)
- Status action button → auto-advances state flow
- Automatic earnings logging when marking as "delivered"

**Files**: `pages/OrderDetail.jsx`, `store/earningsStore.js`

### 4. Earnings Tracking
- **Three views**:
  - **Daily**: Today's deliveries with timestamps and running total
  - **Weekly**: Current week (Mon–Sun) grouped by day
  - **Monthly**: Current month with daily subtotals
- In-app views limited to **last 3 months**
- Earnings stored in `rider_earnings` table:
  ```
  id, rider_id, order_id, delivery_fee, earned_at
  ```

**Files**: `pages/Earnings.jsx`, `store/earningsStore.js`

### 5. Download Statement (CSV Export)
- Custom date range picker (no 3-month limit for downloads)
- Client-side CSV generation
- Columns: Date, Order ID, Delivery Fee
- Automatic browser download
- Filename: `Earnings_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Files**: `utils/earningsExport.js`

### 6. Bottom Navigation
- Two main sections: Orders | Earnings
- Logout button
- Mobile-friendly tab bar (sticky at bottom)

**Files**: `components/BottomNav.jsx`

## Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_BACKEND_API_URL=http://localhost:8000
```

## Database Schema

### Supabase Tables Required

#### `riders`
```sql
CREATE TABLE riders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_staff_id UUID REFERENCES riders(id),
  customer_id UUID REFERENCES customers(id),
  address_id UUID REFERENCES addresses(id),
  status VARCHAR(50), -- accepted, preparing, out_for_delivery, delivered
  delivery_notes TEXT,
  subtotal DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  tax DECIMAL(10,2),
  total DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `rider_earnings` (New)
```sql
CREATE TABLE rider_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  delivery_fee DECIMAL(10,2) NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rider_earnings_rider_id ON rider_earnings(rider_id);
CREATE INDEX idx_rider_earnings_earned_at ON rider_earnings(earned_at);
```

### Row-Level Security (RLS)

Enable RLS on all tables and set policies:

```sql
-- Riders can only see their own orders
CREATE POLICY "Riders see own orders"
  ON orders FOR SELECT
  USING (delivery_staff_id = auth.uid());

-- Riders can only see their own earnings
CREATE POLICY "Riders see own earnings"
  ON rider_earnings FOR SELECT
  USING (rider_id = (SELECT id FROM riders WHERE user_id = auth.uid()));
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd rider-panel
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the tables listed above using SQL editor
3. Enable phone authentication in Auth settings
4. Copy your project URL and anon key
5. Create `.env` file with your credentials

### 3. Run Development Server
```bash
npm run dev
```

The app runs on `http://localhost:3001` by default.

### 4. Build for Production
```bash
npm run build
npm run preview
```

## Usage

### For Riders

1. **Login**: Enter phone number → Receive OTP → Verify
2. **View Orders**:
   - Tap "Orders" tab
   - Switch between Pending/In Progress/Completed tabs
   - Tap card to view full details
3. **Update Order Status**: Tap "Mark as [next status]" button
4. **View Earnings**:
   - Tap "Earnings" tab
   - Switch between Daily/Weekly/Monthly views
   - Download statement for custom date range
5. **Logout**: Tap logout button in bottom nav

### For Developers

#### Add New Features

1. **New Page**: Create in `src/pages/`
2. **State Management**: Add Zustand store in `src/store/`
3. **Components**: Reusable components in `src/components/`
4. **Utilities**: Helper functions in `src/utils/`

#### Styling

Use Tailwind CSS classes or custom `rider-*` classes defined in `index.css`:
- `.rider-page` - Main page container
- `.rider-card` - Card component
- `.rider-btn` - Button base
- `.rider-btn-primary` - Gold button
- `.rider-btn-secondary` - Dark button
- `.rider-input` - Input field

#### State Stores

```javascript
// Auth Store
import { useAuthStore } from './store/authStore'
const { rider, loading } = useAuthStore()
await authActions.loginWithPhone(phone)
await authActions.verifyOtp(phone, otp)
await authActions.logout()

// Earnings Store
import { earningsActions } from './store/earningsStore'
await earningsActions.fetchEarnings(riderId, startDate, endDate)
await earningsActions.logDeliveryEarnings(riderId, orderId, fee)
await earningsActions.fetchEarningsForExport(riderId, startDate, endDate)
```

## Performance Considerations

- **Polling**: Orders refresh every 15 seconds (configurable in Dashboard.jsx)
- **Pagination**: Completed orders paginated at 20 per page
- **Earnings Limit**: In-app views show only last 3 months; full history available for download
- **Lazy Loading**: Pages load on-demand via React Router
- **No WebSocket**: Simple polling is sufficient for this MVP

## Security

- **Anon Key Only**: Never use service_role key in frontend
- **Row-Level Security**: Database policies restrict rider access to own data
- **HTTPS Only**: Use in production with HTTPS
- **Token Expiry**: Supabase auth tokens auto-manage

## Troubleshooting

### "Supabase credentials not found"
- Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Vite prefixes env vars automatically (no need to manually add `VITE_`)

### Orders not loading
- Check RLS policies are set correctly
- Verify `delivery_staff_id` matches rider ID in database
- Check browser console for network errors

### OTP not arriving
- Verify phone number format: `+977` followed by 10 digits
- Check Supabase SMS provider is configured
- Verify rider has `phone_number` in riders table

### CSV download not working
- Check browser console for errors
- Verify earnings data exists in database
- Test with valid start/end dates

## Future Enhancements

- Real-time order updates via Supabase Realtime
- Order ratings/feedback from customers
- Push notifications for new orders
- Multi-language support (Nepali, English)
- Dark mode toggle (already themed for dark)
- GPS location tracking for deliveries
- Performance analytics dashboard
- Rider documents/verification management

## License

Jhyaap Station © 2024
