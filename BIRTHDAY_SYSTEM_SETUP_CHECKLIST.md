# 🎂 Birthday Notification System - Setup Checklist

## ✅ Quick Setup Guide (5 Minutes)

Follow these steps to get the birthday notification system working:

---

## Step 1: Configure WhatsApp API (2 minutes)

### A. Get WhatsApp Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create or select a WhatsApp Business App
3. Navigate to **WhatsApp > API Setup**
4. Copy these values:
   - **Phone Number ID** (under "From")
   - **Business Account ID** (under your phone number)
5. Click **Create Permanent Token** and copy it

### B. Add to Environment Variables

**Local Development** (`.env.local`):
```env
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id-here
WHATSAPP_ACCESS_TOKEN=your-permanent-token-here
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id-here
ADMIN_WHATSAPP_NUMBER=+919876543210
```

**Vercel Production** (Dashboard > Settings > Environment Variables):
```
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_ACCESS_TOKEN
WHATSAPP_BUSINESS_ACCOUNT_ID
ADMIN_WHATSAPP_NUMBER
CRON_SECRET (already set, copy from .env.local)
```

---

## Step 2: Test WhatsApp Integration (1 minute)

1. Start the development server: `npm run dev`
2. Go to admin panel: http://localhost:3000/admin
3. Navigate to **Birthday Settings**
4. Click **Send Test Reminder** button
5. ✅ You should receive a WhatsApp test message!

**If test fails:**
- Check WhatsApp credentials are correct
- Verify phone number includes country code (+91...)
- Check console logs for error details

---

## Step 3: Deploy to Vercel (1 minute)

```bash
# Commit changes
git add .
git commit -m "Add birthday notification system"

# Push to deploy
git push origin main
```

Vercel will automatically:
- Deploy your changes
- Set up the cron job (runs daily at 9 AM IST)
- Configure environment variables

---

## Step 4: Verify Cron Job (1 minute)

### In Vercel Dashboard:

1. Go to your project
2. Click **Deployments** tab
3. Find the latest deployment
4. Wait for 9:00 AM IST next day OR
5. Manually trigger: Go to **Settings > Cron Jobs**

### Check Logs:
- Click **View Function Logs**
- Search for "birthday"
- Should see: `✅ Sent X reminders`

---

## Step 5: Start Collecting DOB (Ongoing)

1. Go to **Customers** page
2. Edit existing customers or add new ones
3. Fill in **Date of Birth** field
4. Save

**Monitor Progress:**
- Go to **Birthday Settings**
- View DOB collection statistics
- See which customers are missing DOB

---

## 🎯 Verification Checklist

Before going live, verify:

- [ ] WhatsApp credentials added to `.env.local`
- [ ] WhatsApp credentials added to Vercel environment variables
- [ ] Test reminder sends successfully
- [ ] Application deployed to Vercel
- [ ] Cron job configured in `vercel.json`
- [ ] `CRON_SECRET` set in Vercel
- [ ] At least 1 customer has DOB for testing
- [ ] Can view upcoming birthdays page
- [ ] Can manually trigger reminders
- [ ] Birthday Settings page shows statistics

---

## 🚀 Going Live Flow

1. **Week 1**: Start collecting DOB from all customers
   - Update existing customer profiles
   - Add DOB field to new customer onboarding
   - Use Birthday Settings page to track progress

2. **Week 2**: Test the system
   - Use **Send Test Reminder** to verify
   - Manually trigger reminders for upcoming birthdays
   - Monitor WhatsApp message delivery

3. **Week 3**: Enable automatic mode
   - Let cron job run daily at 9 AM
   - Monitor logs in Vercel dashboard
   - Check message delivery success rate

4. **Ongoing**: Maintain the system
   - Keep collecting DOB for new customers
   - Monitor Birthday Settings statistics
   - Review message logs regularly

---

## 📱 Admin Panel Quick Access

| Page | URL | Purpose |
|------|-----|---------|
| Birthday Settings | `/admin/birthday-settings` | View stats, test system |
| Birthday Reminders | `/admin/birthday-reminders` | View upcoming, send manually |
| Customers | `/admin/customers` | Add/edit DOB |

---

## 🔥 Quick Troubleshooting

### WhatsApp messages not sending?
```bash
# Check credentials
echo $WHATSAPP_ACCESS_TOKEN
echo $WHATSAPP_PHONE_NUMBER_ID

# Test locally
npm run dev
# Go to /admin/birthday-settings
# Click "Send Test Reminder"
```

### Cron not running?
1. Check `vercel.json` exists and is correct
2. Verify `CRON_SECRET` in Vercel environment
3. Redeploy: `git push origin main`
4. Check Vercel logs

### Customers not showing up?
1. Verify DOB is saved in customer profile
2. Check date format (should be YYYY-MM-DD)
3. Refresh birthday reminders page

---

## 💡 Pro Tips

1. **Batch DOB Collection**: 
   - Print a simple form for customers to fill
   - Update profiles during checkout
   - Incentivize: "Get birthday discount by providing DOB"

2. **Message Personalization**:
   - Message template is in `/api/cron/birthday-reminders/route.ts`
   - Customize offer percentage, validity, etc.

3. **Monitoring**:
   - Check Birthday Settings daily
   - Track DOB collection progress
   - Review message delivery success rate

4. **Testing**:
   - Add test customer with birthday 7 days from now
   - Manually trigger reminder
   - Verify message received

---

## ✅ Success Indicators

Your system is working when:

✅ Test reminder sends successfully  
✅ Cron job runs daily (check Vercel logs)  
✅ Messages delivered to customers (7 days before)  
✅ DOB collection rate > 80%  
✅ No errors in Vercel logs  
✅ Customers receive 20% discount offer  

---

## 📞 Need Help?

1. Read `BIRTHDAY_NOTIFICATION_SYSTEM.md` (full documentation)
2. Check Vercel deployment logs
3. Verify environment variables
4. Test with **Send Test Reminder**
5. Review WhatsApp Business account status

---

**Estimated Setup Time: 5 minutes**  
**Estimated Testing Time: 2 minutes**  
**Time to First Birthday Reminder: Next 9 AM (after 7 days)**

🎉 **You're all set!** Start collecting birthdays and watch the magic happen!
