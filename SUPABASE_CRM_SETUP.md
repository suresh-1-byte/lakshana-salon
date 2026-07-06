# 🎨 Lakshana Beauty Salon CRM - Complete Setup Guide

## 📋 Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Migration](#database-migration)
4. [Google Sheets Integration](#google-sheets-integration)
5. [WhatsApp Cloud API Setup](#whatsapp-cloud-api-setup)
6. [Features Overview](#features-overview)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `lakshana-salon-crm`
   - **Database Password**: (Save this securely)
   - **Region**: Choose closest to your location
5. Wait for project creation (~2 minutes)

### Step 2: Get Supabase Credentials

1. In your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the following:
   - **Project URL** (`https://xxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

---

## ⚙️ Environment Configuration

Update your `.env.local` file with Supabase credentials:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Panel
ADMIN_EMAIL=admin@lakshanasalon.com
ADMIN_PASSWORD=Admin@123
ADMIN_NOTIFICATION_EMAIL=admin@lakshanabeautysalon.in

# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# Google Sheets
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SPREADSHEET_ID=your-spreadsheet-id

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this

# Resend API (for emails)
RESEND_API_KEY=re_your_resend_api_key
```

---

## 🗄️ Database Migration

### Method 1: Using Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New Query"**
3. Copy contents from `supabase/migrations/001_create_schema.sql`
4. Paste and click **"Run"**
5. Repeat for `supabase/migrations/002_rls_policies.sql`

### Method 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### Verify Tables Created

Go to **Table Editor** in Supabase Dashboard. You should see:

✅ customers  
✅ services  
✅ packages  
✅ staff  
✅ appointments  
✅ payments  
✅ consultations  
✅ enquiries  
✅ memberships  
✅ customer_packages  
✅ photo_gallery  
✅ whatsapp_messages  
✅ notifications  
✅ audit_logs  
✅ message_templates  
✅ google_sheets_sync_log

---

## 📊 Google Sheets Integration

### Step 1: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google Sheets API**:
   - Go to **APIs & Services** → **Library**
   - Search "Google Sheets API"
   - Click **Enable**

### Step 2: Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **Create Service Account**
3. Fill:
   - **Name**: `salon-crm-sheets`
   - **Description**: "For syncing CRM data to Google Sheets"
4. Click **Create and Continue**
5. Skip role assignment (optional)
6. Click **Done**

### Step 3: Generate Private Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create New Key**
4. Select **JSON**
5. Click **Create** (file will download)
6. Open the JSON file and copy:
   - `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`

### Step 4: Create Google Sheet

1. Create new Google Sheet
2. Name it "Lakshana Salon CRM Data"
3. Create following sheets (tabs):
   - `Customers`
   - `Bookings`
   - `Enquiries`
   - `Payments`
   - `Consultations`
   - `Birthday_Wishes`
   - `Memberships`

### Step 5: Share Sheet with Service Account

1. Click **Share** button
2. Paste the `GOOGLE_SHEETS_CLIENT_EMAIL`
3. Give **Editor** permission
4. Click **Send**
5. Copy the Spreadsheet ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
6. Add to `.env.local` as `GOOGLE_SPREADSHEET_ID`

---

## 📱 WhatsApp Cloud API Setup

### Step 1: Meta for Developers

1. Go to [https://developers.facebook.com](https://developers.facebook.com)
2. Log in with Facebook account
3. Click **My Apps** → **Create App**
4. Select **Business** type
5. Fill app details

### Step 2: Add WhatsApp Product

1. In App Dashboard, click **Add Product**
2. Find **WhatsApp** → Click **Set Up**
3. Create or select **Business Account**

### Step 3: Get Credentials

1. Go to **WhatsApp** → **API Setup**
2. Copy:
   - **Phone Number ID**
   - **WhatsApp Business Account ID**
3. Generate **Temporary Access Token** (24 hours)
   - For permanent token, create **System User** with WhatsApp permissions

### Step 4: Add Phone Number

1. Go to **WhatsApp** → **Phone Numbers**
2. Add your phone number
3. Verify with OTP
4. This number will send messages

### Step 5: Configure in .env

```bash
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765
```

### Step 6: Test WhatsApp Integration

In admin panel, try sending a test message to verify setup.

---

## ✨ Features Overview

### ✅ Customer Management
- Create, Read, Update, Delete customers
- Customer profiles with statistics
- Birthday tracking
- Search and filter
- Export to Excel
- Photo management

### ✅ Appointment Booking
- Book appointments with services/packages
- Auto-create customers
- Stylist assignment
- Status tracking
- Payment management
- WhatsApp confirmation

### ✅ Services Management
- 20+ predefined categories
- Add/Edit/Delete services
- Pricing and offers
- Duration tracking
- Image upload

### ✅ Packages Management
- Create service bundles
- Validity tracking
- Session management
- Assign to customers
- Usage tracking

### ✅ Consultation System
- Record customer consultations
- Hair/Skin type tracking
- Recommendations
- Before/After images
- Follow-up scheduling

### ✅ Enquiry Management
- Capture leads from website
- Status tracking
- Convert to booking
- Source tracking
- Real-time updates

### ✅ WhatsApp Integration
- Booking confirmations
- Birthday wishes
- Appointment reminders
- Bulk messaging
- Message templates
- Delivery status

### ✅ Payment Management
- Multiple payment methods
- Invoice generation
- Payment tracking
- Receipt printing
- Refund handling

### ✅ Membership System
- Silver/Gold/Premium tiers
- Discount benefits
- Member cards
- Expiry tracking
- Renewal management

### ✅ Staff Management
- Staff profiles
- Role-based access
- Attendance tracking
- Performance metrics
- Salary management

### ✅ Reports & Analytics
- Daily/Weekly/Monthly reports
- Revenue tracking
- Customer insights
- Service popularity
- Export capabilities

### ✅ Birthday Automation
- Daily birthday checks
- Dashboard notifications
- Auto WhatsApp wishes
- Birthday template customization

### ✅ Google Sheets Sync
- Real-time data sync
- Automatic updates
- Retry on failure
- Sync logs

### ✅ Notifications
- Dashboard alerts
- Real-time updates
- Sound notifications
- Mark as read
- Type categorization

### ✅ Photo Gallery
- Before/After images
- Service categorization
- Customer history
- Download/Print

---

## 🔌 API Endpoints

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/today` - Today's appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/today` - Today's payments

### WhatsApp
- `POST /api/whatsapp/send` - Send message
- `POST /api/whatsapp/booking-confirmation` - Send booking confirmation
- `POST /api/whatsapp/birthday-wish` - Send birthday wish
- `POST /api/whatsapp/reminder` - Send reminder

---

## 🐛 Troubleshooting

### Supabase Connection Error
```
Error: Invalid Supabase URL or Key
```
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Google Sheets Sync Fails
```
Error: Permission denied
```
**Solution**: 
1. Verify service account email has Editor access to sheet
2. Check `GOOGLE_SHEETS_PRIVATE_KEY` is properly formatted with `\n`

### WhatsApp Message Not Sending
```
Error: Failed to send WhatsApp message
```
**Solution**:
1. Verify phone number is verified in Meta Business
2. Check access token is valid (not expired)
3. Ensure phone number format is correct (with country code)

### Database Migration Error
```
Error: Relation already exists
```
**Solution**: Tables already created. Skip migration or drop existing tables first.

### Build Errors
```
Type Error: Cannot find module '@/lib/supabase/client'
```
**Solution**: 
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 🎯 Next Steps

1. ✅ Complete Supabase setup
2. ✅ Run database migrations
3. ✅ Configure environment variables
4. ✅ Set up Google Sheets integration
5. ✅ Configure WhatsApp API
6. ✅ Test admin panel access
7. ✅ Add initial services
8. ✅ Create staff accounts
9. ✅ Test booking flow
10. ✅ Verify WhatsApp messages

---

## 📞 Support

For issues or questions:
- Check troubleshooting section
- Review Supabase logs
- Check console errors
- Verify all environment variables

---

## 🎉 You're All Set!

Your production-ready Beauty Salon CRM is now configured with:
- ✅ Supabase Database
- ✅ Real-time updates
- ✅ WhatsApp automation
- ✅ Google Sheets sync
- ✅ Complete admin panel
- ✅ Customer management
- ✅ Booking system
- ✅ Payment tracking
- ✅ Reports & analytics

**Start the development server:**
```bash
npm run dev
```

**Access admin panel:**
```
http://localhost:9002/admin
```

---

**🌟 Lakshana Beauty Salon CRM - Built with Next.js, Supabase, TypeScript, TailwindCSS**
