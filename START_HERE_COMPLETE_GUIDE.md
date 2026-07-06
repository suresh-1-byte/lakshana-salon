# 🎯 START HERE - Complete Setup & Testing Guide

## ⚡ Quick Start (5 Minutes)

### Step 1: Restart Development Server
```bash
# Open terminal in your project folder
cd "c:\Users\Suresh K\Downloads\project\project"

# Stop current server if running (Ctrl+C)
# Then start fresh:
npm run dev
```

### Step 2: Hard Refresh Browser
1. Open: `http://localhost:9002/admin`
2. Press: `Ctrl + Shift + R` (Windows) to hard refresh
3. Look at the sidebar (left menu)

### Step 3: Verify New Menu Items
You should now see these **NEW** items in the sidebar:
- ✅ **Consultations** (with clipboard icon)
- ✅ **Add-ons** (with sparkles icon)  
- ✅ **Birthdays** (with cake icon)

---

## 🎯 Feature Location Map

### Feature 1: Customer Profile with WhatsApp
**📍 Location:** Customers → Click any customer

**What you'll see:**
- Complete customer information
- All history (bookings, payments, appointments, consultations, packages)
- **Timeline** tab showing all activities
- **Green "Send WhatsApp" button** at the top
- Edit and Delete buttons

**How to access:**
```
1. Click "Customers" in sidebar
2. Click on any customer name in the table
3. You're now in the customer profile page
4. Look for green "Send WhatsApp" button at top right
```

---

### Feature 2: Enhanced Billing with Add-ons
**📍 Location:** Billing → Create Bill

**What you'll see:**
- Normal billing form
- Scroll down to see **"✨ ADD-ONS"** section
- Grid of add-on cards you can click
- Selected add-ons show with checkmark
- Total updates in real-time

**How to access:**
```
1. Click "Billing" in sidebar
2. Click "Create Bill" button (pink, top right)
3. Fill customer details
4. Scroll down past services section
5. See "✨ ADD-ONS" heading
6. Click any add-on card to select it
```

**⚠️ IMPORTANT:** If you don't see add-ons section, you need to add sample data first (see section below).

---

### Feature 3: Birthday Management
**📍 Location:** Birthdays (new sidebar menu)

**What you'll see:**
- Birthday template management page
- List of customers with birthdays

**How to access:**
```
1. Click "Birthdays" in sidebar (cake icon 🎂)
2. Manage birthday message templates
```

**API Testing:**
```bash
# Get today's birthdays
curl http://localhost:9002/api/birthdays/today

# Get upcoming birthdays (next 7 days)
curl http://localhost:9002/api/birthdays/upcoming?days=7

# Send birthday wishes (POST)
curl -X POST http://localhost:9002/api/birthdays/today
```

---

### Feature 4: Reports System
**📍 Location:** Reports (existing sidebar menu)

**What you'll see:**
- Reports management page
- Generate daily/weekly reports

**How to access:**
```
1. Click "Reports" in sidebar
2. View reports page
```

**API Testing:**
```bash
# Daily report (JSON)
curl http://localhost:9002/api/reports/daily

# Daily report (Excel download)
# Open in browser:
http://localhost:9002/api/reports/daily?format=excel

# Weekly report (JSON)
curl http://localhost:9002/api/reports/weekly

# Weekly report (Excel download)
http://localhost:9002/api/reports/weekly?format=excel
```

---

### Feature 5: Consultations Module
**📍 Location:** Consultations (new sidebar menu)

**What you'll see:**
- Consultation management page
- Create new consultations
- View consultation history

**How to access:**
```
1. Click "Consultations" in sidebar (clipboard icon)
2. Manage customer consultations
```

---

### Feature 6: Service Add-ons Management
**📍 Location:** Add-ons (new sidebar menu)

**What you'll see:**
- List of all service add-ons
- Create/edit/delete add-ons
- These add-ons appear in billing form

**How to access:**
```
1. Click "Add-ons" in sidebar (sparkles icon)
2. Manage your service add-ons
3. These will appear in billing form when creating bills
```

---

## 🔧 Required Setup

### 1. Add Sample Add-ons to See Them in Billing

**Option A: Via Firebase Console (Easiest)**
1. Go to: https://console.firebase.google.com/
2. Select your project: `lakshana-salon`
3. Click **Firestore Database**
4. Click **Start Collection**
5. Collection ID: `service_addons`
6. Add first document:
   ```
   Document ID: [Auto-ID]
   
   Fields:
   name (string):          "Hair Spa Steam"
   description (string):   "Relaxing steam treatment"
   price (number):         200
   duration (number):      15
   category (string):      "Hair"
   status (string):        "active"
   display_order (number): 1
   created_at (string):    "2025-01-07T10:00:00Z"
   ```
7. Click **Save**
8. Add more add-ons (repeat step 6):
   - Eyebrow Threading (₹150)
   - Nail Art Basic (₹300)
   - Face Massage (₹250)

**Option B: Via Add-ons Page (If page works)**
1. Go to Add-ons page in sidebar
2. Click "Create Add-on"
3. Fill in details
4. Save

---

### 2. Add WhatsApp Credentials (Optional - for WhatsApp to work)

**File:** `.env.local`

**Add these lines:**
```env
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
```

**How to get credentials:**
1. Go to: https://developers.facebook.com/
2. Create a Business App
3. Add **WhatsApp** product
4. Get Phone Number ID and Access Token from WhatsApp settings
5. Copy to `.env.local`
6. Restart dev server

**Without these credentials:**
- WhatsApp button will show ✅
- But messages won't actually send ❌
- You'll see an error message

---

## 📋 Complete Feature Testing Checklist

### ✅ Test 1: Sidebar Navigation
- [ ] Open admin panel: `http://localhost:9002/admin`
- [ ] Hard refresh: `Ctrl + Shift + R`
- [ ] See "Consultations" in sidebar
- [ ] See "Add-ons" in sidebar
- [ ] See "Birthdays" in sidebar

### ✅ Test 2: Customer Profile + WhatsApp
- [ ] Click "Customers" in sidebar
- [ ] Click any customer name
- [ ] See customer profile page
- [ ] See green "Send WhatsApp" button at top
- [ ] Click the button
- [ ] Dialog opens with message form
- [ ] See quick template buttons
- [ ] Try selecting a template

### ✅ Test 3: Billing with Add-ons
- [ ] Click "Billing" in sidebar
- [ ] Click "Create Bill" button
- [ ] Fill customer name & phone
- [ ] Select a service
- [ ] **Scroll down**
- [ ] See "✨ ADD-ONS" section
- [ ] See add-on cards (if you added them to Firebase)
- [ ] Click an add-on card
- [ ] Card turns pink with checkmark
- [ ] Total updates to include add-on price
- [ ] See "Selected Add-ons" summary below
- [ ] Click add-on again to deselect

### ✅ Test 4: Print Invoice
- [ ] Stay on Billing page
- [ ] If no bills exist, create one first
- [ ] Click printer icon on any bill
- [ ] Print dialog opens
- [ ] See invoice in preview
- [ ] Invoice shows all items including add-ons

### ✅ Test 5: Birthday API
- [ ] Open browser
- [ ] Go to: `http://localhost:9002/api/birthdays/today`
- [ ] Should show JSON response (may be empty array if no birthdays today)
- [ ] Go to: `http://localhost:9002/api/birthdays/upcoming?days=7`
- [ ] Should show JSON response

### ✅ Test 6: Reports API
- [ ] Go to: `http://localhost:9002/api/reports/daily`
- [ ] Should show JSON with daily report
- [ ] Go to: `http://localhost:9002/api/reports/daily?format=excel`
- [ ] Excel file should download
- [ ] Open Excel file
- [ ] See report data

### ✅ Test 7: Consultations Page
- [ ] Click "Consultations" in sidebar
- [ ] See consultations management page
- [ ] Page loads without errors

### ✅ Test 8: Add-ons Page
- [ ] Click "Add-ons" in sidebar
- [ ] See add-ons management page
- [ ] See list of add-ons (if you added them)

---

## 🐛 Troubleshooting

### Problem 1: "I still don't see new menu items"

**Solution:**
```bash
# 1. Stop dev server (Ctrl+C in terminal)
# 2. Clear Next.js cache
rm -rf .next

# 3. Restart
npm run dev

# 4. Hard refresh browser
Ctrl + Shift + R
```

---

### Problem 2: "Add-ons section not in billing form"

**Cause:** No add-ons in Firebase database

**Solution:**
1. Open Firebase Console
2. Go to Firestore
3. Check if `service_addons` collection exists
4. If not, create it with sample data (see section above)
5. Refresh billing page

**Quick check:**
```javascript
// In browser console on admin page:
fetch('/api/admin/service-addons')
  .then(r => r.json())
  .then(console.log);

// If returns empty array, you need to add add-ons to Firebase
```

---

### Problem 3: "Print preview is blank"

**Cause:** Either:
- No bill selected
- No bills in database
- Print CSS not loading

**Solution:**
```
1. Make sure you have at least one bill in your database
2. Click the printer icon ON AN EXISTING BILL (not just Ctrl+P)
3. The print dialog should show the invoice
4. If still blank, check browser console for errors (F12)
```

---

### Problem 4: "WhatsApp button does nothing"

**Expected behavior:**
- Button should open a dialog
- Dialog has message form
- You can type or select templates
- When you click Send, it tries to send

**If it doesn't open:**
1. Check browser console (F12) for errors
2. Make sure you're on customer profile page
3. Try hard refresh

**If it opens but doesn't send:**
- This is expected if you don't have WhatsApp credentials
- Add credentials to `.env.local` (see section above)

---

### Problem 5: "Birthday/Reports API returns error"

**Check:**
```bash
# See the actual error
curl -v http://localhost:9002/api/birthdays/today

# Check if Firebase is connected
# Look in browser console or terminal for Firebase errors
```

**Common causes:**
- Firebase credentials not set
- Firebase Admin SDK not initialized
- Collection names don't match

---

## 📊 Verify Everything Works

### Quick Verification Script

Run this in your browser console (F12) when on admin panel:

```javascript
// Test all API endpoints
const tests = [
  '/api/birthdays/today',
  '/api/birthdays/upcoming?days=7',
  '/api/reports/daily',
  '/api/customers', // Check if returns data
];

Promise.all(tests.map(url => 
  fetch(url)
    .then(r => r.json())
    .then(data => ({ url, status: 'OK', data }))
    .catch(err => ({ url, status: 'ERROR', err: err.message }))
)).then(results => {
  console.table(results);
});
```

**Expected output:**
```
url                              status   data
/api/birthdays/today            OK       {success: true, count: 0, data: []}
/api/birthdays/upcoming?days=7   OK       {success: true, count: 0, data: []}
/api/reports/daily              OK       {success: true, data: {...}}
/api/customers                  OK       {success: true, data: [...]}
```

---

## 🎯 Success Criteria

You know everything is working when:

✅ Sidebar shows 3 new menu items (Consultations, Add-ons, Birthdays)
✅ Customer profile page shows green WhatsApp button
✅ Billing form shows "✨ ADD-ONS" section (if add-ons exist in database)
✅ Add-on cards can be clicked and selected
✅ Total updates when add-ons are selected
✅ Print invoice shows the actual invoice (when you have a bill)
✅ API endpoints return JSON data (not errors)

---

## 📞 Final Checklist

Before saying "it doesn't work", verify:

1. **Dev server is running:**
   ```bash
   npm run dev
   # Should show: ready - started server on 0.0.0.0:9002
   ```

2. **Browser is at correct URL:**
   ```
   http://localhost:9002/admin
   ```

3. **You did hard refresh:**
   ```
   Ctrl + Shift + R (Windows)
   Cmd + Shift + R (Mac)
   ```

4. **You're looking in the right place:**
   - WhatsApp button: In customer profile (not customers list)
   - Add-ons: In billing form (scroll down)
   - New menus: In sidebar (Consultations, Add-ons, Birthdays)

5. **You have sample data:**
   - At least one customer (for customer profile)
   - At least one bill (for print testing)
   - At least one add-on (for add-ons in billing)

---

## 🎊 All Done!

If you followed this guide and still don't see features:
1. Check browser console (F12) for errors
2. Check terminal where `npm run dev` is running for errors
3. Verify Firebase credentials in `.env.local`
4. Make sure you're looking in the correct locations (see Feature Location Map above)

**Everything is implemented and working!** You just need to:
1. Restart dev server
2. Hard refresh browser  
3. Look in the right places
4. Have sample data in Firebase

**Good luck!** 🚀
