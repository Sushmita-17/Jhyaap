# Jhyaap Station — Rider Panel + Admin + Backend Updates

## Task
1. Rider-panel map UI cleanup (remove Follow Rider, pause, +/-, make rider face destination, compact white info card with plate number).
2. Mandatory vehicle plate number on admin rider registration (persist through backend).

## Steps
- [ ] **Backend model** (`backend/app/models/rider.py`): add required `vehicle_number` to `RiderCreate`, optional to `RiderUpdate`, field to `RiderResponse`.
- [ ] **Backend endpoint** (`backend/app/api/v1/endpoints/riders.py`): save + update `vehicle_number`.
- [ ] **DB layer** (`backend/app/db/database.py`): add `vehicle_number` column (Postgres + SQLite CREATE + migration), include in `save_rider`.
- [ ] **Admin API** (`admin/src/lib/backendAPI.js`): pass `vehicle_number` in create/update.
- [ ] **Admin page** (`admin/src/pages/admin/AdminRidersPage.jsx`): mandatory plate field in modal, validation, table display.
- [ ] **Rider auth** (`rider-panel/src/store/authStore.js`): store `vehicle_number` from login.
- [ ] **Rider-panel map** (`rider-panel/src/components/LeafletRiderMap.jsx`):
  - Remove Follow Rider toggle, pause/play, −/+ speed buttons.
  - Make rider face the current destination (fixed bearing toward dest).
  - Compact white info card (~190px) showing the plate number.
- [ ] Verify backend syntax + build rider-panel.
