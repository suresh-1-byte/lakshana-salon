# Lakshana Beauty Salon — Admin Panel Setup Guide

## 🌸 Overview

The admin panel lives at `/admin` and is protected by JWT authentication.
Default credentials (set in `.env.local`):
- **Email:** `admin@lakshanasalon.com`
- **Password:** `Admin@123`

Change these immediately in production.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:9002

# Open admin panel
# → http://localhost:9002/admin
```

---

## ⚙️ Environment Variables

Copy `.env.local` and fill in your real values:

```env
# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=

# Firebase Admin SDK (server, from service account JSON)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Admin credentials
ADMIN_EMAIL=admin@lakshanasalon.com
ADMIN_PASSWORD=YourStrongPassword123!

# JWT secret — use a long random string in production
JWT_SECRET=change-this-to-a-long-random-string

# Resend (email notifications) — get from resend.com
RESEND_API_KEY=re_xxxxxxxxxxxx

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Google Gemini AI
GEMINI_API_KEY=
```

---

## 📋 Firestore Collections

The following Firestore collections are created automatically on first use:

| Collection     | Purpose                              |
|----------------|--------------------------------------|
| `bookings`     | Customer appointment requests        |
| `customers`    | Customer profiles (auto-upserted)    |
| `billing`      | Bills and invoices                   |
| `gallery`      | Website gallery images               |
| `services`     | Service menu items                   |
| `reviews`      | Customer testimonials/reviews        |
| `notifications`| Sent notifications log               |
| `coupons`      | Discount coupon codes                |
| `settings`     | Salon configuration                  |
| `activity_log` | Admin action audit trail             |
| `fcm_tokens`   | Browser push notification tokens     |

---

## 🏗️ Firestore Index Requirements

Create composite indexes in Firebase Console → Firestore → Indexes:

```
Collection: bookings
  Fields: createdAt (Descending)

Collection: customers
  Fields: phone (Ascending), createdAt (Descending)

Collection: billing
  Fields: customerPhone (Ascending), createdAt (Descending)

Collection: coupons
  Fields: code (Ascending), isActive (Ascending)
```

---

## 📱 Push Notifications Setup

1. Go to Firebase Console → Project Settings → Cloud Messaging
2. Generate a VAPID key pair
3. Copy the public key to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
4. The service worker at `/public/firebase-messaging-sw.js` handles background push

---

## 📧 Resend Email Setup

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add it to `RESEND_API_KEY` in `.env.local`
4. Or set it in Admin Panel → Settings → Integrations
5. Verify your domain for production sends

---

## 🤖 Telegram Bot Setup

1. Message `@BotFather` on Telegram
2. Send `/newbot` and follow instructions
3. Copy the bot token to `TELEGRAM_BOT_TOKEN`
4. Add the bot to your group/channel
5. Get the chat ID from `@userinfobot`
6. Copy to `TELEGRAM_CHAT_ID`
7. Test in Admin Panel → Settings → Integrations → Test button

---

## 🔐 Security Checklist (Production)

- [ ] Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` from defaults
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Enable Firestore Security Rules
- [ ] Add your domain to Firebase Auth authorized domains
- [ ] Set `NEXT_PUBLIC_*` vars to production Firebase project
- [ ] Enable HTTPS (handled by hosting platform)
- [ ] Review and restrict Firestore rules for `fcm_tokens` collection

---

## 📐 Admin Panel Routes

| URL                       | Page                  |
|---------------------------|-----------------------|
| `/admin`                  | Dashboard             |
| `/admin/login`            | Login                 |
| `/admin/bookings`         | Bookings list         |
| `/admin/bookings/calendar`| Calendar view         |
| `/admin/customers`        | Customer management   |
| `/admin/billing`          | Billing & invoices    |
| `/admin/services`         | Service menu CRUD     |
| `/admin/gallery`          | Gallery management    |
| `/admin/reviews`          | Review moderation     |
| `/admin/notifications`    | Push/email/Telegram   |
| `/admin/coupons`          | Coupon codes          |
| `/admin/reports`          | Analytics & exports   |
| `/admin/activity`         | Audit log             |
| `/admin/settings`         | Configuration         |

---

## 🔌 API Endpoints

### Public
| Method | URL                          | Purpose                    |
|--------|------------------------------|----------------------------|
| POST   | `/api/bookings`              | Create appointment request |
| GET    | `/api/bookings`              | List bookings (admin)      |
| PATCH  | `/api/bookings/[id]`         | Update booking status      |
| DELETE | `/api/bookings/[id]`         | Delete booking             |
| POST   | `/api/fcm-token`             | Register push token        |
| POST   | `/api/notify`                | Send push broadcast        |

### Admin (JWT protected)
| Method | URL                              | Purpose                  |
|--------|----------------------------------|--------------------------|
| POST   | `/api/admin/auth/login`          | Admin login              |
| POST   | `/api/admin/auth/logout`         | Admin logout             |
| POST   | `/api/admin/auth/change-password`| Change password          |
| GET    | `/api/admin/dashboard`           | Dashboard stats          |
| GET    | `/api/admin/customers`           | List customers           |
| POST   | `/api/admin/customers`           | Create customer          |
| GET    | `/api/admin/customers/[id]`      | Customer detail+history  |
| PATCH  | `/api/admin/customers/[id]`      | Update customer          |
| DELETE | `/api/admin/customers/[id]`      | Delete customer          |
| GET    | `/api/admin/billing`             | List bills               |
| POST   | `/api/admin/billing`             | Create bill + email      |
| GET    | `/api/admin/billing/[id]`        | Get bill detail          |
| PATCH  | `/api/admin/billing/[id]`        | Update bill status       |
| GET    | `/api/admin/gallery`             | List gallery images      |
| POST   | `/api/admin/gallery`             | Add image                |
| PATCH  | `/api/admin/gallery/[id]`        | Edit image               |
| DELETE | `/api/admin/gallery/[id]`        | Delete image             |
| GET    | `/api/admin/services`            | List services            |
| POST   | `/api/admin/services`            | Create service           |
| PATCH  | `/api/admin/services/[id]`       | Update service           |
| DELETE | `/api/admin/services/[id]`       | Delete service           |
| GET    | `/api/admin/reviews`             | List reviews             |
| POST   | `/api/admin/reviews`             | Add review manually      |
| PATCH  | `/api/admin/reviews/[id]`        | Approve/reject/feature   |
| DELETE | `/api/admin/reviews/[id]`        | Delete review            |
| GET    | `/api/admin/notifications`       | List notifications       |
| POST   | `/api/admin/notifications`       | Send notification        |
| GET    | `/api/admin/coupons`             | List coupons             |
| POST   | `/api/admin/coupons`             | Create coupon            |
| PATCH  | `/api/admin/coupons/[id]`        | Update coupon            |
| DELETE | `/api/admin/coupons/[id]`        | Delete coupon            |
| POST   | `/api/admin/coupons/validate`    | Validate coupon code     |
| GET    | `/api/admin/settings`            | Get settings             |
| PATCH  | `/api/admin/settings`            | Update settings          |
| GET    | `/api/admin/reports`             | JSON report data         |
| GET    | `/api/admin/export`              | Excel file download      |
| GET    | `/api/admin/activity`            | Activity log             |
| GET    | `/api/admin/bookings`            | Admin bookings list      |
| PATCH  | `/api/admin/bookings/[id]`       | Schedule/update booking  |
| DELETE | `/api/admin/bookings/[id]`       | Delete booking           |

---

## 🎨 Design System

The admin panel uses the same luxury design language as the frontend:

- **Primary:** `#D4447A` (rose pink)
- **Dark BG:** `#0F0B16` / `#130D1E`
- **Accent:** `#E8A0B4`
- **Fonts:** Cormorant Garamond (headings) + Raleway (body)
- **Cards:** Glass morphism with `rgba(255,255,255,0.02)` background

---

## 📦 Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | Next.js 15 (App Router)                 |
| Language      | TypeScript 5                            |
| Database      | Firebase Firestore                      |
| Auth          | JWT via `jose` library                  |
| Push Notifs   | Firebase Cloud Messaging (FCM)          |
| Email         | Resend API                              |
| Telegram      | Telegram Bot API                        |
| Excel Export  | `xlsx` (SheetJS)                        |
| Charts        | Recharts                                |
| Animations    | Framer Motion                           |
| Styling       | Tailwind CSS + shadcn/ui                |
| AI            | Google Genkit + Gemini 2.5 Flash        |

---

## 🚢 Deployment

### Firebase App Hosting (recommended)
```bash
# Already configured via apphosting.yaml
firebase deploy
```

### Vercel
```bash
vercel --prod
```

Set all environment variables in your hosting dashboard.

---

*Built for Lakshana Premier Beauty Salon, Nolambur, Chennai.*
