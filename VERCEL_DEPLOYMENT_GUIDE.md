# Vercel Deployment Guide - Lakshana Salon CRM

## Complete Step-by-Step Deployment Instructions

---

## 🚀 Quick Deployment (3 Methods)

### Method 1: Automatic Deployment (Recommended)
```bash
# From project directory
vercel
```

### Method 2: Production Deployment
```bash
vercel --prod
```

### Method 3: Via Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your Git repository
4. Configure and deploy

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Before You Deploy:

1. **Firebase Setup Complete**
   - [ ] Firebase project created
   - [ ] Firestore database initialized
   - [ ] Firebase Admin SDK service account created
   - [ ] All Firebase credentials available

2. **Environment Variables Ready**
   - [ ] Firebase client credentials (6 variables)
   - [ ] Firebase admin credentials (3 variables)
   - [ ] Admin JWT secret generated
   - [ ] Optional: WhatsApp, Email, etc.

3. **Code Ready**
   - [x] Build errors fixed ✅
   - [x] TypeScript errors resolved ✅
   - [x] Dependencies installed ✅
   - [x] Git repository initialized ✅

---

## 🔧 STEP 1: Prepare Environment Variables

### Get Your Firebase Credentials:

#### A. Firebase Client Credentials (Public)
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Copy these values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

#### B. Firebase Admin Credentials (Secret)
1. In Firebase Console, go to Project Settings
2. Go to "Service Accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract these values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the \n characters!)

#### C. Generate Admin JWT Secret
```bash
# Windows PowerShell
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString()))
```

Or use online generator: https://generate-secret.vercel.app/32

---

## 🚀 STEP 2: Deploy to Vercel

### Option A: CLI Deployment (Faster)

#### 1. Login to Vercel:
```bash
vercel login
```

#### 2. Deploy:
```bash
cd d:\Lakshana-salon\lakshana-salon-main
vercel
```

#### 3. Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time)
- Project name? **lakshana-salon** (or your choice)
- Directory? **./** (press Enter)
- Override settings? **No** (press Enter)

#### 4. Wait for deployment:
- Vercel will upload files
- Build your project
- Deploy to production
- Give you a URL

#### 5. Add Environment Variables:
```bash
# Method 1: Via CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Method 2: Via Dashboard (Recommended)
# Go to your project on Vercel → Settings → Environment Variables
```

#### 6. Redeploy with environment variables:
```bash
vercel --prod
```

---

### Option B: GitHub + Vercel (Best for Continuous Deployment)

#### 1. Push to GitHub:
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit - Lakshana Salon CRM"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/lakshana-salon.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Vercel:
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repository
4. Click "Import"

#### 3. Configure Project:
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** ./
- **Build Command:** `npm run build` (auto-filled)
- **Output Directory:** `.next` (auto-filled)

#### 4. Add Environment Variables:
Click "Environment Variables" and add all variables from `.env.example`:

**Required Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_value
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_value
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_value
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_value
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_value
NEXT_PUBLIC_FIREBASE_APP_ID=your_value
FIREBASE_PROJECT_ID=your_value
FIREBASE_CLIENT_EMAIL=your_value
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_JWT_SECRET=your_32_character_secret
```

**Optional Variables:**
```
WHATSAPP_API_URL=your_value
WHATSAPP_API_TOKEN=your_value
RESEND_API_KEY=your_value
```

#### 5. Deploy:
Click "Deploy" button

---

## 🔐 STEP 3: Configure Environment Variables on Vercel

### Via Vercel Dashboard:

1. Go to your project: https://vercel.com/YOUR_USERNAME/lakshana-salon
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable:

**For each variable:**
- **Key:** Variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
- **Value:** Your actual value
- **Environment:** Select "Production", "Preview", and "Development"
- Click "Save"

### Important Notes:
- **FIREBASE_PRIVATE_KEY:** Must include `\n` characters and quotes
  ```
  "-----BEGIN PRIVATE KEY-----\nYour_Key_Content_Here\n-----END PRIVATE KEY-----\n"
  ```
- **ADMIN_JWT_SECRET:** Must be at least 32 characters
- **All variables:** Make sure no trailing spaces

---

## ✅ STEP 4: Verify Deployment

### 1. Check Build Logs:
- Go to your project on Vercel
- Click on the deployment
- Check "Building" tab for any errors

### 2. Test Your Site:
Your site will be available at: `https://lakshana-salon-xxxx.vercel.app`

**Test these URLs:**
- ✅ Home: `https://your-site.vercel.app`
- ✅ Admin Login: `https://your-site.vercel.app/admin/login`
- ✅ Review Page: `https://your-site.vercel.app/review`

### 3. Test Admin Panel:
1. Go to `/admin/login`
2. Login with your admin credentials
3. Verify dashboard loads
4. Test a few features

---

## 🌐 STEP 5: Add Custom Domain (Optional)

### 1. Go to Project Settings:
- Your Project → Settings → Domains

### 2. Add Your Domain:
- Enter your domain: `www.lakshanasalon.com`
- Click "Add"

### 3. Configure DNS:
Vercel will show you DNS records to add:
- Type: `A` or `CNAME`
- Name: `@` or `www`
- Value: Vercel's IP or CNAME

### 4. Wait for DNS Propagation:
- Usually takes 5-60 minutes
- Vercel will automatically issue SSL certificate

---

## 🔧 STEP 6: Configure Firebase for Production

### 1. Update Firebase Security Rules:

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to public reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if false; // Only via admin API
    }
    
    // Everything else requires authentication
    match /{document=**} {
      allow read, write: if false; // Only via Admin SDK
    }
  }
}
```

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false; // Only via Admin SDK
    }
  }
}
```

### 2. Add Vercel Domain to Firebase:
1. Firebase Console → Authentication
2. Sign-in method → Authorized domains
3. Add your Vercel domain: `your-site.vercel.app`
4. Add your custom domain if you have one

### 3. Enable Required Firebase Services:
- ✅ Firestore Database
- ✅ Firebase Storage (if using image upload)
- ✅ Cloud Messaging (for notifications)
- ✅ Authentication (for admin)

---

## 📊 STEP 7: Post-Deployment Checklist

### ✅ Test Everything:

- [ ] **Homepage loads** - No errors
- [ ] **Admin login works** - Can access `/admin/login`
- [ ] **Dashboard displays** - Stats and charts show
- [ ] **Customer CRUD** - Can add/edit/delete customers
- [ ] **Booking system** - Can create bookings
- [ ] **Billing works** - Can generate invoices
- [ ] **Services display** - Service catalog loads
- [ ] **Birthday system** - Birthday widget shows
- [ ] **WhatsApp integration** - Messages can be sent
- [ ] **Reports generate** - Can create and export reports
- [ ] **Mobile responsive** - Works on mobile devices
- [ ] **No console errors** - Check browser console

### ✅ Security Checks:

- [ ] **Admin routes protected** - Redirects to login
- [ ] **API endpoints secured** - Returns 401 without auth
- [ ] **Environment variables** - All set correctly
- [ ] **Firebase rules** - Configured properly
- [ ] **HTTPS enabled** - SSL certificate active
- [ ] **Strong JWT secret** - At least 32 characters

### ✅ Performance Checks:

- [ ] **Fast load times** - < 3 seconds
- [ ] **Images optimized** - Using Next.js Image
- [ ] **API responses fast** - < 1 second
- [ ] **No memory leaks** - Stable performance

---

## 🚨 TROUBLESHOOTING

### Build Errors:

#### Error: "Module not found"
```bash
# Solution: Install missing dependencies
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### Error: "Environment variable not set"
- Check Vercel dashboard → Settings → Environment Variables
- Make sure all required variables are added
- Redeploy after adding variables

#### Error: "Firebase Admin SDK initialization failed"
- Check `FIREBASE_PRIVATE_KEY` format
- Must include `\n` characters
- Must be wrapped in quotes
- Check `FIREBASE_CLIENT_EMAIL` is correct

### Runtime Errors:

#### "Unauthorized" on admin panel
- Check `ADMIN_JWT_SECRET` is set
- Try clearing cookies and logging in again
- Verify JWT secret is the same everywhere

#### Firebase connection errors
- Verify all Firebase credentials are correct
- Check Firebase project is active
- Ensure Firestore database is created
- Check Firebase billing is enabled (Blaze plan for admin SDK)

#### Images not loading
- Check Cloudinary credentials (if using)
- Verify image URLs are correct
- Check Next.js image configuration

### Performance Issues:

#### Slow load times
- Enable caching in Vercel
- Optimize images
- Check Firebase query performance
- Consider adding Redis cache

#### API timeouts
- Increase Vercel function timeout (Pro plan)
- Optimize database queries
- Add pagination to large datasets

---

## 📈 MONITORING & MAINTENANCE

### 1. Set Up Monitoring:

#### Vercel Analytics:
- Enable in Project Settings → Analytics
- Track page views and performance

#### Firebase Monitoring:
- Firebase Console → Performance
- Monitor API response times
- Track error rates

### 2. Regular Maintenance:

#### Weekly:
- Check error logs on Vercel
- Monitor Firebase usage
- Review activity logs

#### Monthly:
- Update dependencies: `npm update`
- Review and rotate JWT secrets
- Backup Firestore data
- Check SSL certificate status

### 3. Set Up Alerts:

#### Vercel:
- Settings → Integrations
- Add Slack/Discord for deployment notifications

#### Firebase:
- Set budget alerts
- Configure quota alerts

---

## 🔄 CONTINUOUS DEPLOYMENT

### Auto-Deploy on Git Push:

With GitHub connected to Vercel:
1. Make code changes locally
2. Commit: `git commit -m "Your changes"`
3. Push: `git push`
4. Vercel automatically deploys!

### Branch Deployments:

- **main branch** → Production (your-site.vercel.app)
- **dev branch** → Preview (your-site-git-dev.vercel.app)
- **Pull requests** → Preview URLs automatically

---

## 💰 VERCEL PRICING

### Hobby Plan (FREE):
- ✅ Perfect for this project
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Edge Network
- ⚠️ Limited to 100 serverless function executions per day per project

### Pro Plan ($20/month):
- Everything in Hobby
- Unlimited serverless functions
- Advanced analytics
- Team collaboration
- Custom error pages

**Recommendation:** Start with Hobby plan, upgrade if needed.

---

## 📞 SUPPORT

### Need Help?

1. **Vercel Documentation:** https://vercel.com/docs
2. **Firebase Documentation:** https://firebase.google.com/docs
3. **Next.js Documentation:** https://nextjs.org/docs
4. **Vercel Support:** support@vercel.com (Pro plan only)

### Common Resources:

- **Vercel Discord:** https://vercel.com/discord
- **GitHub Issues:** Create issues in your repo
- **Stack Overflow:** Tag: vercel, nextjs, firebase

---

## ✅ DEPLOYMENT CHECKLIST

### Before Clicking Deploy:

- [ ] All environment variables prepared
- [ ] Firebase project configured
- [ ] Firebase Admin SDK credentials ready
- [ ] JWT secret generated
- [ ] Git repository ready (for GitHub method)
- [ ] Custom domain ready (optional)

### After Deployment:

- [ ] Build succeeded
- [ ] Site is accessible
- [ ] Admin login works
- [ ] Dashboard loads
- [ ] Features tested
- [ ] Mobile responsive checked
- [ ] No console errors
- [ ] Firebase integration working
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)

---

## 🎉 YOU'RE READY TO DEPLOY!

### Quick Start:

```bash
# 1. Login to Vercel
vercel login

# 2. Deploy
cd d:\Lakshana-salon\lakshana-salon-main
vercel

# 3. Add environment variables via Vercel Dashboard
# 4. Redeploy with: vercel --prod

# 5. Test your site!
```

---

**Your Lakshana Salon CRM will be live in minutes!** 🚀

Good luck with your deployment! 🎊

