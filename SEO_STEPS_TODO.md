# ✅ SEO Activation - Simple Steps

## Status: FAQ Added to Website ✅

---

## 🔴 STEP 2: Update Your Business Information (5 minutes)

### Open this file in VS Code:
```
src/lib/seo-config.ts
```

### Update these lines (around line 28-40):

**FIND THIS:**
```typescript
phone: '+91 9876543210',  // Update with actual phone
```

**CHANGE TO:**
```typescript
phone: '+91 YOUR_ACTUAL_PHONE',  // Example: '+91 9876543210'
```

---

**FIND THIS:**
```typescript
email: 'info@lakshanasalon.com',
```

**CHANGE TO:**
```typescript
email: 'your-real-email@gmail.com',  // Your actual email
```

---

**FIND THIS:**
```typescript
geo: {
  latitude: 13.0827,  // Update with actual coordinates
  longitude: 80.2707
},
```

**HOW TO GET YOUR COORDINATES:**
1. Go to Google Maps: https://maps.google.com
2. Search for your salon location
3. Right-click on the exact location
4. Click "What's here?"
5. Copy the coordinates (example: 13.0827, 80.2707)

**CHANGE TO:**
```typescript
geo: {
  latitude: 13.XXXX,  // Your latitude
  longitude: 80.XXXX  // Your longitude
},
```

---

**FIND THIS:**
```typescript
address: {
  street: 'Nolambur',
```

**CHANGE TO:**
```typescript
address: {
  street: '123, Your Street Name, Nolambur',  // Full address
```

---

### After Making Changes:
1. Save the file (Ctrl + S)
2. Run: `git add .`
3. Run: `git commit -m "Update business info"`
4. Run: `git push origin main`

---

## 🟡 STEP 3: Create OG Image (15 minutes)

### What: Create a social media preview image

### Size: 1200 pixels wide × 630 pixels tall

### Content:
- Your salon logo
- Text: "Premium Beauty Salon in Nolambur, Chennai"
- Beautiful background (pink/rose gold)

### How to Create:

**Option 1: Use Canva (Free & Easy)**
1. Go to: https://www.canva.com
2. Sign up/login (free)
3. Click "Create a design"
4. Type "Facebook Post" (it's 1200x630)
5. Add your logo
6. Add text: "Lakshana Beauty Salon - Premium Beauty in Nolambur"
7. Choose pink/rose gold colors
8. Download as JPG
9. Rename to: `og-image.jpg`
10. Save in: `public/og-image.jpg` folder

**Option 2: Use Photoshop**
1. Create new: 1200 x 630 px
2. Add logo + text + background
3. Save as `og-image.jpg`
4. Place in `public/` folder

### After Creating:
1. Put `og-image.jpg` in `public/` folder
2. Run: `git add .`
3. Run: `git commit -m "Add OG image"`
4. Run: `git push origin main`

---

## 🟢 STEP 4: Claim Google Business Profile (30 minutes)

### Why: This makes your salon appear on Google Maps and local search

### How:

**4.1: Go to Google Business**
```
https://business.google.com
```

**4.2: Click "Manage Now"**
- Login with your Google account

**4.3: Add Your Business**
- Business name: `Lakshana Beauty Salon`
- Category: `Beauty Salon`
- Do you want to add a location? **YES**
- Enter your full address

**4.4: Verify Your Business**
- Choose verification method (usually postcard)
- Google will mail you a code
- Enter the code when received

**4.5: Complete Your Profile**
- Add phone number
- Add website: `https://lakshana-salon.vercel.app`
- Add hours: Monday-Sunday, 9:00 AM - 8:00 PM
- Add description (use the one from homepage)

**4.6: Add Photos (IMPORTANT)**
Upload at least 20 photos:
- 5 exterior photos
- 10 interior photos
- 5 service photos (hair, makeup, etc.)
- Staff photos
- Before/after photos

**4.7: Add Services**
List all your services with prices:
- Hair Cutting: ₹500
- Hair Coloring: ₹2000
- Bridal Makeup: ₹8000
- Facial: ₹1000
(Add all services)

**4.8: Get Reviews**
- Ask happy customers to leave reviews
- Share your review link with customers

---

## 🔵 STEP 5: Google Search Console (15 minutes)

### Why: Track how people find you on Google

### How:

**5.1: Go to Search Console**
```
https://search.google.com/search-console
```

**5.2: Add Property**
- Click "Add Property"
- Choose "URL prefix"
- Enter: `https://lakshana-salon.vercel.app`
- Click Continue

**5.3: Verify Ownership**
- Choose "HTML tag" method
- Copy the code (looks like: `google-site-verification=XXXXXX`)

**5.4: Add to Website**
Open: `src/app/layout.tsx`

Find this line (around line 70):
```typescript
google: 'your-google-verification-code',
```

Replace with:
```typescript
google: 'THE_CODE_YOU_COPIED',
```

**5.5: Save and Deploy**
```bash
git add .
git commit -m "Add Google verification"
git push origin main
```

**5.6: Verify in Search Console**
- Wait 2 minutes for deployment
- Go back to Search Console
- Click "Verify"
- Should show "Ownership verified" ✅

**5.7: Submit Sitemap**
- In Search Console, go to "Sitemaps"
- Add new sitemap: `https://lakshana-salon.vercel.app/sitemap.xml`
- Click "Submit"

---

## 🎯 STEP 6: Wait & Monitor (Ongoing)

### What Happens Next:

**Week 1:**
- Google starts crawling your site
- Sitemap gets processed
- Business profile goes live

**Week 2-4:**
- Start appearing in search results
- Rich snippets show up
- Google Maps listing active

**Month 2-3:**
- Rank higher for keywords
- More organic traffic
- More customers finding you

### Track Progress:

**Google Search Console:**
- Check weekly
- See which keywords bring traffic
- Monitor clicks and impressions

**Google Business:**
- Check reviews
- Respond to reviews
- Post updates regularly

**Google Analytics (Optional):**
- Track website visitors
- See which pages are popular

---

## 📊 Quick Checklist

### Code Changes (You Do):
- [ ] Step 2: Update business info in `seo-config.ts`
- [ ] Step 3: Create and add `og-image.jpg`

### External Setup (You Do):
- [ ] Step 4: Claim Google Business Profile
- [ ] Step 4: Upload 20+ photos
- [ ] Step 4: Add all services
- [ ] Step 5: Set up Search Console
- [ ] Step 5: Add verification code
- [ ] Step 5: Submit sitemap

### Already Done (By Me):
- [✅] Enhanced SEO metadata
- [✅] Structured data
- [✅] Sitemap generation
- [✅] Robots.txt
- [✅] FAQ section added
- [✅] PWA manifest

---

## 🆘 Need Help?

### For Code Issues:
- Check `SEO_IMPLEMENTATION_GUIDE.md` (detailed guide)
- Check `SEO_SUMMARY.md` (quick reference)

### For Google Business:
- Google Business Help: https://support.google.com/business

### For Search Console:
- Search Console Help: https://support.google.com/webmasters

---

## 🎉 When Finished

After completing all steps:
1. Your salon will appear on Google Maps
2. People can find you by searching "beauty salon Nolambur"
3. Your website shows rich snippets (stars, hours, etc.)
4. Social media shares look professional
5. More customers will find and contact you

---

## ⏱️ Time Estimate

- Step 2 (Business info): **5 minutes**
- Step 3 (OG image): **15 minutes**
- Step 4 (Google Business): **30 minutes**
- Step 5 (Search Console): **15 minutes**

**Total: ~1 hour of work = Lifetime of better visibility! 🚀**

---

**Start with Step 2 now! Update your business info in `seo-config.ts`**
