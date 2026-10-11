// Permission & validation tests against a local production build.
// Firestore is unreachable locally, so "allowed" = any status other than 401/403
// (usually 500 from the database layer); "denied" = 401 before any route code runs.
// Usage: start a local server with test credentials, then
//   TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=... TEST_CRON_SECRET=... BASE=http://localhost:3000 node tests/http-permissions.test.mjs
// Never point this at production with real credentials: it attempts failed logins.
const cred = {
  email: process.env.TEST_ADMIN_EMAIL,
  password: process.env.TEST_ADMIN_PASSWORD,
  cron: process.env.TEST_CRON_SECRET,
};
if (!cred.email || !cred.password || !cred.cron) {
  console.error('Set TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD and TEST_CRON_SECRET (the values the local server was started with).');
  process.exit(1);
}
const BASE = process.env.BASE || 'http://localhost:9013';

let pass = 0, fail = 0;
const results = [];
function check(name, ok, detail) {
  ok ? pass++ : fail++;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
}
async function req(method, p, { body, cookie, headers = {} } = {}) {
  const res = await fetch(BASE + p, {
    method,
    redirect: 'manual',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json, setCookie: res.headers.get('set-cookie') };
}

// 1. Sensitive endpoints refuse anonymous callers
const sensitive = [
  ['GET', '/api/bookings'],
  ['PATCH', '/api/bookings/abc', { status: 'confirmed' }],
  ['DELETE', '/api/bookings/abc'],
  ['GET', '/api/birthdays/upcoming'],
  ['GET', '/api/birthdays/today'],
  ['POST', '/api/birthdays/today'],
  ['GET', '/api/fcm-token/list'],
  ['POST', '/api/fcm-token/cleanup'],
  ['DELETE', '/api/fcm-token/delete-all'],
  ['POST', '/api/notify', { title: 't', body: 'b' }],
  ['GET', '/api/cron/birthday-reminders'],
  ['POST', '/api/cron/birthday-reminders'],
  ['GET', '/api/admin/customers'],
  ['GET', '/api/admin/customers/abc'],
  ['PATCH', '/api/admin/customers/abc', { name: 'x' }],
  ['DELETE', '/api/admin/customers/abc'],
  ['GET', '/api/admin/billing'],
  ['POST', '/api/admin/auth/change-password', { currentPassword: 'a', newPassword: 'b' }],
  ['POST', '/api/admin/whatsapp/send', {}],
  ['GET', '/api/admin/export?type=customers'],
  ['POST', '/api/admin/gallery/upload', {}],
];
for (const [m, p, body] of sensitive) {
  const r = await req(m, p, { body });
  check(`anonymous ${m} ${p} → 401`, r.status === 401, `got ${r.status}`);
}

// 2. Removed debug / duplicate endpoints are gone
for (const p of ['/api/debug-env', '/api/test-data?action=checkData', '/api/test-reviews', '/api/addeventlistener',
  '/api/fcm-token/test', '/api/cron/birthday-check', '/api/reports/daily', '/api/whatsapp/send',
  '/api/customers/abc', '/fcm-debug', '/fcm-cleanup', '/test-fcm-send', '/test-review-system']) {
  const r = await req('GET', p);
  check(`removed ${p} → unreachable (404/401)`, r.status === 404 || r.status === 401, `got ${r.status}`);
}

// 3. Cron secret
{
  let r = await req('GET', '/api/cron/birthday-reminders', { headers: { Authorization: 'Bearer your-secret-key' } });
  check('cron with old default secret → 401', r.status === 401, `got ${r.status}`);
  r = await req('GET', '/api/cron/birthday-reminders', { headers: { Authorization: 'Bearer wrong' } });
  check('cron with wrong secret → 401', r.status === 401, `got ${r.status}`);
  r = await req('GET', '/api/cron/birthday-reminders', { headers: { Authorization: `Bearer ${cred.cron}` } });
  check('cron with correct secret → allowed', r.status !== 401 && r.status !== 403, `got ${r.status}`);
}

// 4. Login
let cookie = '';
{
  let r = await req('POST', '/api/admin/auth/login', { body: { email: cred.email, password: 'wrong-password-123' } });
  check('login with wrong password → 401', r.status === 401, `got ${r.status}`);
  r = await req('POST', '/api/admin/auth/login', { body: { email: 'someone@else.com', password: cred.password } });
  check('login with wrong email → 401', r.status === 401, `got ${r.status}`);
  r = await req('POST', '/api/admin/auth/login', { body: { email: cred.email.toUpperCase(), password: cred.password } });
  check('login with correct credentials → 200 + cookie', r.status === 200 && !!r.setCookie, `got ${r.status}`);
  cookie = (r.setCookie || '').split(';')[0];
  check('session cookie is HttpOnly', /HttpOnly/i.test(r.setCookie || ''));
}

// 5. Same sensitive endpoints work for the admin
for (const [m, p, body] of sensitive.filter(([, p]) => !p.includes('change-password'))) {
  const r = await req(m, p, { body, cookie });
  check(`admin ${m} ${p} → allowed`, r.status !== 401 && r.status !== 403, `got ${r.status}`);
}
{
  // forged / tampered cookie
  const tampered = cookie.slice(0, -4) + 'abcd';
  const r = await req('GET', '/api/admin/customers', { cookie: tampered });
  check('tampered session cookie → 401', r.status === 401, `got ${r.status}`);
}

// 6. Change password validation (runs before any database access)
{
  let r = await req('POST', '/api/admin/auth/change-password', { cookie, body: { currentPassword: 'x', newPassword: 'short1' } });
  check('change password: too short → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/auth/change-password', { cookie, body: { currentPassword: 'x', newPassword: 'onlyletterspassword' } });
  check('change password: no digits → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/auth/change-password', { cookie, body: { currentPassword: 'wrong-current-1', newPassword: 'NewPassword123' } });
  check('change password: wrong current password → 401', r.status === 401, `got ${r.status}`);
}

// 7. Public booking validation (before any database write)
{
  const good = { name: 'Test Person', phone: '98765 43210', email: 'test@example.com', services: [{ name: 'Eyebrow', member: '₹50', duration: '10 min', category: 'Threading' }] };
  const cases = [
    ['missing name', { ...good, name: '' }],
    ['bad phone', { ...good, phone: '12345' }],
    ['bad email', { ...good, email: 'not-an-email' }],
    ['no services', { ...good, services: [] }],
    ['21 services', { ...good, services: Array.from({ length: 21 }, () => good.services[0]) }],
    ['services not array', { ...good, services: 'x' }],
  ];
  for (const [label, body] of cases) {
    const r = await req('POST', '/api/bookings', { body });
    check(`public booking ${label} → 400`, r.status === 400, `got ${r.status}`);
  }
  const r = await req('POST', '/api/bookings', { body: 'not json' });
  check('public booking non-JSON → 400', r.status === 400, `got ${r.status}`);
}

// 8. Public review & push token validation
{
  let r = await req('POST', '/api/public/reviews', { body: { customerName: '', rating: 5, comment: 'x' } });
  check('public review without name → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/public/reviews', { body: { customerName: 'A', rating: 9, comment: 'x' } });
  check('public review rating 9 → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/fcm-token', { body: { token: 'x' } });
  check('push token too short → 400', r.status === 400, `got ${r.status}`);
}

// 9. Admin input validation
{
  let r = await req('POST', '/api/admin/customers', { cookie, body: { name: 'Test', phone: '98765 43210', dateOfBirth: '0009-04-12' } });
  check('admin customer DOB year 0009 → 400', r.status === 400, `got ${r.status} ${r.json?.error || ''}`);
  r = await req('POST', '/api/admin/customers', { cookie, body: { name: 'Test', phone: '98765 43210', dateOfBirth: '2099-01-01' } });
  check('admin customer future DOB → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/customers', { cookie, body: { name: 'Test', phone: '98765 43210', dateOfBirth: '2001-02-30' } });
  check('admin customer impossible date → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/customers', { cookie, body: { name: 'Test', phone: '123' } });
  check('admin customer bad phone → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/billing', { cookie, body: { customerName: 'Test', customerPhone: '9876543210', items: [{ name: 'Cut', quantity: 1, unitPrice: -100 }] } });
  check('bill with negative price → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/billing', { cookie, body: { customerName: 'Test', customerPhone: '9876543210', items: [{ name: 'Cut', quantity: 1, unitPrice: 100, discount: 500 }] } });
  check('bill with discount > price → 400', r.status === 400, `got ${r.status}`);
  r = await req('POST', '/api/admin/billing', { cookie, body: { customerName: 'Test', customerPhone: '9876543210', items: [{ name: 'Cut', quantity: 0, unitPrice: 100 }] } });
  check('bill with quantity 0 → 400', r.status === 400, `got ${r.status}`);
  r = await req('PATCH', '/api/admin/billing/abc', { cookie, body: { status: 'hacked' } });
  check('bill invalid status → 400', r.status === 400, `got ${r.status}`);
}

console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
