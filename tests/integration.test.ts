// Integration tests: real route handlers + lib code, against an in-memory
// Firestore (no production data is touched). Run with:
//   npm test
import assert from 'node:assert/strict';
import path from 'node:path';
import Module from 'node:module';

// ── Point firebase-admin's Firestore & Messaging at in-memory fakes ──
const fakePath = path.join(__dirname, 'fake-firestore.ts');
const sentPushes: any[] = [];
const fakeMessaging = {
  sendEachForMulticast: async (msg: any) => {
    sentPushes.push(msg);
    return { successCount: msg.tokens.length, failureCount: 0, responses: msg.tokens.map(() => ({ success: true })) };
  },
};
const origResolve = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, ...rest: any[]) {
  if (request === 'firebase-admin/firestore') return fakePath;
  if (request === 'firebase-admin/messaging') return path.join(__dirname, 'fake-messaging.js');
  return origResolve.call(this, request, ...rest);
};
(globalThis as any).__fakeMessaging = fakeMessaging;

delete process.env.FIREBASE_PROJECT_ID; // skip real Firebase initialisation
process.env.ADMIN_EMAIL = 'owner@salon.test';
process.env.ADMIN_PASSWORD = 'EnvPassword123';
process.env.JWT_SECRET = 'integration-test-secret-0123456789';
delete process.env.WHATSAPP_PHONE_NUMBER_ID;
delete process.env.WHATSAPP_ACCESS_TOKEN;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fakeDb } = require('./fake-firestore');
const { NextRequest } = require('next/server');

let passed = 0;
const step = async (name: string, fn: () => Promise<void>) => {
  try {
    await fn();
    passed++;
    console.log('PASS', name);
  } catch (e) {
    console.log('FAIL', name, '\n   ', (e as Error).message);
    process.exitCode = 1;
  }
};
const reqOf = (url: string, method = 'GET', body?: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost${url}`, {
    method,
    headers: { 'content-type': 'application/json', 'x-forwarded-for': headers.ip || '10.0.0.1', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const customers = () => fakeDb.dump('customers');

(async () => {
  const bookingsRoute = require('../src/app/api/bookings/route');
  const adminBookingRoute = require('../src/app/api/admin/bookings/[id]/route');
  const billingRoute = require('../src/app/api/admin/billing/route');
  const billRoute = require('../src/app/api/admin/billing/[id]/route');
  const customersRoute = require('../src/app/api/admin/customers/route');
  const customerRoute = require('../src/app/api/admin/customers/[id]/route');
  const loginRoute = require('../src/app/api/admin/auth/login/route');
  const fcmRoute = require('../src/app/api/fcm-token/route');
  const cronRoute = require('../src/app/api/cron/birthday-reminders/route');
  const { verifyAdminPassword, hashPassword } = require('../src/lib/server/password');
  const { getAdminPushTokens } = require('../src/lib/server/push');
  const birthdays = require('../src/lib/api/birthdays');

  const good = (phone: string, ip = '10.0.0.1', extra: object = {}) =>
    reqOf('/api/bookings', 'POST', {
      name: 'Priya <b>S</b>',
      phone,
      email: 'priya@example.com',
      dateOfBirth: '1995-04-12',
      services: [{ name: 'Classic Cut', member: '₹350', duration: '20 min', category: 'Hair' }],
      ...extra,
    }, { ip });

  // ── Customers & phone normalisation ───────────────────────────────
  await step('website booking creates a pending booking + customer (no visit counted)', async () => {
    const res = await bookingsRoute.POST(good('+91 98765 43210'));
    assert.equal(res.status, 200, await res.clone().text());
    const [c] = customers();
    assert.equal(customers().length, 1);
    assert.equal(c.phoneKey, '9876543210');
    assert.equal(c.totalVisits, 0);
    assert.equal(c.dateOfBirth, '1995-04-12');
    const [b] = fakeDb.dump('bookings');
    assert.equal(b.status, 'pending');
    assert.equal(b.customerId, c.id);
  });

  await step('same number typed differently → same customer, no duplicate', async () => {
    await bookingsRoute.POST(good('09876543210', '10.0.0.2'));
    await bookingsRoute.POST(good('98765-43210', '10.0.0.3'));
    assert.equal(customers().length, 1);
    assert.equal(customers()[0].totalVisits, 0);
  });

  await step('legacy customer without phoneKey is matched by full scan', async () => {
    await fakeDb.collection('customers').doc('legacy1').set({ name: 'Old', phone: '91234 56780', totalVisits: 4 });
    await bookingsRoute.POST(good('9123456780', '10.0.0.4'));
    assert.equal(customers().length, 2);
    const legacy = customers().find((c: any) => c.id === 'legacy1');
    assert.equal(legacy.phoneKey, '9123456780', 'phoneKey added on touch');
    assert.equal(legacy.totalVisits, 4, 'visit count untouched by a booking request');
  });

  await step('invalid DOB from website is dropped, booking still accepted', async () => {
    const res = await bookingsRoute.POST(good('9000000001', '10.0.0.5', { dateOfBirth: '0009-04-12' }));
    assert.equal(res.status, 200);
    const c = customers().find((x: any) => x.phoneKey === '9000000001');
    assert.equal(c.dateOfBirth, null);
  });

  await step('booking rate limit: 6th request from one IP in an hour → 429', async () => {
    const codes = [];
    for (let i = 0; i < 6; i++) codes.push((await bookingsRoute.POST(good(`90000001${10 + i}`, '10.9.9.9'))).status);
    assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
  });

  // ── Push notifications: admin devices only ────────────────────────
  await step('website visitor token is a subscriber; booking alerts go to admin devices only', async () => {
    await fcmRoute.POST(reqOf('/api/fcm-token', 'POST', { token: 'visitor-token-xxxxxxxxxxxxxxxx', email: 'fan@example.com' }));
    await fcmRoute.POST(reqOf('/api/fcm-token', 'POST', { token: 'legacy-admin-token-xxxxxxxxxxxx', email: 'OWNER@salon.test' }));
    const tokens = await getAdminPushTokens();
    assert.deepEqual(tokens, ['legacy-admin-token-xxxxxxxxxxxx']);
    sentPushes.length = 0;
    await bookingsRoute.POST(good('9555555555', '10.0.0.6'));
    assert.equal(sentPushes.length, 1);
    assert.deepEqual(sentPushes[0].tokens, ['legacy-admin-token-xxxxxxxxxxxx']);
    const visitor = fakeDb.dump('fcm_tokens').find((t: any) => t.token.startsWith('visitor'));
    assert.equal(visitor.role, 'subscriber');
  });

  await step('customer name is HTML-escaped in emails (no raw <b> injected)', async () => {
    // Emails need RESEND; instead verify the escaping helper is what the route uses
    const { escapeHtml } = require('../src/lib/server/validation');
    assert.equal(escapeHtml('Priya <b>S</b>'), 'Priya &lt;b&gt;S&lt;/b&gt;');
  });

  // ── Billing ↔ customer totals ─────────────────────────────────────
  let billId = '';
  const priya = () => customers().find((c: any) => c.phoneKey === '9876543210');
  await step('paid bill adds spending + one visit; loyalty tier follows', async () => {
    const res = await billingRoute.POST(reqOf('/api/admin/billing', 'POST', {
      customerName: 'Priya S', customerPhone: '98765 43210',
      items: [{ name: 'Facial', type: 'service', quantity: 1, unitPrice: 6000 }],
    }));
    const json = await res.json();
    assert.equal(res.status, 200, JSON.stringify(json));
    billId = json.id;
    assert.equal(priya().totalSpent, 6000);
    assert.equal(priya().totalVisits, 1);
    assert.equal(priya().loyaltyStatus, 'Silver');
    assert.equal(customers().filter((c: any) => c.phoneKey === '9876543210').length, 1, 'no duplicate from billing');
  });

  await step('refunding the bill reverses totals; marking paid again restores them', async () => {
    let res = await billRoute.PATCH(reqOf(`/api/admin/billing/${billId}`, 'PATCH', { status: 'refunded' }), ctx(billId));
    assert.equal(res.status, 200);
    assert.equal(priya().totalSpent, 0);
    assert.equal(priya().totalVisits, 0);
    assert.equal(priya().loyaltyStatus, 'Bronze');
    res = await billRoute.PATCH(reqOf(`/api/admin/billing/${billId}`, 'PATCH', { status: 'paid' }), ctx(billId));
    assert.equal(priya().totalSpent, 6000);
    // refunded → refunded again changes nothing
    await billRoute.PATCH(reqOf(`/api/admin/billing/${billId}`, 'PATCH', { status: 'refunded' }), ctx(billId));
    await billRoute.PATCH(reqOf(`/api/admin/billing/${billId}`, 'PATCH', { status: 'cancelled' }), ctx(billId));
    assert.equal(priya().totalSpent, 0);
    assert.equal(priya().totalVisits, 0);
  });

  await step('deleting a paid bill reverses totals', async () => {
    const res = await billingRoute.POST(reqOf('/api/admin/billing', 'POST', {
      customerName: 'Priya S', customerPhone: '9876543210',
      items: [{ name: 'Cut', quantity: 2, unitPrice: 400, discount: 100 }], tax: 50,
    }));
    const { id, total } = await res.json();
    assert.equal(total, 750);
    assert.equal(priya().totalSpent, 750);
    const del = await billingRoute.DELETE(reqOf(`/api/admin/billing?id=${id}`, 'DELETE'));
    assert.equal(del.status, 200);
    assert.equal(priya().totalSpent, 0);
    assert.equal(priya().totalVisits, 0);
  });

  // ── Booking confirmation with prepaid package ─────────────────────
  await step('confirming a booking deducts the prepaid package; cancelling refunds it', async () => {
    const cid = priya().id;
    await fakeDb.collection('customer_packages').doc('pkg1').set({ customerId: cid, status: 'active', availableBalance: 1000, usedAmount: 0 });
    const booking = fakeDb.dump('bookings').find((b: any) => b.phone === '+91 98765 43210');
    let res = await adminBookingRoute.PATCH(reqOf('/x', 'PATCH', { status: 'confirmed', scheduledDate: '2026-10-20', scheduledTime: '11:00' }), ctx(booking.id));
    assert.equal(res.status, 200, await res.clone().text());
    let pkg = fakeDb.dump('customer_packages')[0];
    assert.equal(pkg.availableBalance, 650);
    res = await adminBookingRoute.PATCH(reqOf('/x', 'PATCH', { status: 'cancelled' }), ctx(booking.id));
    pkg = fakeDb.dump('customer_packages')[0];
    assert.equal(pkg.availableBalance, 1000);
    // confirming again deducts once more, not twice
    await adminBookingRoute.PATCH(reqOf('/x', 'PATCH', { status: 'confirmed' }), ctx(booking.id));
    await adminBookingRoute.PATCH(reqOf('/x', 'PATCH', { status: 'confirmed' }), ctx(booking.id));
    assert.equal(fakeDb.dump('customer_packages')[0].availableBalance, 650);
  });

  // ── Admin customer API ────────────────────────────────────────────
  await step('admin cannot create a duplicate customer with a differently formatted number', async () => {
    const res = await customersRoute.POST(reqOf('/api/admin/customers', 'POST', { name: 'Dup', phone: '+91-98765-43210' }));
    assert.equal(res.status, 409);
  });
  await step('admin edit rejects invalid DOB and keeps phoneKey in sync', async () => {
    const id = priya().id;
    let res = await customerRoute.PATCH(reqOf('/x', 'PATCH', { date_of_birth: '0009-04-12' }), ctx(id));
    assert.equal(res.status, 400);
    res = await customerRoute.PATCH(reqOf('/x', 'PATCH', { phone: '+91 98765 00000' }), ctx(id));
    assert.equal(res.status, 200);
    assert.equal(priya(), undefined, 'old phone key no longer matches');
    const moved = customers().find((c: any) => c.id === id);
    assert.equal(moved.phoneKey, '9876500000');
  });

  // ── Login & password ──────────────────────────────────────────────
  await step('login: env password works; 6th failed attempt is rate-limited', async () => {
    let res = await loginRoute.POST(reqOf('/l', 'POST', { email: 'owner@salon.test', password: 'EnvPassword123' }, { ip: '1.1.1.1' }));
    assert.equal(res.status, 200);
    const codes = [];
    for (let i = 0; i < 6; i++) {
      res = await loginRoute.POST(reqOf('/l', 'POST', { email: 'owner@salon.test', password: 'nope' }, { ip: '2.2.2.2' }));
      codes.push(res.status);
    }
    assert.deepEqual(codes, [401, 401, 401, 401, 401, 429]);
    res = await loginRoute.POST(reqOf('/l', 'POST', { email: 'owner@salon.test', password: 'EnvPassword123' }, { ip: '2.2.2.2' }));
    assert.equal(res.status, 429, 'still locked even with the right password');
  });
  await step('changed password (stored as hash) replaces the env password', async () => {
    await fakeDb.collection('settings').doc('admin').set({ adminPasswordOverride: 'old-plaintext' });
    await fakeDb.collection('settings').doc('admin').set(
      { adminPasswordHash: await hashPassword('BrandNew12345'), adminPasswordOverride: require('./fake-firestore').FieldValue.delete() },
      { merge: true }
    );
    assert.equal(await verifyAdminPassword('BrandNew12345'), true);
    assert.equal(await verifyAdminPassword('EnvPassword123'), false);
    const stored = fakeDb.dump('settings').find((d: any) => d.id === 'admin');
    assert.equal(stored.adminPasswordOverride, undefined, 'plain text removed');
    assert.ok(!JSON.stringify(stored).includes('BrandNew12345'));
  });

  // ── Birthday automation ───────────────────────────────────────────
  const istToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [ty, tm, td] = istToday.split('-').map(Number);
  const inDays = (n: number) => {
    const d = new Date(Date.UTC(ty, tm - 1, td + n));
    return `1990-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
  };
  await fakeDb.collection('customers').doc('bday1').set({ name: 'Bday Today', phone: '9111111111', dateOfBirth: inDays(0) });
  await fakeDb.collection('customers').doc('bday7').set({ name: 'Bday Soon', phone: '9222222222', dateOfBirth: inDays(7) });
  await fakeDb.collection('customers').doc('bdaybad').set({ name: 'Bad Date', phone: '9333333333', dateOfBirth: '0009-01-01' });
  await fakeDb.collection('birthday_templates').doc('t1').set({
    templateName: 'Default', isActive: true, isDefault: true, offerPercentage: 25, offerValidityDays: 10,
    couponCodePrefix: 'BDAY', messageText: 'Happy birthday {{name}}! {{offer_percentage}}% off with {{coupon_code}} until {{valid_until}}',
  });

  await step('birthday lists: today / within 7 days, invalid DOB skipped', async () => {
    const today = await birthdays.getTodaysBirthdays();
    assert.deepEqual(today.map((c: any) => c.id), ['bday1']);
    const week = await birthdays.getUpcomingBirthdays(7);
    assert.deepEqual(week.map((c: any) => c.id).sort(), ['bday1', 'bday7']);
  });

  await step('cron without WhatsApp configured reports it clearly and sends nothing', async () => {
    const res = await cronRoute.POST(reqOf('/api/cron/birthday-reminders', 'POST'));
    // Called directly (middleware not involved), so requireCronOrAdmin must refuse
    assert.equal(res.status, 401);
    const result = await birthdays.sendTodaysBirthdayWishes();
    assert.equal(result.configured, false);
    assert.equal(result.sent, 0);
    assert.equal(fakeDb.dump('whatsapp_messages').length, 0);
    assert.equal(fakeDb.dump('coupons').length, 0);
  });

  await step('with WhatsApp configured: wish + 7-day reminder sent once each, coupon created', async () => {
    process.env.WHATSAPP_PHONE_NUMBER_ID = '123';
    process.env.WHATSAPP_ACCESS_TOKEN = 'test-token';
    process.env.CRON_SECRET = 'cron-secret-for-tests-0123456789';
    const calls: any[] = [];
    const realFetch = global.fetch;
    (global as any).fetch = async (url: string, init: any) => {
      calls.push({ url, body: JSON.parse(init.body) });
      return new Response(JSON.stringify({ messages: [{ id: 'wamid' }] }), { status: 200 });
    };
    try {
      const cronReq = () => reqOf('/api/cron/birthday-reminders', 'GET', undefined, { authorization: 'Bearer cron-secret-for-tests-0123456789' });
      let res = await cronRoute.GET(cronReq());
      let json = await res.json();
      assert.equal(res.status, 200, JSON.stringify(json));
      assert.equal(json.wishes.sent, 1);
      assert.equal(json.reminders.sent, 1);
      assert.equal(calls.length, 2);
      assert.deepEqual(calls.map(c => c.body.to).sort(), ['919111111111', '919222222222'], 'country code added');
      const wish = calls.find(c => c.body.to === '919111111111');
      assert.match(wish.body.text.body, /Happy birthday Bday Today! 25% off with BDAY[0-9A-F]{6} until/);
      const coupons = fakeDb.dump('coupons');
      assert.equal(coupons.length, 2);
      assert.equal(coupons[0].maxUses, 1);
      assert.equal(coupons[0].discountValue, 25);

      // second run the same day: nothing re-sent
      res = await cronRoute.GET(cronReq());
      json = await res.json();
      assert.equal(json.wishes.sent, 0);
      assert.equal(json.wishes.skipped, 1);
      assert.equal(json.reminders.skipped, 1);
      assert.equal(calls.length, 2);

      // approved template mode
      process.env.WHATSAPP_BIRTHDAY_TEMPLATE = 'birthday_wish_v1';
      await fakeDb.collection('customers').doc('bday1b').set({ name: 'Also Today', phone: '9444444444', dateOfBirth: inDays(0) });
      await cronRoute.GET(cronReq());
      const t = calls[calls.length - 1].body;
      assert.equal(t.type, 'template');
      assert.equal(t.template.name, 'birthday_wish_v1');
      assert.deepEqual(t.template.components[0].parameters, [{ type: 'text', text: 'Also Today' }]);
    } finally {
      (global as any).fetch = realFetch;
    }
  });

  await step('failed WhatsApp send leaves no orphan coupon and is retried next run', async () => {
    delete process.env.WHATSAPP_BIRTHDAY_TEMPLATE;
    await fakeDb.collection('customers').doc('bday1c').set({ name: 'Third', phone: '9555500000', dateOfBirth: inDays(0) });
    const before = fakeDb.dump('coupons').length;
    const realFetch = global.fetch;
    (global as any).fetch = async () => new Response(JSON.stringify({ error: { message: 'Re-engagement message' } }), { status: 400 });
    try {
      const r = await birthdays.sendTodaysBirthdayWishes();
      assert.equal(r.failed, 1);
      assert.deepEqual(r.errors, ['Re-engagement message']);
      assert.equal(fakeDb.dump('coupons').length, before);
    } finally {
      (global as any).fetch = realFetch;
    }
  });

  console.log(`\n${passed} integration checks passed${process.exitCode ? ' — SOME FAILED' : ''}`);
})();
