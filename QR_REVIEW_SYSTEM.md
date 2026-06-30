# QR Code Review System

## Overview
The QR Code Review System allows customers to easily submit reviews by scanning a QR code. Reviews are submitted to the admin panel for approval before appearing on the website.

## Features

### 1. **Customer Review Page** (`/review`)
- Beautiful, mobile-friendly review submission form
- Star rating system (1-5 stars)
- Fields for name, phone (optional), review text, and service
- Instant feedback on submission
- Fully branded with your salon's design

### 2. **Admin Panel QR Code Generator**
- Generate QR codes instantly from the Reviews page
- Download QR code as PNG image
- Preview the review submission page
- Professional QR code design in brand colors

### 3. **Review Management**
- All QR submissions appear in "Pending" status
- Approve or reject reviews with one click
- Mark featured reviews to show in testimonials
- Full review details including source tracking

### 4. **Website Integration**
- Approved and featured reviews automatically appear on the homepage testimonials
- Smooth carousel display
- Falls back to default reviews if none available

## How to Use

### For Admins:

1. **Generate QR Code**
   - Go to Admin Panel → Reviews
   - Click the "QR Code" button in the toolbar
   - A modal will open with the generated QR code

2. **Download QR Code**
   - In the QR modal, click "Download QR"
   - Save the PNG file to your computer
   - Print and display at your reception desk, checkout counter, or service areas

3. **Share the Review Link**
   - Review page URL: `https://yourwebsite.com/review`
   - Share via WhatsApp, SMS, or email
   - Add to receipts or thank-you cards

4. **Manage Reviews**
   - New submissions appear in the "Pending" tab
   - Click ✓ to approve (makes it public)
   - Click ✗ to reject
   - Click 👑 to feature in testimonials carousel
   - Click 🗑️ to delete permanently

### For Customers:

1. **Scan the QR Code**
   - Use any smartphone camera
   - Point at the QR code
   - Tap the notification/link that appears

2. **Fill the Review Form**
   - Enter your name (required)
   - Add phone number (optional)
   - Select star rating (required)
   - Write your review (required)
   - Mention the service you received (optional)

3. **Submit**
   - Click "Submit Review"
   - See confirmation message
   - Review will appear on website once approved

## Display Locations for QR Code

### Recommended Placements:
- 🏪 Reception desk (table tent or wall poster)
- 💳 Checkout counter
- 🪞 Service area walls
- 📄 Printed receipts
- 📧 Email signatures
- 💬 WhatsApp business profile
- 📱 Social media posts

### Print Specifications:
- **Minimum size**: 2" x 2" (5cm x 5cm)
- **Recommended size**: 4" x 4" (10cm x 10cm) or larger
- **Format**: PNG with transparent or white background
- **Colors**: Pink (#D4447A) and white

## Technical Details

### API Endpoints:
- `POST /api/public/reviews` - Public submission endpoint
- `GET /api/cms/reviews` - Fetch approved reviews for website
- `GET /api/admin/reviews` - Fetch all reviews (admin only)
- `PATCH /api/admin/reviews/:id` - Update review status
- `DELETE /api/admin/reviews/:id` - Delete review

### Database Schema:
```typescript
{
  customerName: string;      // Required
  customerPhone: string;     // Optional
  rating: number;            // 1-5, Required
  comment: string;           // Required
  service: string;           // Optional
  source: string;            // 'qr_scan', 'manual', 'website', etc.
  status: string;            // 'pending', 'approved', 'rejected'
  isFeatured: boolean;       // Show in testimonials carousel
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Review Flow:
1. Customer scans QR → Opens `/review` page
2. Customer submits review → POST to `/api/public/reviews`
3. Review saved with `status: 'pending'` and `source: 'qr_scan'`
4. Admin sees review in Pending tab
5. Admin approves → Updates `status: 'approved'`
6. Admin marks as featured → Updates `isFeatured: true`
7. Review appears on website testimonials

## Tips for Maximum Reviews

### 1. **Timing**
- Ask immediately after service completion
- Customer satisfaction is highest right after service

### 2. **Incentives** (Optional)
- Small discount on next visit
- Entry into monthly draw
- Loyalty points

### 3. **Training Staff**
- Show customers the QR code
- Explain it takes just 30 seconds
- Mention reviews help other customers

### 4. **Make it Visible**
- Multiple locations increase scan rate
- Eye-level placement works best
- Good lighting around QR code

### 5. **Follow-up**
- Send review link via WhatsApp after visit
- Include in thank-you emails
- Reminder after 2-3 days

## Security & Privacy

- ✅ No authentication required for submission
- ✅ All submissions require admin approval
- ✅ Phone numbers are optional
- ✅ No customer data is publicly exposed
- ✅ Admin can delete inappropriate reviews
- ✅ Source tracking for analytics

## Support

If you need help with the QR review system:
1. Check this documentation first
2. Test the `/review` page directly in browser
3. Ensure Firebase is properly configured
4. Check admin panel for pending reviews

## Future Enhancements (Optional)

- 📸 Photo uploads with reviews
- 🎁 Automatic reward/coupon on submission
- 📊 Review analytics dashboard
- 📧 Email notifications on new reviews
- ⭐ Google/Facebook review integration
- 🤖 AI sentiment analysis
- 📱 SMS notifications to customers
