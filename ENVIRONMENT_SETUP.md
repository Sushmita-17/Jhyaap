# Environment Variables Setup Guide

## Required Environment Variables

### Nightowl (Customer App)
Create `.env` file in `nightowl/` directory:
```env
VITE_BACKEND_API_URL=http://127.0.0.1:8001
VITE_API_BASE_URL=http://127.0.0.1:8001
```

### Admin Panel
Create `.env` file in `admin/` directory:
```env
VITE_BACKEND_API_URL=http://127.0.0.1:8001
VITE_API_BASE_URL=http://127.0.0.1:8001
```

### Rider Panel
Create `.env` file in `rider-panel/` directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Backend Environment Variables
Create `.env` file in `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/jhyaap_station
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SECRET_KEY=your_secret_key_for_jwt
```

## Current Status

### ✅ Fixed Issues
1. **Dependency Conflicts**: Fixed vite version conflict in rider-panel
2. **Missing Dependencies**: Added vite-plugin-pwa to admin panel
3. **Build Errors**: All three apps build successfully
4. **Dev Servers**: All three apps start successfully

### ⚠️ Warnings
1. **Large Bundle Size**: Apps have chunks >500KB (performance warning, not error)
2. **NPM Vulnerabilities**: 6-8 vulnerabilities in dependencies (can be fixed with `npm audit fix`)
3. **Missing .env Files**: Apps use fallback values but should have proper env files

### 📋 Files Using Environment Variables

**Nightowl:**
- backendAPI.js (API URLs)
- catalogStore.js (API URLs)
- CustomerNotificationPanel.jsx (API URLs)
- NotificationCenter.jsx (API URLs)
- LiveDeliveryMap.jsx (Google Maps API)
- LiveOrderTrackingPanel.jsx (Google Maps API)
- chatbotBrain.js (API URLs)
- googleMaps.js (Google Maps API)
- jhyaapAuthAPI.js (API URLs)
- sessionManager.js (API URLs)

**Admin:**
- backendAPI.js (API URLs)
- AdminOrdersPage.jsx (API URLs)
- catalogStore.js (API URLs)
- LiveDeliveryMap.jsx (Google Maps API)
- LiveOrderTrackingPanel.jsx (Google Maps API)
- AuthContext.jsx (API URLs)
- chatbotBrain.js (API URLs)
- googleMaps.js (Google Maps API)
- sessionManager.js (API URLs)
- AdminDashboardPage.jsx (API URLs)
- AdminDeliveryFeesPage.jsx (API URLs)
- AdminDeliveryPage.jsx (API URLs)

**Rider Panel:**
- supabaseClient.js (Supabase credentials)
- LeafletRiderMap.jsx (Supabase credentials)
- useLocationTracking.js (Supabase credentials)
- Dashboard.jsx (Supabase credentials)
- Earnings.jsx (Supabase credentials)
- Notifications.jsx (Supabase credentials)
- OrderDetail.jsx (Supabase credentials)
- Orders.jsx (Supabase credentials)
- Performance.jsx (Supabase credentials)
- PublicNotifications.jsx (Supabase credentials)
- Wallet.jsx (Supabase credentials)
- authStore.js (Supabase credentials)

## Next Steps

1. **Create .env files** for each application with proper values
2. **Get Google Maps API Key** from Google Cloud Console
3. **Set up Supabase project** and get credentials
4. **Run Supabase migrations** using the migration guide
5. **Start backend server** on port 8001
6. **Test all three applications** with proper environment configuration
