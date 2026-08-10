# Jhyaap Station Rider Panel - Quick Start Guide

Get the Rider Panel up and running in 5 minutes!

## Prerequisites

- Node.js 16+ and npm/yarn
- A Supabase account (create free at [supabase.com](https://supabase.com))
- A text editor (VS Code recommended)

## 🚀 Quick Setup

### 1. Install Dependencies (1 min)

```bash
cd rider-panel
npm install
```

### 2. Configure Supabase (2 min)

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** section
3. Copy your **Project URL** and **Anon Key**
4. Create `.env` file in `rider-panel/` folder:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Setup Database (1.5 min)

1. In Supabase, go to **SQL Editor**
2. Copy and run ALL queries from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
3. Start from section "1. Create Tables" through "2. Row-Level Security"

### 4. Start Dev Server (30 sec)

```bash
npm run dev
```

Visit `http://localhost:3001` 🎉

## 🧪 Test the App

### Login (Test OTP)

1. Supabase phone auth uses demo mode by default
2. Use any phone number: `+977 98XXXXXXXX` (X = any digit)
3. OTP is shown in Supabase logs → use any 6 digits
4. You're in!

### Create Test Data

Before testing orders, add test data:

```sql
-- In Supabase SQL Editor, run:

-- 1. Get your rider ID from auth
SELECT id FROM riders LIMIT 1;

-- 2. Create test order (replace rider_id)
INSERT INTO orders (delivery_staff_id, customer_id, address_id, status, subtotal, delivery_fee, total)
SELECT 
  'YOUR_RIDER_ID_HERE', 
  id, 
  id, 
  'accepted', 
  500.00, 
  100.00, 
  600.00
FROM customers LIMIT 1;
```

## 📁 Project Structure

```
src/
  ├── pages/          # Main pages (Login, Dashboard, Orders, Earnings)
  ├── components/     # Reusable components (BottomNav, OrderCard)
  ├── store/          # Zustand state (auth, earnings)
  ├── lib/            # Supabase client
  ├── utils/          # Helpers (date, export, CSV)
  └── App.jsx         # Main app + routing
```

## 🎨 Customization

### Change Colors

Edit `src/index.css` — search for color values:
- `#0F0B08` = Dark background
- `#C9A84C` = Gold accent
- `#F5ECD7` = Text

### Adjust Polling Frequency

In `src/pages/Dashboard.jsx`, change line ~45:
```javascript
const interval = setInterval(() => fetchOrders(), 15000) // Change 15000 to milliseconds
```

### Add Your Company Name

In `src/pages/Login.jsx`, change:
```javascript
<h1 className="text-2xl font-bold mb-1 tracking-tight">Jhyaap Rider</h1>
```

## 🔧 Common Issues

### "Supabase credentials not found"
- Check `.env` file exists in `rider-panel/` folder
- Verify `VITE_` prefix on env var names
- Restart dev server after creating `.env`

### "Order list empty"
- Run test data insertion SQL (see above)
- Verify `delivery_staff_id` matches your rider ID
- Check browser console for errors

### "Phone login not working"
- In Supabase, go to **Auth** → **Providers**
- Ensure **Phone** provider is enabled
- For development, any phone + any 6-digit code works

### "CSV export fails"
- Ensure earnings data exists
- Use valid date range (startDate < endDate)
- Check browser console for specific errors

## 📦 Build for Production

```bash
npm run build
npm run preview
```

Output in `dist/` folder — deploy to Netlify, Vercel, etc.

## 🌐 Deploy to Netlify

1. Push code to GitHub
2. Connect repo to [netlify.com](https://netlify.com)
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add env vars in Netlify dashboard
6. Deploy! 🚀

## 📚 Next Steps

- Read full [README.md](./README.md) for complete documentation
- Check [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database details
- Explore code structure and add your own features
- Integrate with your backend API

## 💡 Pro Tips

- Use **Supabase Realtime** instead of polling for real-time updates
- Add **Push Notifications** for new orders
- Track **GPS locations** during deliveries
- Implement **Rating system** for customer feedback

## 🆘 Need Help?

Check:
1. Browser console for errors (F12)
2. Supabase dashboard for logs
3. Terminal output for server issues
4. [README.md](./README.md) troubleshooting section

## 📞 Support

For issues, check:
- [Supabase Docs](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Ready to deliver? Let's go! 🏍️**
