# 🚀 Quick Deployment Checklist - Birthday Automation

## Status: Ready to Deploy ✅

All code is complete. Follow these steps to activate the system.

---

## ⚠️ STEP 1: Run Database Migration (REQUIRED)

### Method 1: Supabase Dashboard (Easiest)

1. Open: https://supabase.com/dashboard/project/mywunciqznhwwlivkz
2. Click: **SQL Editor** (left sidebar)
3. Open file: `supabase/migrations/004_birthday_automation.sql`
4. Copy all SQL code
5. Paste into SQL Editor
6. Click: **Run** button
7. Wait for: ✅ Success message

### Method 2: Supabase CLI

```bash
cd c:\Users\Suresh K\Downloads\project\project
supabase db push
```

### Verify Migration Success

Go to **Table Editor** and check these tables exist:
- ✅ `birthday_notifications`
- ✅ `birthday_templates` (should have 3 rows)

---

## 📦 STEP 2: Deploy to Vercel

### Add Environment Variables in Vercel

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Add these variables for **Production**:

```
CRON_SECRET=lakshana-birthday-cron-2025-secure-key-change-in-production
```

⚠️ **Important:** Change this to a strong random key!

### Deploy

```bash
cd c:\Users\Suresh K\Downloads\project\project
git add .
git commit -m "Add birthday automation system"
git push origin main
```

Vercel auto-deploys from main branch.

---

## ✅ STEP 3: Test the System

### Test 1: Add Test Customer

Run in Supabase SQL Editor:

```sql
-- Update a customer to have birthday in 3 days
UPDATE customers 
SET date_of_birth = CURRENT_DATE + INTERVAL '3 days'
WHERE id = (SELECT id FROM customers LIMIT 1);
```

### Test 2: Manually Trigger Cron

```bash
curl -X POST https://YOUR-DOMAIN.vercel.app/api/cron/birthday-check \
  -H "Authorization: Bearer lakshana-birthday-cron-2025-secure-key-change-in-production"
```

Expected response:
```json
{
  "success": true,
  "notificationsCreated": 1,
  "pendingTotal": 1
}
```

### Test 3: Check Dashboard

1. Login: https://YOUR-DOMAIN.vercel.app/admin
2. See Birthday Widget on dashboard
3. Should show 1 pending offer
4. Click "Send Offer" button
5. Should see success toast

### Test 4: Verify Database

```sql
-- Check notifications created
SELECT * FROM birthday_notifications ORDER BY created_at DESC LIMIT 5;

-- Check messages sent
SELECT * FROM whatsapp_messages WHERE birthday_notification_id IS NOT NULL;
```

---

## 🎯 STEP 4: Configure WhatsApp (Optional but Recommended)

To actually send messages (not just log them):

### Option 1: WhatsApp Cloud API

1. Get credentials from Meta Business
2. Add to Vercel environment variables:

```
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```

### Option 2: Third-Party Service

Use Twilio, WATI, or Gupshup and update `src/lib/api/whatsapp.ts`

---

## 📋 Post-Deployment Checklist

After deployment, verify:

- [ ] Database migration ran successfully (check tables)
- [ ] Vercel deployment succeeded
- [ ] Cron job is scheduled (check Vercel > Cron Jobs)
- [ ] Environment variable CRON_SECRET is set
- [ ] Manual cron trigger works
- [ ] Dashboard shows Birthday Widget
- [ ] Test customer appears in pending offers
- [ ] "Send Offer" button works
- [ ] Message appears in whatsapp_messages table
- [ ] Notification status updates to 'sent'

---

## 🎊 That's It!

Once all checkboxes are ticked, the system is **LIVE** and will:
- ✅ Run automatically every day at 9:00 AM
- ✅ Create notifications for birthdays in next 7 days  
- ✅ Show pending offers on dashboard
- ✅ Send personalized WhatsApp offers
- ✅ Track all messages and statistics

---

## 🐛 Quick Troubleshooting

**No birthdays showing?**
- Check customers have `date_of_birth` filled
- Run: `SELECT * FROM get_upcoming_birthdays(7);`

**Cron not running?**
- Check Vercel > Cron Jobs section
- Verify `vercel.json` exists in root

**Messages not sending?**
- Check WhatsApp API credentials
- View `whatsapp_messages` table for errors

---

## 📞 Need Help?

Review the detailed guide: `BIRTHDAY_SYSTEM_COMPLETE.md`

**System is production-ready!** Just deploy and test. 🚀
