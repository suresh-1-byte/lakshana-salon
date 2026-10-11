# 🚀 Lakshana Salon CRM - Quick Reference Card

---

## Start Commands

### Development Mode (Port 9002)
```bash
npm run dev
```
**Access:** http://localhost:9002

### Production Build
```bash
npm run build
npm start
```

### Type Check (Optional)
```bash
npm run typecheck
```

### Linting (Optional)
```bash
npm run lint
```

---

## URLs

| Service | URL |
|---------|-----|
| **Website** | http://localhost:9002 |
| **Admin Login** | http://localhost:9002/admin/login |
| **Admin Dashboard** | http://localhost:9002/admin |
| **API Base** | http://localhost:9002/api |

---

## Default Admin Credentials
⚠️ **Check your environment variables or Firebase setup for admin credentials**

---

## Project Structure

```
lakshana-salon-main/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── admin/             # Admin panel pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   └── website/          # Public website components
│   ├── lib/                  # Utilities & configs
│   │   ├── api/              # API client functions
│   │   ├── supabase/         # Supabase client
│   │   └── firebase-admin.ts # Firebase admin SDK
│   └── types/                # TypeScript types
├── public/                    # Static assets
└── docs/                     # Documentation
```

---

## Key Features

### ✅ Customer Management
- Customer profiles with history
- Customer search & filtering
- Birthday & anniversary tracking
- Membership management

### ✅ Booking System
- Online booking
- Appointment scheduling
- Service selection
- Add-ons support

### ✅ Payment & Billing
- Invoice generation
- Payment tracking
- Multiple payment methods
- Service add-ons billing

### ✅ WhatsApp Integration
- Automated messages
- Birthday wishes
- Booking confirmations
- Custom templates

### ✅ Reports & Analytics
- Daily reports
- Weekly reports
- Excel export
- Customer analytics

### ✅ Admin Panel
- Dashboard with stats
- Complete CRM features
- Activity logging
- Role-based access

---

## Environment Variables Required

Create `.env.local` file with:

```env
# Firebase (Primary Database)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Supabase (Optional)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Admin JWT Secret
ADMIN_JWT_SECRET=

# WhatsApp API (Optional)
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=

# Email (Optional)
RESEND_API_KEY=

# Google Sheets (Optional)
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_SPREADSHEET_ID=
```

---

## Common Tasks

### Add New Service
1. Go to Admin → Services
2. Click "Add Service"
3. Fill in details
4. Save

### Add New Customer
1. Go to Admin → Customers
2. Click "Add Customer"
3. Fill in details (including DOB for birthday wishes)
4. Save

### Create Booking
1. Go to Admin → Bookings
2. Click "New Booking"
3. Select customer, service, date/time
4. Add any add-ons
5. Confirm booking

### Generate Reports
1. Go to Admin → Reports
2. Select report type (Daily/Weekly)
3. Choose date range
4. Export to Excel

### Send WhatsApp Messages
1. Go to Admin → Customers
2. Find customer
3. Click WhatsApp icon
4. Select template or custom message
5. Send

---

## Troubleshooting

### Port 9002 Already in Use
```bash
# Windows
netstat -ano | findstr :9002
taskkill /PID <PID> /F

# Or change port in package.json
"dev": "next dev --turbopack -p 9003"
```

### Build Errors
```bash
# Clean cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

### Firebase Errors
- Check Firebase console
- Verify environment variables
- Check Firebase rules

### Can't Access Admin Panel
- Check if logged in
- Verify JWT token in cookies
- Check admin credentials

---

## Documentation Files

| File | Description |
|------|-------------|
| `CODE_ANALYSIS_REPORT.md` | Comprehensive code analysis |
| `FIXES_APPLIED_TODAY.md` | Recent fixes applied |
| `✅ ALL_ERRORS_FIXED.txt` | Previous error fixes |
| `START_HERE.md` | Getting started guide |
| `QUICK_REFERENCE.md` | This file |

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Database:** Firebase Firestore
- **Authentication:** JWT (Admin)
- **Messaging:** WhatsApp API
- **Email:** Resend
- **Animations:** Framer Motion
- **Excel Export:** XLSX

---

## Performance Tips

- Hard refresh browser: `Ctrl + Shift + R`
- Clear Next.js cache: Delete `.next` folder
- Optimize images: Use Next.js Image component
- Enable compression: Already configured in `next.config.ts`

---

## Support & Maintenance

### Regular Maintenance
- Backup Firebase data weekly
- Monitor Firebase usage
- Check error logs
- Update dependencies monthly

### Monitoring
- Firebase Console: Check database usage
- Vercel Dashboard: Check deployments
- Browser Console: Check for errors

---

## Status: ✅ READY FOR PRODUCTION

**Last Updated:** January 6, 2025
**Version:** 1.0.0
**Status:** All features working, code cleaned

---

## Need Help?

1. Check documentation files
2. Review error logs
3. Check Firebase console
4. Verify environment variables

**Everything is set up and ready to go! 🚀**

