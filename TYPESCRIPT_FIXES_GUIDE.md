# TypeScript Fixes Guide

## Summary of Issues

The TypeScript errors are caused by:
1. **Implicit `any` types** in Firebase Firestore `.map()` and `.filter()` callbacks
2. **Incorrect `logActivity()` function calls** - using 3 parameters instead of 2
3. **Missing type exports** in API modules
4. **Type mismatches** in consultation and booking forms

## Fixes Applied

### 1. Firebase Admin (`src/lib/firebase-admin.ts`)
✅ Changed `logActivity(action: string, details: any)` signature to accept optional details

### 2. API Route Files - Add Type Annotations

All Firebase Firestore document callbacks need explicit `any` type:

**Pattern:**
```typescript
// ❌ Before
snap.docs.map(d => ({ id: d.id, ...d.data() }))

// ✅ After  
snap.docs.map((d: any) => ({ id: d.id, ...d.data() }))
```

**Files Fixed:**
- ✅ `src/app/api/admin/activity/route.ts`
- ✅ `src/app/api/admin/billing/route.ts`

**Files Remaining to Fix:**
- `src/app/api/admin/bookings/route.ts`
- `src/app/api/admin/coupons/route.ts`
- `src/app/api/admin/customers/route.ts`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/dashboard/stats/route.ts`
- `src/app/api/admin/export/route.ts`
- `src/app/api/admin/notifications/clear/route.ts`
- `src/app/api/admin/notifications/route.ts`
- `src/app/api/admin/reports/route.ts`
- `src/app/api/admin/services/route.ts`
- `src/app/api/cms/gallery/route.ts`
- `src/app/api/cms/reviews/route.ts`
- `src/app/api/fcm-token/cleanup/route.ts`
- `src/app/api/fcm-token/delete-all/route.ts`
- `src/app/api/fcm-token/list/route.ts`
- `src/app/api/notify/route.ts`
- `src/app/api/test-reviews/route.ts`

### 3. Fix logActivity Calls

**Pattern:**
```typescript
// ❌ Before (3 parameters)
await logActivity('action_name', 'Description text', { data })

// ✅ After (2 parameters)
await logActivity('action_name', {
  message: 'Description text',
  ...data,
  entityType: 'entity_type',
  entityId: 'id'
})
```

**Files:**
- ✅ `src/app/api/admin/billing/route.ts`
- `src/app/api/admin/notifications/route.ts`

### 4. Component Type Issues

**BookingForm.tsx:**
- Missing `BookingFormProps` interface
- Wrong import: `getServiceAddons` should be `getServicesWithAddon`
- Missing `booking_id` field in appointment creation

**ConsultationForm.tsx:**
- Wrong import: `getCustomers` should be `getAllCustomers`

**DashboardStats.tsx:**
- Missing export: `getUpcomingAppointments` from appointments API

### 5. API Module Exports

**src/lib/api/customers.ts:**
- Export should be `getAllCustomers` not `getCustomers`

**src/lib/api/service-addons.ts:**
- Export should be `getServicesWithAddon` not `getServiceAddons`

**src/lib/api/appointments.ts:**
- Missing `getUpcomingAppointments` function

**src/lib/api/consultations.ts:**
- Fix field name: `customerId` → `customer_id`
- Fix return type: Appointment doesn't have `success` property

## Quick Fix Commands

### For All API Routes (add `: any` type annotations):

```bash
# Use find and replace in your editor:
# Find: snap.docs.map(d =>
# Replace: snap.docs.map((d: any) =>

# Find: .map(d =>
# Replace: .map((d: any) =>

# Find: .filter(b =>
# Replace: .filter((b: any) =>

# Find: .forEach(doc =>
# Replace: .forEach((doc: any) =>

# Find: .reduce((sum,
# Replace: .reduce((sum: any,
```

## Priority Fixes

1. **High Priority:** Fix all Firebase `.map()` callbacks with `: any`
2. **High Priority:** Fix `logActivity()` calls to use 2 parameters
3. **Medium Priority:** Fix component import errors
4. **Low Priority:** Fix consultation.ts type mismatches

## After Fixes

Run to verify:
```bash
npm run typecheck
```

Expected result: 0 errors
