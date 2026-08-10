# TODO_ADMIN_MIGRATION

## Goal
Consolidate all admin-panel frontend code under `nightowl-liquors/src/admin/`.

## Plan
- [ ] Create folder structure under `src/admin/` for components/pages/lib/store/hooks.
- [ ] Move admin-related files:
  - [ ] `src/pages/admin/*` → `src/admin/pages/*`
  - [ ] `src/components/admin/*` → `src/admin/components/*`
  - [ ] `src/lib/adminRoutes.ts`, `src/lib/adminAPI.ts` → `src/admin/lib/*`
  - [ ] `src/store/adminStore.ts` → `src/admin/store/*`
  - [ ] `src/hooks/useAdminData.ts`, `src/hooks/useAdminNotifications.ts` → `src/admin/hooks/*`
- [ ] Update all import paths (notably `src/App.tsx`, `src/admin/components/*`, and any cross-imports).
- [ ] Add barrel exports where needed (optional) to reduce import churn.
- [ ] Run TypeScript build (`npm run build`) to verify compile.
- [ ] Confirm routing still works for:
  - [ ] `/station/night-desk`
  - [ ] `/station/night-desk/console/*`

