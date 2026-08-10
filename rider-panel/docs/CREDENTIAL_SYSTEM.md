# Credential-Based Authentication System

## Overview

The rider panel now uses a credential-based login system (phone + password) instead of OTP. Admin creates and manages rider credentials through the admin panel, and riders use those credentials to login.

## How It Works

### 1. Admin Creates Rider Account
In the admin panel (`/admin/riders`):
- Click "Add Rider"
- Enter rider name, phone number, password, email, vehicle type, and status
- Save the credential

### 2. Rider Logs In
In the rider panel (`/login`):
- Enter phone number (e.g., +977 9811223344)
- Enter password (created by admin)
- Click "Login"
- Session is stored in localStorage

### 3. Session Management
- Rider session persists in localStorage (`jhyaap_rider_session`)
- Clear browser data to logout
- Session is automatically checked on app load

## Files Modified

### `/rider-panel/src/pages/Login.jsx`
**Changes**:
- Removed OTP form (request + verification steps)
- Replaced with simple phone + password form
- Phone validation: `+977 10digits`
- Both fields required
- Error handling with user-friendly messages

**Form Validation**:
```javascript
Phone: +977 XXXXXXXXXX (required, 10 digits)
Password: Any string (required, minimum 1 character)
```

### `/rider-panel/src/store/authStore.js`
**Changes**:
- Removed Supabase OTP auth (`loginWithPhone`, `verifyOtp`)
- Added credential validation (`login` function)
- Uses mock rider database (MOCK_RIDERS array)
- Stores session in localStorage instead of Supabase auth

**New Function**:
```javascript
authActions.login(phone, password)
  // Validates credentials
  // Stores rider in localStorage on success
  // Throws error if credentials invalid
```

### `/rider-panel/src/lib/supabaseClient.js`
**Changes**:
- Kept Supabase client for future data operations
- Removed authentication logic
- Can still fetch orders, earnings, etc.

## Integration with Admin Panel

### Admin Panel (`/admin/src/pages/admin/AdminRidersPage.tsx`)
Provides complete CRUD interface for rider credentials:
- **Create**: Add new rider with phone + password
- **Read**: View all riders with search/filter
- **Update**: Edit existing rider credentials
- **Delete**: Remove rider (with confirmation)
- **Status**: Set rider as active/inactive/suspended

**Data Model**:
```typescript
interface RiderCredential {
  id: string;
  riderName: string;
  phoneNumber: string;
  password: string;
  email?: string;
  vehicleType: 'bike' | 'car' | 'scooter';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  earnings: number;
}
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Admin creates credentials in admin panel
- ✅ Rider logs in with credentials
- ✅ Session stored in localStorage

### Phase 2 (Database Integration)
- [ ] Store credentials in Supabase `rider_credentials` table
- [ ] Rider panel fetches credentials at login
- [ ] Support credential updates from admin panel in real-time
- [ ] Add password change functionality in rider panel

### Phase 3 (Security)
- [ ] Hash passwords in database (bcrypt)
- [ ] Password reset via email
- [ ] Rate limiting on login attempts
- [ ] Session timeout after inactivity
- [ ] Multi-device session management

## Development / Testing

### Testing Credentials (Mock Data)
The rider panel currently uses mock credentials for testing:
```javascript
Phone: +977 9811223344
Password: password123
Name: Rajesh Sharma

Phone: +977 9822334455
Password: password456
Name: Sita Thapa
```

### Switching to Real Credentials
To use credentials from a database:
1. Update `authStore.js` to fetch credentials from an API/database
2. Add credential validation endpoint to backend
3. Replace MOCK_RIDERS with database query

Example:
```javascript
// Update authStore.js
const rider = await fetch(`/api/validate-credential`, {
  method: 'POST',
  body: JSON.stringify({ phone, password })
}).then(r => r.json())
```

## Troubleshooting

### Login Failed: "Invalid phone number or password"
- Check phone format: Must be `+977 10digits` (no spaces except before area code)
- Verify password is exactly as created in admin panel
- Ensure rider status is "active" in admin panel

### Session Lost After Refresh
- Browser localStorage is cleared
- Check browser's "App Storage" / "Application" tab for `jhyaap_rider_session`
- Clear browser cache and retry login

### Can't Find Phone in Dropdown
- Admin hasn't created the rider yet
- Ask admin to add rider in admin panel first
- Admin must set rider status to "active"

## Architecture Diagram

```
┌─────────────────┐         ┌──────────────────┐
│  Admin Panel    │────────→│  Rider Database  │
│  /admin/riders  │         │  (Mock or Real)  │
└─────────────────┘         └──────────────────┘
                                     ▲
                                     │
                            API call at login
                                     │
┌─────────────────┐         ┌──────────────────┐
│  Rider Panel    │────────→│  localStorage    │
│  /login         │         │  (session store) │
└─────────────────┘         └──────────────────┘
```

## Related Files
- [Rider Panel README](./README.md)
- [Admin Panel: AdminRidersPage.tsx](../admin/src/pages/admin/AdminRidersPage.tsx)
- [Auth Store](./src/store/authStore.js)
- [Login Page](./src/pages/Login.jsx)
