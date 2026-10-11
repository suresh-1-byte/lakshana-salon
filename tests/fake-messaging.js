// Used by tests/integration.test.ts in place of firebase-admin/messaging
module.exports = { getMessaging: () => globalThis.__fakeMessaging };
