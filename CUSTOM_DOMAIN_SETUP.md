# 🌐 CUSTOM DOMAIN SETUP GUIDE

## Current Status

**Current URLs**:
- Production: https://lakshana-salon.vercel.app
- Alias: https://lakshana-salon-8jb02shqg-sureshs-projects-1c6ee3cb.vercel.app

**Target Domains**:
- Admin Panel: lakshanaadmin.in
- Customer Website: lakshanasalon.in

---

## 🎯 SETUP CUSTOM DOMAINS

### Step 1: Add Domains in Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/sureshs-projects-1c6ee3cb/lakshana-salon)
2. Click on **Settings** tab
3. Click on **Domains** in sidebar
4. Add both domains:

#### Domain 1: lakshanasalon.in (Main Website)
```
Domain: lakshanasalon.in
Type: Production
Branch: main
```

#### Domain 2: lakshanaadmin.in (Admin Panel)
```
Domain: lakshanaadmin.in  
Type: Production
Branch: main
```

**Optional**: Also add www subdomains
- www.lakshanasalon.in → Redirect to lakshanasalon.in
- www.lakshanaadmin.in → Redirect to lakshanaadmin.in

---

### Step 2: Configure DNS Records

After adding domains in Vercel, you'll get DNS configuration instructions.

#### For lakshanasalon.in

**If using Vercel Nameservers** (Recommended):
```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**If using Custom DNS Provider**:
```
Type: A Record
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### For lakshanaadmin.in

**If using Vercel Nameservers** (Recommended):
```
Nameserver 1: ns1.vercel-dns.com
Nameserver 2: ns2.vercel-dns.com
```

**If using Custom DNS Provider**:
```
Type: A Record
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

### Step 3: Configure Routing (Optional)

Since you have two domains but one codebase, you can:

**Option A: Same Content on Both Domains** (Current Setup)
- Both domains show the same app
- Users access admin at lakshanasalon.in/admin
- Users access admin at lakshanaadmin.in/admin

**Option B: Redirect Admin Domain to /admin** (Recommended)
Add this to your `next.config.ts`:

```typescript
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/admin',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'lakshanaadmin.in',
          },
        ],
      },
      {
        source: '/',
        destination: '/admin',
        permanent: true,
        has: [
          {
            type: 'host',
            value: 'www.lakshanaadmin.in',
          },
        ],
      },
    ];
  },
};
```

This will:
- `lakshanasalon.in` → Shows customer website (homepage)
- `lakshanaadmin.in` → Auto redirects to admin panel (/admin)

**Option C: Hide Admin from Customer Domain**
Add middleware to prevent customer domain from accessing /admin

---

### Step 4: SSL Certificate (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt.
- No manual configuration needed
- Certificates auto-renew
- HTTPS enforced by default

---

## 📋 DNS PROVIDER INSTRUCTIONS

### If using Namecheap:
1. Login to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Click **Advanced DNS** tab
5. Add records as shown in Step 2

### If using GoDaddy:
1. Login to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Add records as shown in Step 2

### If using Cloudflare:
1. Login to Cloudflare
2. Select your domain
3. Go to **DNS** tab
4. Add records as shown in Step 2
5. **Important**: Set Proxy status to "DNS only" (grey cloud) initially

### If using Google Domains:
1. Login to Google Domains
2. Select your domain
3. Go to **DNS** section
4. Select **Custom name servers**
5. Add Vercel nameservers

---

## ⏱️ PROPAGATION TIME

**DNS propagation typically takes**:
- Minimum: 5-10 minutes
- Average: 1-2 hours
- Maximum: 48 hours (rare)

**Check propagation status**:
- https://dnschecker.org
- Enter your domain and check A record
- Should show: 76.76.21.21

---

## ✅ VERIFICATION CHECKLIST

After DNS propagation:

- [ ] Visit https://lakshanasalon.in (should load without errors)
- [ ] Visit https://lakshanaadmin.in (should load without errors)
- [ ] Check HTTPS is working (green padlock in browser)
- [ ] Test admin login at lakshanaadmin.in
- [ ] Test customer booking at lakshanasalon.in
- [ ] Check all pages load correctly
- [ ] Verify API endpoints work on custom domains
- [ ] Test Firebase authentication works
- [ ] Verify images and assets load

---

## 🔧 CONFIGURATION FILES TO UPDATE

### 1. Update Firebase Config (.env.production)
```env
# Add your custom domains
NEXT_PUBLIC_BASE_URL=https://lakshanasalon.in
NEXT_PUBLIC_ADMIN_URL=https://lakshanaadmin.in

# Existing Firebase config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
# ... rest of config
```

### 2. Update Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add both domains:
   - lakshanasalon.in
   - lakshanaadmin.in

### 3. Update Vercel Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update `NEXT_PUBLIC_BASE_URL`:
   ```
   Production: https://lakshanasalon.in
   ```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: Domain Not Resolving
**Symptoms**: "This site can't be reached" error

**Solutions**:
1. Verify DNS records are correct (check with `nslookup lakshanasalon.in`)
2. Wait for DNS propagation (can take up to 48 hours)
3. Clear browser cache and DNS cache:
   ```
   Windows: ipconfig /flushdns
   Mac: sudo dscacheutil -flushcache
   ```
4. Try incognito mode or different browser

### Issue 2: Certificate Error / Not Secure
**Symptoms**: "Your connection is not private" warning

**Solutions**:
1. Wait 10-15 minutes for Vercel to provision SSL
2. Check domain is verified in Vercel dashboard
3. If using Cloudflare, set SSL mode to "Full" not "Flexible"
4. Check if domain is using correct nameservers

### Issue 3: 404 on Custom Domain
**Symptoms**: Domain loads but shows 404 error

**Solutions**:
1. Verify domain is set to "Production" branch in Vercel
2. Check deployment succeeded on Vercel
3. Clear Vercel cache: Settings → Advanced → Clear Cache
4. Redeploy the application

### Issue 4: API Calls Failing
**Symptoms**: Admin features not working on custom domain

**Solutions**:
1. Update `NEXT_PUBLIC_BASE_URL` in Vercel environment variables
2. Add domain to Firebase authorized domains
3. Update CORS settings if using external APIs
4. Check browser console for specific errors
5. Redeploy after updating environment variables

### Issue 5: Firebase Auth Not Working
**Symptoms**: Can't login on custom domain

**Solutions**:
1. Add domain to Firebase Console → Authentication → Authorized domains
2. Update `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` if needed
3. Check Firebase API key is correct
4. Clear browser cookies and try again

---

## 📞 VERIFICATION COMMANDS

### Check DNS Resolution:
```bash
# Windows
nslookup lakshanasalon.in
nslookup lakshanaadmin.in

# Should return: 76.76.21.21
```

### Check SSL Certificate:
```bash
# Open in browser
https://lakshanasalon.in
https://lakshanaadmin.in

# Should show green padlock 🔒
```

### Test API Endpoints:
```bash
# Test from custom domain
https://lakshanasalon.in/api/admin/dashboard/stats
https://lakshanaadmin.in/api/admin/dashboard/stats

# Both should return same data
```

---

## 🎯 RECOMMENDED SETUP

### For Professional Setup:

1. **lakshanasalon.in** (Customer-facing):
   - Homepage with services
   - Online booking form
   - Gallery & reviews
   - Contact page
   - **Hide** /admin routes

2. **lakshanaadmin.in** (Staff-only):
   - Auto-redirect to /admin
   - Only admin panel accessible
   - Require authentication
   - **Hide** customer pages

### Implement Domain-Based Routing:

Create `middleware.ts` in project root:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  // Admin domain - only allow admin routes
  if (hostname.includes('lakshanaadmin.in')) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Customer domain - block admin routes (optional)
  if (hostname.includes('lakshanasalon.in')) {
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      // Optionally redirect to customer site or show 404
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 📊 EXPECTED BEHAVIOR AFTER SETUP

### Customer Domain (lakshanasalon.in):
```
lakshanasalon.in → Homepage
lakshanasalon.in/services → Services page
lakshanasalon.in/booking → Booking form
lakshanasalon.in/gallery → Photo gallery
lakshanasalon.in/contact → Contact page
lakshanasalon.in/admin → (Optional: Redirect to lakshanaadmin.in)
```

### Admin Domain (lakshanaadmin.in):
```
lakshanaadmin.in → Auto redirects to /admin
lakshanaadmin.in/admin → Admin dashboard
lakshanaadmin.in/admin/billing → Billing page
lakshanaadmin.in/admin/customers → Customers page
lakshanaadmin.in/admin/birthday-management → Birthday page
```

---

## 🔐 SECURITY RECOMMENDATIONS

1. **Use Environment Variables**: Never hardcode domains in code
2. **HTTPS Only**: Enforce HTTPS (Vercel does this by default)
3. **CORS Configuration**: Limit API access to your domains only
4. **Firebase Rules**: Restrict database access properly
5. **Authentication**: Require auth for all admin routes
6. **Rate Limiting**: Implement rate limiting on APIs
7. **Domain Verification**: Verify domain ownership in Firebase

---

## 📝 QUICK REFERENCE

### Current Setup:
- Deployment: ✅ Vercel
- SSL: ✅ Automatic (Let's Encrypt)
- CDN: ✅ Vercel Edge Network
- DNS: ⏳ Need to configure
- Domains: ⏳ Need to add

### Action Items:
1. Purchase/transfer domains (if not done)
2. Add domains in Vercel dashboard
3. Configure DNS records at domain registrar
4. Wait for DNS propagation
5. Update Firebase authorized domains
6. Test all functionality on custom domains
7. Update environment variables
8. Redeploy application

---

## 🆘 NEED HELP?

If you encounter issues:

1. **Check Vercel Dashboard**: Look for domain verification status
2. **Check DNS**: Use dnschecker.org to verify propagation
3. **Check Browser Console**: Look for specific error messages
4. **Check Vercel Logs**: Settings → Logs for server errors
5. **Test API**: Use Postman or browser DevTools

**Common Wait Times**:
- Domain verification: 1-5 minutes
- DNS propagation: 1-48 hours
- SSL certificate: 5-15 minutes

---

**Last Updated**: January 2025
**Status**: ⏳ Waiting for User to Configure DNS
**Next Step**: Add domains in Vercel Dashboard
