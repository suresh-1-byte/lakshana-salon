# 💰 Add-ons in Billing - Complete Guide

## What Changed

The billing page now supports **service add-ons** that can be added to any bill with a single click!

---

## 🎯 Features Added

### 1. **Visual Add-on Selector**
- Beautiful card-based interface
- Shows all active add-ons from your database
- Each card displays:
  - Add-on name
  - Description
  - Price
  - Selection state (checkmark when selected)

### 2. **Smart Total Calculation**
- Real-time calculation as you select/deselect
- Add-ons total shown separately in breakdown
- Final total includes: Services + Add-ons - Discount + Tax

### 3. **Selected Add-ons Summary**
- Shows all selected add-ons with prices
- Easy to review before creating bill
- Can toggle any add-on on/off

---

## 📸 UI Preview

```
┌─────────────────────────────────────────────────────┐
│  CREATE NEW BILL                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  CUSTOMER DETAILS                                   │
│  [Name] [Phone] [Email]                            │
│                                                     │
│  SERVICES / PRODUCTS                                │
│  [Service Selector] [Qty] [Price] [Discount]       │
│  + Add Row                                          │
│                                                     │
│  ✨ ADD-ONS                              ← NEW!     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Hair Spa │ │ Eyebrow  │ │ Manicure │           │
│  │ Steam    │ │ Shaping  │ │          │           │
│  │ ₹200     │✓│ ₹150     │ │ ₹300     │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  Selected: Eyebrow Shaping • ₹150                  │
│                                                     │
│  TOTAL BREAKDOWN                                    │
│  Subtotal:     ₹1,000                              │
│  Add-ons (1):  ₹150        ← NEW!                  │
│  Discount:     -₹100                               │
│  Tax:          ₹50                                 │
│  ───────────────────                               │
│  TOTAL:        ₹1,100                              │
│                                                     │
│  [Cancel]  [Create Bill]                           │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 How to Use

### Step 1: Go to Billing Page
```
Navigate to: /admin/billing
```

### Step 2: Click "Create New Bill"
- Green button at top right
- Opens the billing form modal

### Step 3: Fill Customer Details
```typescript
Customer Name: Priya Kumar
Phone: 9876543210
Email: priya@example.com (optional)
```

### Step 4: Add Services
Select from dropdown:
- Hair Cut
- Facial
- etc.

### Step 5: Select Add-ons
**NEW SECTION** below services:
- Click on any add-on card to select it
- Selected cards turn pink with a checkmark
- Click again to deselect

### Step 6: Review Total
Check the total breakdown:
- Subtotal (services only)
- **Add-ons total** (new line)
- Discount
- Tax
- **Final total**

### Step 7: Create Bill
- Click "Create Bill" button
- Add-ons are automatically included in bill items
- Invoice PDF will show all items including add-ons

---

## 🔧 Technical Details

### What Happens Behind the Scenes

1. **Loading Add-ons:**
```typescript
// On component mount
const data = await getAllAddons(true); // Only active add-ons
setAddons(data);
```

2. **When You Click an Add-on:**
```typescript
// Toggle selection
toggleAddon(addonId);
// Updates selectedAddons array
```

3. **Real-time Calculation:**
```typescript
// Calculate add-ons total
const addonsTotal = selectedAddons.reduce((sum, id) => {
  const addon = addons.find(a => a.id === id);
  return sum + (addon?.price || 0);
}, 0);

// Final total
const total = subtotal + addonsTotal - discount + tax;
```

4. **When Creating Bill:**
```typescript
// Convert selected add-ons to bill items
const addonItems = selectedAddons.map(id => {
  const addon = addons.find(a => a.id === id);
  return {
    name: addon.name,
    type: 'service',
    quantity: 1,
    unitPrice: addon.price,
    discount: 0,
    total: addon.price,
  };
});

// Merge with regular items
const allItems = [...serviceItems, ...addonItems];

// Send to API
POST /api/admin/billing { items: allItems }
```

---

## 📊 Add-ons in Invoice

The generated invoice will show add-ons just like regular items:

```
─────────────────────────────────────────────────
INVOICE #INV000123
─────────────────────────────────────────────────
Bill To: Priya Kumar
Phone: 9876543210

ITEMS:
Service/Product         Qty    Price    Total
─────────────────────────────────────────────────
Hair Cut                1      ₹400     ₹400
Facial                  1      ₹600     ₹600
Eyebrow Shaping (Add-on) 1     ₹150     ₹150  ← Add-on
Hair Spa Steam (Add-on)  1     ₹200     ₹200  ← Add-on
─────────────────────────────────────────────────
Subtotal:                              ₹1,350
Discount:                              -₹100
Tax:                                   ₹50
─────────────────────────────────────────────────
TOTAL:                                 ₹1,300
─────────────────────────────────────────────────
```

---

## 🎨 Styling Details

### Selected Add-on Card:
- Background: Pink gradient (`rgba(212,68,122,0.15)`)
- Border: Pink (`#D4447A`)
- Ring: Pink glow (`rgba(212,68,122,0.3)`)
- Checkmark: White circle with checkmark icon

### Unselected Add-on Card:
- Background: Subtle white (`white/[0.02]`)
- Border: Light border (`white/10`)
- Hover: Brighter border (`white/20`)

### Selected Add-ons Summary:
- Background: Pink tinted (`rgba(212,68,122,0.08)`)
- Border: Pink (`rgba(212,68,122,0.2)`)
- Pills: Pink background with name and price

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Open billing page
- [ ] Click "Create New Bill"
- [ ] See add-ons section
- [ ] Click an add-on card
- [ ] Card turns pink with checkmark
- [ ] Total updates immediately
- [ ] Selected add-ons show in summary
- [ ] Click add-on again to deselect
- [ ] Total decreases

### Multiple Add-ons
- [ ] Select 3+ add-ons
- [ ] All show in summary
- [ ] Total is correct
- [ ] Create bill
- [ ] Check invoice has all add-ons

### Edge Cases
- [ ] No add-ons selected - works normally
- [ ] All add-ons selected - calculates correctly
- [ ] Select/deselect rapidly - no bugs
- [ ] Add services + add-ons + discount - correct total

---

## 🐛 Troubleshooting

### Add-ons Not Showing?
**Check:**
1. Are there add-ons in `service_addons` table?
2. Are they marked as `status: 'active'`?
3. Check browser console for errors

**Solution:**
```typescript
// Check database
SELECT * FROM service_addons WHERE status = 'active';

// Or add some sample add-ons
INSERT INTO service_addons (name, description, price, status) VALUES
  ('Hair Spa Steam', 'Relaxing steam treatment', 200, 'active'),
  ('Eyebrow Shaping', 'Professional eyebrow threading', 150, 'active'),
  ('Nail Art', 'Creative nail designs', 300, 'active');
```

### Total Not Updating?
**Check:**
1. Open browser DevTools
2. Go to React DevTools (if installed)
3. Check `selectedAddons` state
4. Verify `addonsTotal` calculation

### Add-ons Not in Invoice?
**Check:**
1. Open Network tab in DevTools
2. See the POST request to `/api/admin/billing`
3. Check `items` array includes add-ons
4. Verify API response

---

## 💡 Pro Tips

### 1. Pre-select Popular Add-ons
You can modify the code to pre-select commonly used add-ons:

```typescript
// In BillingPage component
useEffect(() => {
  loadAddons();
  // Pre-select popular add-on
  setSelectedAddons(['addon-id-here']);
}, []);
```

### 2. Add-on Categories
Group add-ons by category in the UI:

```typescript
// Group by category
const categories = {
  hair: addons.filter(a => a.category === 'Hair'),
  skin: addons.filter(a => a.category === 'Skin'),
  nails: addons.filter(a => a.category === 'Nails'),
};
```

### 3. Bulk Discounts
Apply discount when multiple add-ons selected:

```typescript
// 10% off when 3+ add-ons
const addonDiscount = selectedAddons.length >= 3 
  ? addonsTotal * 0.1 
  : 0;
```

---

## 📈 Usage Analytics

Track which add-ons are popular:

```typescript
// In your analytics
await logActivity('addon_selected', {
  addonId: addon.id,
  addonName: addon.name,
  price: addon.price,
  billId: bill.id,
});

// Query most popular add-ons
const popular = await db
  .collection('activity_log')
  .where('action', '==', 'addon_selected')
  .orderBy('createdAt', 'desc')
  .limit(100)
  .get();
```

---

## 🎉 Benefits

### For Staff:
- ⚡ Faster billing (click vs typing)
- ✨ Visual selection (no mistakes)
- 💰 Easy upselling (see all options)
- 📊 Accurate totals (auto-calculated)

### For Business:
- 💵 Increased revenue (more add-ons sold)
- 📈 Better tracking (what's popular)
- 🎯 Upsell opportunities (suggest add-ons)
- 📊 Analytics (add-on performance)

### For Customers:
- 🧾 Clear invoices (itemized)
- 💳 Transparent pricing (see breakdown)
- 🎁 Special combos (package + add-ons)

---

## 🔮 Future Enhancements

1. **Add-on Bundles**
   - "Buy 3 add-ons, get 10% off"
   
2. **Recommended Add-ons**
   - "Customers who chose X also chose Y"
   
3. **Service-Specific Add-ons**
   - Show only relevant add-ons per service
   
4. **Add-on Images**
   - Visual previews of each add-on

---

## ✨ You're All Set!

The add-ons feature is fully integrated and ready to use. Your staff can now:
1. Select add-ons with a click
2. See real-time totals
3. Create bills faster
4. Upsell more effectively

**Enjoy the new feature!** 🎊
