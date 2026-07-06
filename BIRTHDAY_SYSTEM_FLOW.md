# 🎂 Birthday Notification System - Visual Flow

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BIRTHDAY NOTIFICATION SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐
│   Admin Panel   │      │   Database      │      │  WhatsApp    │
│                 │      │   (Supabase)    │      │  Cloud API   │
│  • Settings     │◄────►│                 │      │              │
│  • Reminders    │      │  • customers    │      │  • Send      │
│  • Customers    │      │  • messages     │      │  • Track     │
└─────────────────┘      └─────────────────┘      └──────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                         ┌────────▼────────┐
                         │   Cron Job      │
                         │  (Daily 9 AM)   │
                         └─────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. DOB Collection Flow

```
Customer Visit
      │
      ▼
Admin Opens Customer Profile
      │
      ▼
Fills Date of Birth Field
      │
      ▼
Saves to Database (Supabase)
      │
      ▼
DOB Stored in customers.date_of_birth
      │
      ▼
Statistics Updated in Birthday Settings
```

### 2. Automated Reminder Flow

```
Daily at 9:00 AM IST
      │
      ▼
Cron Job Triggers
      │
      ▼
Query Database for Birthdays in 7 Days
      │
      ├─── No Birthdays Found
      │         │
      │         ▼
      │    Log: "No upcoming birthdays"
      │         │
      │         ▼
      │    Exit
      │
      └─── Birthdays Found
            │
            ▼
      For Each Customer:
            │
            ├─── Get Customer Details
            │    (Name, Phone, WhatsApp)
            │
            ├─── Generate Personalized Message
            │    • Greeting with name
            │    • Birthday date
            │    • 20% discount offer
            │    • Validity: 2 weeks
            │    • Contact info
            │
            ├─── Send via WhatsApp Cloud API
            │    │
            │    ├─── Success
            │    │    │
            │    │    ▼
            │    │    Log: "✅ Sent to {name}"
            │    │    │
            │    │    ▼
            │    │    Save to whatsapp_messages
            │    │    (status: 'sent')
            │    │
            │    └─── Failure
            │         │
            │         ▼
            │         Log: "❌ Failed for {name}"
            │         │
            │         ▼
            │         Save to whatsapp_messages
            │         (status: 'failed', error_message)
            │
            ▼
      Return Summary Report
      {sent: 5, failed: 0, total: 5}
```

### 3. Manual Trigger Flow

```
Admin Opens Birthday Reminders Page
      │
      ▼
Views Upcoming Birthdays (Next 14 Days)
      │
      ├─── Birthdays in Next 7 Days: {count}
      │
      └─── Birthdays in 8-14 Days: {count}
      │
      ▼
Admin Clicks "Send Reminders" Button
      │
      ▼
API Call: /api/cron/birthday-reminders
      │
      ▼
(Same flow as Automated Reminder above)
      │
      ▼
Toast Notification: "Sent {X} reminders"
      │
      ▼
Page Refreshes with Updated Data
```

---

## 🗂️ Database Schema

```sql
┌──────────────────────────────────────────────────────┐
│                  customers table                      │
├──────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY                  │
│ customer_id         TEXT UNIQUE                       │
│ full_name           TEXT NOT NULL                     │
│ mobile_number       TEXT NOT NULL                     │
│ whatsapp_number     TEXT                              │
│ email               TEXT                              │
│ date_of_birth       DATE         ◄─── Birthday Field │
│ anniversary         DATE                              │
│ gender              TEXT                              │
│ address             TEXT                              │
│ city                TEXT                              │
│ total_visits        INTEGER                           │
│ total_spent         DECIMAL(10, 2)                    │
│ status              TEXT (active/inactive)            │
│ created_at          TIMESTAMP                         │
│ updated_at          TIMESTAMP                         │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│             whatsapp_messages table                   │
├──────────────────────────────────────────────────────┤
│ id                  UUID PRIMARY KEY                  │
│ customer_id         UUID REFERENCES customers(id)     │
│ customer_name       TEXT                              │
│ customer_phone      TEXT                              │
│ message_type        TEXT (birthday_reminder/etc)      │
│ content             TEXT                              │
│ delivery_status     TEXT (pending/sent/failed)        │
│ sent_at             TIMESTAMP                         │
│ error_message       TEXT                              │
│ created_at          TIMESTAMP                         │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 API Endpoints Map

```
┌─────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                         │
└─────────────────────────────────────────────────────────┘

PUBLIC APIS
├─ GET /api/birthdays/upcoming?days={N}
│  └─ Returns: List of customers with birthdays in next N days
│
└─ GET /api/birthdays/today
   └─ Returns: List of customers with birthday today

ADMIN APIS
├─ GET /api/admin/customers/dob-stats
│  └─ Returns: DOB collection statistics
│     • total: Total active customers
│     • withDOB: Customers with DOB
│     • withoutDOB: Customers missing DOB
│     • percentage: Collection rate
│     • customersWithoutDOB: List of customers to follow up
│
└─ POST /api/admin/birthdays/test-reminder
   └─ Sends test WhatsApp to admin phone
   └─ Returns: Success/failure status

CRON APIS (Protected)
└─ GET /api/cron/birthday-reminders
   └─ Authorization: Bearer {CRON_SECRET}
   └─ Runs daily at 9 AM via Vercel Cron
   └─ Returns: {sent: N, failed: N, results: [...]}

WHATSAPP APIS
└─ POST /api/whatsapp/send
   └─ Body: {customerId, name, phone, messageType, content}
   └─ Calls WhatsApp Cloud API
   └─ Returns: {success: true, messageId: "..."}
```

---

## 📱 Admin Panel Navigation

```
┌────────────────────────────────────────────────────────┐
│              ADMIN PANEL STRUCTURE                      │
└────────────────────────────────────────────────────────┘

/admin
 │
 ├─ /customers
 │   │
 │   ├─ List all customers
 │   ├─ Add new customer (with DOB field)
 │   └─ Edit customer (update DOB)
 │
 ├─ /birthday-settings  ◄─── NEW
 │   │
 │   ├─ DOB Collection Stats
 │   │   ├─ Total Customers
 │   │   ├─ With DOB
 │   │   ├─ Without DOB
 │   │   └─ Collection Percentage
 │   │
 │   ├─ System Status
 │   │   ├─ Cron Job Status
 │   │   ├─ WhatsApp Integration
 │   │   ├─ Reminder Timing
 │   │   └─ Birthday Offer Details
 │   │
 │   ├─ Test Reminder Button
 │   └─ Customers Missing DOB List
 │
 └─ /birthday-reminders  ◄─── ENHANCED
     │
     ├─ Upcoming Birthdays (Next 7 Days)
     │   └─ Will receive automatic reminder
     │
     ├─ Upcoming Birthdays (8-14 Days)
     │   └─ Coming up soon
     │
     └─ Manual Send Button
         └─ Trigger reminders immediately
```

---

## 🔐 Security Flow

```
┌──────────────────────────────────────┐
│          SECURITY LAYERS              │
└──────────────────────────────────────┘

External Request → Cron Endpoint
         │
         ▼
    Check Authorization Header
         │
         ├─── No Header / Invalid
         │         │
         │         ▼
         │    Return 401 Unauthorized
         │
         └─── Valid Bearer Token
               │
               ▼
          Compare with CRON_SECRET
               │
               ├─── Mismatch
               │      │
               │      ▼
               │  Return 401 Unauthorized
               │
               └─── Match
                     │
                     ▼
                 Execute Cron Job
                     │
                     ▼
                 Return Results
```

---

## 🎨 User Journey

### Admin User Journey

```
Day 1: Setup
├─ Configure WhatsApp API credentials
├─ Deploy to Vercel
└─ Test with "Send Test Reminder"

Week 1: Data Collection
├─ Open customer profiles during visits
├─ Add/update Date of Birth
├─ Monitor progress in Birthday Settings
└─ Aim for 80%+ collection rate

Week 2-4: Monitoring
├─ Check Birthday Settings daily
├─ Review upcoming birthdays
├─ Verify cron runs successfully
└─ Track message delivery

Ongoing: Maintenance
├─ Continue collecting DOB for new customers
├─ Review Birthday Settings weekly
├─ Manually trigger if needed
└─ Monitor redemption rates
```

### Customer Journey

```
7 Days Before Birthday
         │
         ▼
    Receives WhatsApp Message (9 AM)
         │
         ├─ "Hello {Name}!"
         ├─ "Your birthday is coming up!"
         ├─ "🎁 20% OFF as our gift"
         ├─ "Valid for 2 weeks"
         └─ "Book your appointment!"
         │
         ▼
    Customer Reads Message
         │
         ├─── Interested
         │      │
         │      ▼
         │  Calls/WhatsApp Reply
         │      │
         │      ▼
         │  Books Appointment
         │      │
         │      ▼
         │  Redeems 20% Discount
         │
         └─── Not Interested
                │
                ▼
           Reminder Still Valid
           (Can use within 2 weeks)
```

---

## 📊 Message Template Structure

```
┌────────────────────────────────────────────────────┐
│           BIRTHDAY MESSAGE TEMPLATE                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  🎂 *Special Birthday Reminder!* 🎂               │
│                                                     │
│  Hello {CUSTOMER_NAME}! 👋                         │
│                                                     │
│  Your special day is coming up on                  │
│  *{BIRTHDAY_DATE}* (in 7 days)! 🎉                │
│                                                     │
│  To celebrate, we're offering you a                │
│  *special 20% birthday discount* on any service!   │
│  🎁✨                                              │
│                                                     │
│  *Your Birthday Offer:*                            │
│  • 20% OFF on all services                         │
│  • Valid for 2 weeks                               │
│  • Book anytime before or after your birthday      │
│                                                     │
│  To book your special birthday appointment,        │
│  reply to this message or call us!                 │
│                                                     │
│  *Lakshana Premier Beauty Salon*                   │
│  📍 Nolambur, Chennai                              │
│  📞 +91 90000 00000                                │
│                                                     │
│  Let us make your birthday extra special! 💄💅    │
│                                                     │
└────────────────────────────────────────────────────┘

Variables Used:
├─ {CUSTOMER_NAME} → Customer's full name
└─ {BIRTHDAY_DATE} → Formatted birthday date
```

---

## 🔄 Monitoring & Logging Flow

```
Every Action
     │
     ▼
Logged to Console
     │
     ├─ Success: "✅ Sent to {name}"
     ├─ Warning: "⚠️ No birthdays found"
     └─ Error: "❌ Failed for {name}: {reason}"
     │
     ▼
Saved to Database
     │
     └─ whatsapp_messages table
         ├─ customer_id
         ├─ content
         ├─ delivery_status
         ├─ sent_at
         └─ error_message (if failed)
     │
     ▼
Viewable in Vercel Dashboard
     │
     └─ Deployments → Latest → View Logs
         ├─ Filter by "birthday"
         ├─ Check success/failure
         └─ Debug issues
     │
     ▼
Tracked in Admin Panel
     │
     └─ Birthday Settings
         ├─ DOB collection stats
         └─ System status
```

---

## 🎯 Success Metrics Dashboard

```
┌─────────────────────────────────────────────────┐
│          KEY PERFORMANCE INDICATORS              │
├─────────────────────────────────────────────────┤
│                                                  │
│  DOB Collection Rate                             │
│  ████████████████░░░░  80%                      │
│                                                  │
│  Message Delivery Success                        │
│  ███████████████████░  95%                      │
│                                                  │
│  Birthday Offer Redemption                       │
│  ██████░░░░░░░░░░░░░  30%                       │
│                                                  │
│  Customer Engagement                             │
│  ████████████░░░░░░░  60%                       │
│                                                  │
└─────────────────────────────────────────────────┘

Target Metrics (Month 1):
├─ DOB Collection: 80%+
├─ Message Delivery: 95%+
├─ Offer Redemption: 25%+
└─ Zero Missed Birthdays
```

---

## 🎊 Complete System Overview

```
                   BIRTHDAY NOTIFICATION SYSTEM
                   ============================

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   COLLECT   │  ───► │   AUTOMATE   │  ───► │    ENGAGE   │
│             │       │              │       │             │
│ • Customer  │       │ • Daily Cron │       │ • WhatsApp  │
│   DOB Field │       │   at 9 AM    │       │   Message   │
│             │       │              │       │             │
│ • Easy Form │       │ • 7 Days     │       │ • 20% Off   │
│             │       │   Before     │       │   Offer     │
│             │       │              │       │             │
│ • Track in  │       │ • Automatic  │       │ • 2 Weeks   │
│   Settings  │       │   Detection  │       │   Validity  │
└─────────────┘       └──────────────┘       └─────────────┘

        │                     │                       │
        │                     │                       │
        ▼                     ▼                       ▼

┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│  DATABASE   │       │    CRON      │       │  WHATSAPP   │
│  (Supabase) │       │  (Vercel)    │       │  (Cloud)    │
│             │       │              │       │             │
│ • Store DOB │       │ • Schedule   │       │ • Send      │
│ • Track     │       │ • Execute    │       │ • Deliver   │
│   Messages  │       │ • Log        │       │ • Track     │
└─────────────┘       └──────────────┘       └─────────────┘

                ┌──────────────────────┐
                │   ADMIN MONITOR      │
                │                      │
                │ • View Statistics    │
                │ • Check Upcoming     │
                │ • Manual Trigger     │
                │ • Test System        │
                └──────────────────────┘
```

---

**End of Visual Flow Documentation**

For setup instructions, see: `BIRTHDAY_SYSTEM_SETUP_CHECKLIST.md`  
For complete documentation, see: `BIRTHDAY_NOTIFICATION_SYSTEM.md`  
For implementation summary, see: `BIRTHDAY_SYSTEM_COMPLETE.md`
