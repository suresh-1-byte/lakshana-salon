import assert from 'node:assert/strict';
import { phoneKey, isValidPhone, validatePastDate, optionalPastDate, escapeHtml, isValidEmail } from '../src/lib/server/validation';
import { hashPassword, verifyPasswordHash } from '../src/lib/server/password';
import { loyaltyFor, billCounts } from '../src/lib/server/customer-stats';
import { nextBirthday } from '../src/lib/api/birthdays';

(async () => {
let n = 0;
const t = async (name: string, fn: () => unknown) => { await fn(); n++; console.log('PASS', name); };

await t('phoneKey matches formats', () => {
  for (const p of ['9876543210', '+91 98765 43210', '098765-43210', '91-9876543210', '(987) 654-3210'])
    assert.equal(phoneKey(p), '9876543210', p);
  assert.equal(phoneKey('12345'), '');
  assert.equal(isValidPhone('98765'), false);
});
await t('date validation', () => {
  assert.equal(validatePastDate('1995-04-12').ok, true);
  for (const bad of ['0009-04-12', '2026-13-01', '2001-02-29', '2099-01-01', '12-04-1995', '', 'abc'])
    assert.equal(validatePastDate(bad).ok, false, bad);
  assert.equal(validatePastDate('2000-02-29').ok, true);
  assert.equal(optionalPastDate('0009-01-01'), null);
  assert.equal(optionalPastDate(''), null);
});
await t('escaping & email', () => {
  assert.equal(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  assert.equal(isValidEmail('a@b.co'), true);
  assert.equal(isValidEmail('a@b'), false);
});
await t('password hashing', async () => {
  const h = await hashPassword('Secret12345');
  assert.ok(h.startsWith('scrypt$'));
  assert.ok(!h.includes('Secret12345'));
  assert.equal(await verifyPasswordHash('Secret12345', h), true);
  assert.equal(await verifyPasswordHash('secret12345', h), false);
  assert.notEqual(await hashPassword('Secret12345'), h, 'salted');
});
await t('loyalty tiers & bill counting', () => {
  assert.equal(loyaltyFor(0), 'Bronze');
  assert.equal(loyaltyFor(5000), 'Silver');
  assert.equal(loyaltyFor(20000), 'Gold');
  assert.equal(loyaltyFor(50000), 'Platinum');
  assert.equal(billCounts({ status: 'paid' }), true);
  assert.equal(billCounts({}), true);
  assert.equal(billCounts({ status: 'refunded' }), false);
});
await t('birthday date math', () => {
  const today = { y: 2026, m: 10, d: 11 };
  assert.deepEqual(nextBirthday('1995-10-11', today), { date: '2026-10-11', year: 2026, days: 0, age: 31 });
  assert.equal(nextBirthday('1995-10-18', today).days, 7);
  assert.deepEqual(nextBirthday('1990-01-05', today), { date: '2027-01-05', year: 2027, days: 86, age: 37 });
  assert.equal(nextBirthday('2000-02-29', today).date, '2027-02-28'); // non-leap year
  assert.equal(nextBirthday('2000-02-29', { y: 2027, m: 3, d: 1 }).date, '2028-02-29'); // leap year
  assert.equal(nextBirthday('1999-12-31', { y: 2026, m: 12, d: 31 }).days, 0);
});
console.log(`\n${n} unit test groups passed`);
})().catch(e => { console.error('FAIL', e.message); process.exit(1); });
