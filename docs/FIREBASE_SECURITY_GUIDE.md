# Firebase API Key Security Guide

## 🔒 Current Security Issue

Your Firebase API key is currently exposed in the frontend code at:
- `API/src/firebase.js`

While Firebase API keys are designed to be public (they don't grant full access to your Firebase project), you should still restrict them to prevent abuse.

## 🚨 Immediate Action Required

### 1. Restrict Your Firebase API Key

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `jhyaap-b5225`
3. **Navigate to**: Project Settings → General → Your apps → Web app
4. **Find your API key**: `AIzaSyDqRKR5jcZM22Svk_ODAYphplg-fVmeqLI`
5. **Click on the API key** to open its settings
6. **Under "Application restrictions"**:
   - Select **"IP addresses"** for backend services
   - Or select **"HTTP referrers"** for web apps
   - Add your production domain: `https://yourdomain.com`
   - Add development domains: `http://localhost:3000`, `http://localhost:5173`, etc.
7. **Under "API restrictions"**:
   - Select **"Restrict key"** 
   - Only select the Firebase APIs you actually use:
     - ✓ Firebase Authentication
     - ✓ Firebase Realtime Database (if used)
     - ✓ Firebase Cloud Firestore (if used)
     - ✓ Firebase Storage (if used)
   - ✗ Google Maps API (should use separate key)
   - ✗ Other Google services you don't use

### 2. Set Up Firebase Security Rules

#### Authentication Rules
Ensure your Firebase Authentication has proper security rules:

```javascript
// Firebase Console → Authentication → Sign-in method
// Enable only the providers you actually use:
// ✓ Phone/OTP (if using Firebase Auth)
// ✗ Email/Password (if not used)
// ✗ Google (if not used)
// ✗ Anonymous (if not used in production)
```

#### Database/Storage Rules
If using Firebase Realtime Database or Storage:

```javascript
// Example Firestore rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public data can be read by anyone
    match /public/{document=**} {
      allow read: if true;
      allow write: if false; // Never allow public writes
    }
  }
}
```

### 3. Monitor API Usage

1. **Go to**: Google Cloud Console → APIs & Services → Credentials
2. **Select your Firebase API key**
3. **Set up usage alerts**:
   - Set daily quota limits
   - Configure billing alerts
   - Monitor for unusual spikes in usage

### 4. Consider Environment-Based Configuration

For better security, use different Firebase configurations for different environments:

```javascript
// firebase.config.js
const firebaseConfigs = {
  development: {
    apiKey: process.env.FIREBASE_DEV_API_KEY,
    authDomain: "jhyaap-b5225.firebaseapp.com",
    projectId: "jhyaap-b5225",
    // ... other config
  },
  production: {
    apiKey: process.env.FIREBASE_PROD_API_KEY, // Restricted key
    authDomain: "jhyaap-b5225.firebaseapp.com", 
    projectId: "jhyaap-b5225",
    // ... other config
  }
};

export const firebaseConfig = firebaseConfigs[process.env.NODE_ENV || 'development'];
```

## 🔍 Verification Steps

After implementing these restrictions:

1. **Test development**: Ensure your dev environment still works
2. **Test production**: Verify production apps can authenticate
3. **Monitor logs**: Check Firebase Console for any authentication failures
4. **Review usage**: Monitor API usage in Google Cloud Console

## 📋 Security Checklist

- [ ] Firebase API key restricted by domain/IP
- [ ] API key restricted to only necessary Firebase services
- [ ] Firebase Authentication methods limited to what you use
- [ ] Database/Storage security rules configured
- [ ] Usage quotas and alerts set up
- [ ] Different API keys for dev/production (recommended)
- [ ] Regular monitoring of API usage
- [ ] No sensitive data stored in client-side Firebase config

## 🚨 Additional Security Notes

1. **Never commit API keys to git** - Your current key is already exposed, consider rotating it
2. **Use Firebase Admin SDK** for backend operations - it has full privileges and should never be exposed to clients
3. **Implement backend validation** - Don't rely solely on Firebase security rules
4. **Regular security audits** - Review Firebase Console settings monthly

## 🔄 Key Rotation (Optional but Recommended)

If you want to rotate your exposed API key:

1. Generate a new API key in Firebase Console
2. Update your application code with the new key
3. Restrict the new key immediately
4. Monitor for a few days to ensure everything works
5. Delete the old key after confirming the new one works

---

**Last Updated**: 2025-08-05
**Project**: Jhyaap Station
**Firebase Project**: jhyaap-b5225