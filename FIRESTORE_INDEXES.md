# Firestore Indexes Required

## Issue: Reviews Not Showing in Admin Panel

If reviews are submitted but not appearing in the admin panel, you likely need to create Firestore indexes.

## How to Create Indexes

### Method 1: Automatic (When Error Occurs)
1. Open browser console (F12)
2. Click Refresh on Reviews page
3. Look for an error message with a **link**
4. The error will look like: `The query requires an index. You can create it here: https://console.firebase.google.com/...`
5. Click that link - it will take you directly to create the index
6. Click **"Create Index"**
7. Wait 2-5 minutes for index to build
8. Refresh admin panel

### Method 2: Manual Creation
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **lakshana-salon**
3. Go to **Firestore Database** → **Indexes** tab
4. Click **"Create Index"**
5. Enter:
   - **Collection ID**: `reviews`
   - **Fields to index**:
     - Field: `createdAt`, Order: `Descending`
     - Field: `status`, Order: `Ascending` (optional)
   - **Query scope**: Collection
6. Click **"Create"**
7. Wait for status to change from "Building" to "Enabled"

## Required Indexes for This Project

### 1. Reviews Collection
```
Collection: reviews
Fields:
  - createdAt (Descending)
```

### 2. Bookings Collection (if not already created)
```
Collection: bookings
Fields:
  - createdAt (Descending)
```

### 3. Customers Collection (if not already created)
```
Collection: customers
Fields:
  - createdAt (Descending)
```

## Verification

After creating indexes:
1. Wait 2-5 minutes for indexes to build
2. Refresh the admin panel
3. Click Refresh button on Reviews page
4. Reviews should now appear

## Still Not Working?

If reviews still don't show after creating indexes:

1. **Check Firebase Console**:
   - Go to Firestore Database
   - Look for `reviews` collection
   - Verify documents exist

2. **Check Browser Console**:
   - Press F12
   - Look for error messages
   - Share screenshot if needed

3. **Check Environment Variables**:
   - Verify `.env.production` has correct Firebase credentials
   - Verify Vercel has the same environment variables set

4. **Check API Response**:
   - Open Network tab (F12)
   - Refresh Reviews page
   - Click on `/api/admin/reviews` request
   - Check Response tab - should show your reviews

## Quick Test

Test if reviews are being saved:

1. Submit a review via `/review` page
2. Go to Firebase Console → Firestore Database
3. Open `reviews` collection
4. You should see a new document
5. Check its `status` field - should be "pending"
6. Check `createdAt` - should have a timestamp

If the document exists in Firestore but doesn't show in admin panel, it's definitely an index issue.
