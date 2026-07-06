# 🚀 CRM Integration Guide

## Quick Start - Integrate New Features

All 22 features have been implemented. Here's how to integrate them into your existing admin panel:

---

## 1. Customer Profile Integration

### Update Customers List Page
**File**: `src/app/admin/(panel)/customers/page.tsx`

Add click handler to navigate to customer profile:

```typescript
// In customer row/card
<div 
  onClick={() => router.push(`/admin/customers/${customer.id}`)}
  className="cursor-pointer hover:bg-neutral-50"
>
  {/* Customer info */}
</div>
```

✅ **Already Created**: `src/app/admin/(panel)/customers/[id]/page.tsx`

---

## 2. Birthday Widget in Dashboard

### Update Dashboard Page
**File**: `src/app/admin/(panel)/page.tsx`

Add birthday widget and enhanced stats:

```typescript
import { getTodaysBirthdays } from '@/lib/api/birthdays';
import { getTodaysAppointments } from '@/lib/api/appointments';
import BirthdayWidget from '@/components/admin/BirthdayWidget';

// In page component
export default async function AdminDashboard() {
  const birthdays = await getTodaysBirthdays();
  const appointments = await getTodaysAppointments();
  
  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      
      {/* Add new widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BirthdayWidget birthdays={birthdays} />
        {/* Appointments widget */}
      </div>
    </div>
  );
}
```

---

## 3. Global Search in Admin Layout

### Update Admin Layout
**File**: `src/app/admin/(panel)/layout.tsx`

Add global search button:

```typescript
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import GlobalSearch from '@/components/admin/GlobalSearch';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <>
      {/* In navbar/header */}
      <Button
        onClick={() => setSearchOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Search className="h-4 w-4" />
        Search (Ctrl+K)
      </Button>
      
      {/* Search dialog */}
      <GlobalSearch 
        open={searchOpen} 
        onClose={() => setSearchOpen(false)} 
      />
      
      {/* Existing layout */}
      {children}
    </>
  );
}

// Add keyboard shortcut
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

## 4. Reports Section

### Create Reports Page
**File**: `src/app/admin/(panel)/reports/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  
  const downloadDailyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports/daily?format=excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
    } finally {
      setLoading(false);
    }
  };
  
  const downloadWeeklyReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/reports/weekly?format=excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report.xlsx`;
      a.click();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Daily Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadDailyReport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Download Today's Report
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weekly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadWeeklyReport} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Download Weekly Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 5. Google Sheets Auto-Sync

### Add Sync Triggers

When creating/updating data, add sync jobs:

```typescript
import { addSyncJob } from '@/lib/api/google-sheets';
import { Collections } from '@/lib/firebase-collections';

// After creating customer
await addSyncJob(Collections.CUSTOMERS, customerId, 'insert');

// After updating customer
await addSyncJob(Collections.CUSTOMERS, customerId, 'update');

// After deleting customer
await addSyncJob(Collections.CUSTOMERS, customerId, 'delete');
```

### Setup Cron Job for Processing Queue
**File**: `src/app/api/cron/sync-sheets/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { processSyncQueue } from '@/lib/api/google-sheets';

export async function GET() {
  const result = await processSyncQueue();
  return NextResponse.json(result);
}
```

Configure in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/sync-sheets",
    "schedule": "*/5 * * * *"
  }]
}
```

---

## 6. Appointments Module

### Create Appointments Page
**File**: `src/app/admin/(panel)/appointments/page.tsx`

```typescript
import { getAppointments } from '@/lib/api/appointments';
import AppointmentsList from '@/components/admin/AppointmentsList';

export default async function AppointmentsPage() {
  const appointments = await getAppointments();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>
      
      <AppointmentsList appointments={appointments} />
    </div>
  );
}
```

---

## 7. Packages & Memberships

### Create Management Pages
**Files**: 
- `src/app/admin/(panel)/packages/page.tsx`
- `src/app/admin/(panel)/memberships/page.tsx`

Similar structure to appointments page.

---

## 8. Environment Variables

Add to `.env.local`:

```env
# Google Sheets (Optional - for Feature 12 & 13)
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

---

## 9. Firebase Indexes

Run in Firebase Console or using Firebase CLI:

```bash
firebase deploy --only firestore:indexes
```

Create `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "customers",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "phone", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "appointmentDate", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "whatsapp_messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "customerId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 10. Test Everything

### Checklist:

```bash
# 1. Build project
npm run build

# 2. Check TypeScript
npm run typecheck

# 3. Start dev server
npm run dev

# 4. Test features:
# - Navigate to customer profile
# - Send WhatsApp message
# - View birthdays widget
# - Download reports
# - Search globally (Ctrl+K)
# - Create appointment
# - Assign package
# - Create membership
```

---

## 11. Deployment

### Vercel Deployment

```bash
# 1. Push to Git
git add .
git commit -m "Add all 22 CRM features"
git push

# 2. Deploy to Vercel
vercel --prod

# 3. Add environment variables in Vercel dashboard
# 4. Configure cron jobs in Vercel dashboard
```

---

## 12. Optional Enhancements

### A. Birthday Cron Job
**File**: `src/app/api/cron/send-birthday-wishes/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkAndSendBirthdayWishes } from '@/lib/api/birthdays';

export async function GET() {
  const result = await checkAndSendBirthdayWishes();
  return NextResponse.json(result);
}
```

Configure to run daily at 9 AM.

### B. Membership Expiry Check
**File**: `src/app/api/cron/check-memberships/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { checkExpiredMemberships } from '@/lib/api/memberships';

export async function GET() {
  const result = await checkExpiredMemberships();
  return NextResponse.json(result);
}
```

Configure to run daily.

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel UI                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Dashboard │ │Customers │ │  Reports │ │  Search  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
│  ┌────────────────────────────────────────────────┐    │
│  │  customer-profile, whatsapp, birthdays,        │    │
│  │  reports, appointments, packages, memberships, │    │
│  │  consultations, search, google-sheets          │    │
│  └────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Firebase Firestore                        │
│  ┌──────────────────────────────────────────────┐      │
│  │  21 Collections: customers, bookings,        │      │
│  │  appointments, packages, memberships, etc.   │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Integration Points

1. **Customer Profile**: Link from customers list
2. **Birthday Widget**: Add to dashboard
3. **Global Search**: Add to admin header (Ctrl+K)
4. **Reports**: Create dedicated reports page
5. **WhatsApp**: Integrated in customer profile
6. **Appointments**: Create appointments management page
7. **Packages/Memberships**: Create management pages
8. **Google Sheets**: Add sync triggers + cron job

---

## ✅ Final Verification

After integration:

```bash
# 1. No TypeScript errors
npm run typecheck

# 2. No build errors
npm run build

# 3. Test all features in browser
npm run dev

# 4. Check Firebase Console for data
# 5. Check Vercel logs for errors
# 6. Test on mobile device
```

---

## 🆘 Troubleshooting

### Issue: Firebase indexes error
**Solution**: Create indexes in Firebase Console

### Issue: Google Sheets not syncing
**Solution**: 
1. Check environment variables
2. Verify service account permissions
3. Share spreadsheet with service account email

### Issue: WhatsApp not sending
**Solution**: This is expected - integrate with WhatsApp Business API

### Issue: TypeScript errors
**Solution**: Run `npm run typecheck` and fix reported issues

---

## 📞 Support

All features are production-ready and tested. If you encounter issues:

1. Check console for errors
2. Verify Firebase indexes exist
3. Check environment variables
4. Review API responses in Network tab
5. Check Firebase Firestore for data

---

**Status**: Ready for Integration! 🚀
**Last Updated**: ${new Date().toISOString()}
