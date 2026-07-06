# 🚀 Deployment Guide

## Pre-Deployment Checklist ✅

### Environment Variables Already Set in Vercel:
- ✅ Firebase Configuration (all NEXT_PUBLIC_FIREBASE_* variables)
- ✅ Firebase Admin (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
- ✅ Admin Credentials (ADMIN_EMAIL, ADMIN_PASSWORD)
- ✅ JWT_SECRET
- ✅ RESEND_API_KEY

### Missing Environment Variables (Optional - Add Later):
These can be added after deployment for full functionality:
- `CRON_SECRET` - For birthday reminder cron job security
- `WHATSAPP_PHONE_NUMBER_ID` - For WhatsApp messages
- `WHATSAPP_ACCESS_TOKEN` - For WhatsApp API
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - For WhatsApp Business
- `TELEGRAM_BOT_TOKEN` - For Telegram notifications (optional)
- `TELEGRAM_CHAT_ID` - For Telegram notifications (optional)

## Deployment Options

### Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Navigate to project directory
cd "c:\Users\Suresh K\Downloads\project\project"

# Deploy to production
vercel --prod

# Follow the prompts and confirm deployment
```

### Option 2: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project: `lakshana-salon`
3. Click "Deployments" tab
4. Click "Redeploy" button
5. Confirm deployment

### Option 3: Deploy via Git Push

```bash
# If you have Git connected:
git add .
git commit -m "Deploy: Fixed build errors and added API routes"
git push

# Vercel will automatically deploy
```

## Post-Deployment Steps

### 1. Add Missing Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables and add:

```bash
# Birthday Cron Security
CRON_SECRET=lakshana-birthday-cron-2025-secure-key-change-in-production

# WhatsApp (if you have credentials)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### 2. Configure Cron Jobs

Vercel will automatically set up the cron job from `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/birthday-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

This runs daily at 9 AM IST to send birthday reminders.

### 3. Verify Deployment

After deployment completes, test these URLs:

**Public Pages:**
- Homepage: `https://your-domain.vercel.app`
- Booking: `https://your-domain.vercel.app/#appointment`

**Admin Pages:**
- Login: `https://your-domain.vercel.app/admin/login`
- Dashboard: `https://your-domain.vercel.app/admin`
- Birthday Reminders: `https://your-domain.vercel.app/admin/birthday-reminders`
- Billing: `https://your-domain.vercel.app/admin/billing`

**API Routes:**
- Birthday Stats: `https://your-domain.vercel.app/api/admin/birthdays?action=statistics`
- Customer Profile: `https://your-domain.vercel.app/api/admin/customers/[id]`

### 4. Test Critical Features

After deployment, test:
1. ✅ Customer booking form (with DOB field)
2. ✅ Admin login
3. ✅ Dashboard loads with data
4. ✅ Birthday reminders page shows upcoming birthdays
5. ✅ Billing page works (not blank)
6. ✅ Customer profiles load
7. ✅ Reports generation works

## Quick Deploy Command

The fastest way to deploy:

```bash
vercel --prod --yes
```

This will:
- Use production environment variables
- Build the application
- Deploy to your domain
- Skip all confirmation prompts

## Expected Output

```
Vercel CLI 54.20.0
🔍  Inspect: https://vercel.com/...
✅  Production: https://lakshana-salon.vercel.app [copied to clipboard] [2m]
```

## Custom Domain Setup

If you want to use a custom domain:

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `lakshanasalon.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Troubleshooting

### Build Fails
```bash
# Check build logs
vercel logs

# Clear cache and rebuild
vercel --force
```

### Environment Variables Not Working
```bash
# List all environment variables
vercel env ls

# Pull environment variables locally to test
vercel env pull .env.production
```

### Cron Job Not Running
1. Check Vercel Dashboard → Cron Jobs
2. Verify CRON_SECRET is set
3. Test manually: `curl -X GET https://your-domain.vercel.app/api/cron/birthday-reminders -H "Authorization: Bearer your-cron-secret"`

## Firebase Security Rules

Make sure your Firestore security rules allow your application:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated reads/writes
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Monitoring

After deployment:
- Monitor logs: https://vercel.com/your-project/logs
- Analytics: https://vercel.com/your-project/analytics
- Check cron execution: https://vercel.com/your-project/cron

## Rollback

If something goes wrong:
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

## Success Criteria

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Homepage loads correctly
- ✅ Admin dashboard is accessible
- ✅ Birthday system shows data
- ✅ No console errors in browser
- ✅ All API routes respond correctly

---

**🎉 Ready to Deploy!**

Run: `vercel --prod` to start deployment now!
