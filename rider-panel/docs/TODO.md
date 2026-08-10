# Rider Panel feature implementation checklist

## Step 1: Repo understanding
- [x] Read existing rider-panel routing and dashboard/order detail implementation.
- [x] Confirm current authStore shape and theme styles.
- [x] Confirm Supabase client wrapper.
- [x] Confirm Zustand is not installed, then add it.

## Step 2: Backend / DB
- [ ] Write SQL migration for `rider_earnings` table + RLS policy.

## Step 3: UI structure
- [ ] Add Orders route (`/orders`) with bottom tab nav + Income route (`/income`).
- [ ] Implement Orders page with Pending/In Progress/Completed tabs.
- [ ] Implement OrderCard and OrderDetail per spec.
- [ ] Implement earnings dashboard: Income summaries, earnings list (last 3 months), statement export modal.

## Step 4: Data correctness
- [ ] Ensure all Supabase queries are filtered by current rider.
- [ ] Add polling for Pending/In Progress tabs.

## Step 5: Build & run
- [ ] Run vite build / dev sanity checks.

