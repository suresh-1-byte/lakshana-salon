# Admin Panel Testing Guide

## Quick Test Checklist

Use this guide to verify all admin panel features are working correctly.

---

## 🚀 Step 1: Start the Server

```bash
cd d:\Lakshana-salon\lakshana-salon-main
npm run dev
```

**Expected:** Server starts on `http://localhost:9002`

---

## 🔐 Step 2: Test Authentication

### Login Page
1. Navigate to: `http://localhost:9002/admin/login`
2. **Check:**
   - ✅ Login page loads
   - ✅ Form has email/password fields
   - ✅ Submit button is present

### Login Credentials
**Note:** Check your `.env.local` or Firebase setup for admin credentials.

Common defaults:
- Email: `admin@lakshanasalon.com`
- Password: (Check your Firebase Auth or environment variables)

### After Login
1. **Check:**
   - ✅ Redirects to `/admin` dashboard
   - ✅ JWT token stored in cookies
   - ✅ Sidebar menu visible
   - ✅ Header with user info displayed

---

## 📊 Step 3: Test Dashboard

Navigate to: `http://localhost:9002/admin`

### Visual Checks:
- ✅ Welcome banner displays with current date
- ✅ 10 stat cards show (even if data is 0)
- ✅ Revenue trend chart renders
- ✅ Popular services pie chart renders
- ✅ Monthly bookings bar chart renders
- ✅ Birthday widget displays
- ✅ Today's appointments section shows
- ✅ Quick action buttons are clickable

### Functionality Checks:
Open browser console (F12) and check:
- ✅ No errors in console
- ✅ `/api/admin/dashboard` API call succeeds
- ✅ Data loads within 2-3 seconds

---

## 👥 Step 4: Test Customer Management

Navigate to: `http://localhost:9002/admin/customers`

### List View:
- ✅ Page loads without errors
- ✅ Table displays (empty or with data)
- ✅ Search box is functional
- ✅ "Add Customer" button visible
- ✅ "Export Excel" button visible

### Add Customer:
1. Click "Add Customer" button
2. Fill in form:
   - Name: `Test Customer`
   - Phone: `9876543210`
   - Email: `test@example.com`
   - Date of Birth: Select a date
3. Click "Save"
4. **Check:**
   - ✅ Success toast appears
   - ✅ Customer appears in list
   - ✅ Phone number is clickable (WhatsApp link)

### Search Customer:
1. Type in search box: `Test`
2. **Check:**
   - ✅ Search filters results
   - ✅ Only matching customers show

### Edit Customer:
1. Click Edit (pencil icon) on any customer
2. Change name: `Test Customer Updated`
3. Click "Save"
4. **Check:**
   - ✅ Success toast appears
   - ✅ Name updates in list

### View Customer Profile:
1. Click View (eye icon) on any customer
2. **Check:**
   - ✅ Redirects to customer detail page
   - ✅ Customer info displays
   - ✅ Visit history shows (if any)

### Export Excel:
1. Click "Export Excel" button
2. **Check:**
   - ✅ Excel file downloads
   - ✅ File contains customer data

---

## 📅 Step 5: Test Bookings

Navigate to: `http://localhost:9002/admin/bookings`

### List View:
- ✅ Bookings page loads
- ✅ Table displays bookings
- ✅ Status badges show correctly

### Add Booking:
1. Click "New Booking"
2. Fill in form:
   - Select customer
   - Select service
   - Choose date/time
   - Add any add-ons
3. Click "Confirm Booking"
4. **Check:**
   - ✅ Success message
   - ✅ Booking appears in list
   - ✅ Status is "pending" or "confirmed"

---

## 💰 Step 6: Test Billing

Navigate to: `http://localhost:9002/admin/billing`

### List View:
- ✅ Billing page loads
- ✅ Invoice list displays
- ✅ Total amounts show correctly

### Create Bill:
1. Click "New Bill"
2. Select customer
3. Add services/items
4. Enter amounts
5. Select payment method
6. Click "Generate Invoice"
7. **Check:**
   - ✅ Invoice generated
   - ✅ Print option available
   - ✅ Total calculated correctly

---

## ✂️ Step 7: Test Services

Navigate to: `http://localhost:9002/admin/services`

### List View:
- ✅ Services page loads
- ✅ Service cards display
- ✅ Categories filter works

### Add Service:
1. Click "Add Service"
2. Fill in:
   - Service name
   - Category
   - Price
   - Duration
3. Click "Save"
4. **Check:**
   - ✅ Service added
   - ✅ Appears in list

---

## 🎂 Step 8: Test Birthday System

Navigate to: `http://localhost:9002/admin/birthday-management`

### Dashboard Widget Check:
1. Go back to `/admin` dashboard
2. **Check:**
   - ✅ Birthday widget shows
   - ✅ "Today's birthdays" count displays
   - ✅ "Upcoming birthdays" count displays

### Birthday Management:
1. Navigate to `/admin/birthday-management`
2. **Check:**
   - ✅ List of upcoming birthdays
   - ✅ Send wish button available
   - ✅ Filter options work

### Send Birthday Wish:
1. Find customer with birthday
2. Click "Send Wish"
3. **Check:**
   - ✅ WhatsApp message prepared
   - ✅ Template message shown
   - ✅ Can customize message

---

## 💬 Step 9: Test WhatsApp Integration

Navigate to: `http://localhost:9002/admin/customers`

### Send Message:
1. Click on any customer
2. Click WhatsApp icon
3. **Check:**
   - ✅ WhatsApp dialog opens
   - ✅ Can select template
   - ✅ Can send custom message
   - ✅ Link opens WhatsApp (if configured)

---

## 📈 Step 10: Test Reports

Navigate to: `http://localhost:9002/admin/reports`

### Daily Report:
1. Click "Daily Report"
2. Select today's date
3. Click "Generate"
4. **Check:**
   - ✅ Report generates
   - ✅ Shows sales, bookings, revenue
   - ✅ Export to Excel works

### Weekly Report:
1. Click "Weekly Report"
2. Select week range
3. Click "Generate"
4. **Check:**
   - ✅ Report generates
   - ✅ Shows weekly aggregates
   - ✅ Charts display correctly

---

## 🔔 Step 11: Test Notifications

Navigate to: `http://localhost:9002/admin/notifications`

### Send Notification:
1. Click "Send Notification"
2. Fill in:
   - Title
   - Message
   - Select recipients (all/specific)
3. Click "Send"
4. **Check:**
   - ✅ Notification queued
   - ✅ Success message shows
   - ✅ Sent count updates

---

## ⚙️ Step 12: Test Settings

Navigate to: `http://localhost:9002/admin/settings`

### General Settings:
- ✅ Settings page loads
- ✅ Can update salon info
- ✅ Can change business hours
- ✅ Can update contact details
- ✅ Save button works

---

## 🖼️ Step 13: Test Gallery

Navigate to: `http://localhost:9002/admin/gallery`

### Upload Image:
1. Click "Upload"
2. Select image file
3. Add caption
4. Click "Upload"
5. **Check:**
   - ✅ Image uploads
   - ✅ Thumbnail displays
   - ✅ Can delete image

---

## ⭐ Step 14: Test Reviews

Navigate to: `http://localhost:9002/admin/reviews`

### Review Management:
- ✅ Reviews list displays
- ✅ Can approve pending reviews
- ✅ Can reject reviews
- ✅ Can view review details

---

## 📊 Step 15: Test Activity Log

Navigate to: `http://localhost:9002/admin/activity`

### Activity Log:
- ✅ Activity log page loads
- ✅ Recent activities show
- ✅ Timestamps are correct
- ✅ User actions logged
- ✅ Filter by date works

---

## 🔍 Step 16: Test Global Search

### Search Bar:
1. Click search icon in header (if available)
2. Type: `Test`
3. **Check:**
   - ✅ Search results appear
   - ✅ Shows customers, bookings, etc.
   - ✅ Click result navigates to detail

---

## 🚨 Common Issues & Solutions

### Issue: "Unauthorized" Error
**Solution:**
- Check if JWT token is present in cookies
- Try logging out and logging in again
- Verify environment variables are set

### Issue: Dashboard Shows All Zeros
**Solution:**
- Normal if no data exists yet
- Add test customers and bookings
- Wait for data to populate

### Issue: API 500 Error
**Solution:**
- Check browser console for details
- Verify Firebase credentials in `.env.local`
- Check Firebase collection names match

### Issue: WhatsApp Not Opening
**Solution:**
- Verify phone number format (with country code)
- Check WhatsApp API configuration
- Ensure customer has valid phone number

### Issue: Excel Export Not Working
**Solution:**
- Check browser console for errors
- Verify `xlsx` package is installed
- Check if popup blocker is interfering

---

## ✅ Final Checklist

After testing all features:

- [ ] Dashboard loads with all widgets
- [ ] Can add/edit/delete customers
- [ ] Can create bookings
- [ ] Can generate bills
- [ ] Can manage services
- [ ] Birthday system works
- [ ] WhatsApp integration functional
- [ ] Reports generate correctly
- [ ] Notifications can be sent
- [ ] Settings can be updated
- [ ] Gallery uploads work
- [ ] Reviews can be managed
- [ ] Activity log shows actions
- [ ] No console errors
- [ ] Mobile responsive (test on phone)

---

## 📱 Mobile Testing

### Test on Mobile Device:
1. Access on phone: `http://YOUR_IP:9002/admin`
2. **Check:**
   - ✅ Responsive layout
   - ✅ Sidebar becomes hamburger menu
   - ✅ Tables scroll horizontally
   - ✅ Forms are usable
   - ✅ Buttons are tap-friendly

---

## 🎯 Performance Testing

### Load Time Checks:
- Dashboard: Should load in < 3 seconds
- Customer list: Should load in < 2 seconds
- API calls: Should respond in < 1 second

### Browser Console:
- No errors (red text)
- No warnings about missing dependencies
- No CORS errors

---

## 🔧 Developer Testing

### Console Commands:
Open browser console and test:

```javascript
// Check if API is accessible
fetch('/api/admin/dashboard')
  .then(r => r.json())
  .then(d => console.log('Dashboard data:', d))

// Check if auth token exists
document.cookie.split(';').find(c => c.includes('admin_token'))
```

---

## ✅ Test Complete!

If all checks pass, your admin panel is **100% functional** and ready for production use.

**Any issues?** Check the console errors and refer to the troubleshooting section above.

---

**Happy Testing! 🎉**

