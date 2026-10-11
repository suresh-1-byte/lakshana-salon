#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
//  Read-only backup of the whole Firestore database to local JSON files.
//
//  Usage (PowerShell):
//    $env:FIREBASE_SERVICE_ACCOUNT_FILE = "C:\secure\lakshana-service-account.json"
//    node scripts/firestore-backup.mjs
//
//  Writes backups/<timestamp>/<collection>.json (subcollections are nested
//  under each document as "__subcollections"). Nothing is changed in
//  Firestore. Backups contain customer data: keep them private; the
//  backups/ folder is git-ignored.
// ═══════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, GeoPoint, DocumentReference } from 'firebase-admin/firestore';


// Credentials: a service-account JSON file (FIREBASE_SERVICE_ACCOUNT_FILE), or
// FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + a PEM key file (FIREBASE_PRIVATE_KEY_FILE).
function loadServiceAccount() {
  const keyFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFile && fs.existsSync(keyFile)) return JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const pemFile = process.env.FIREBASE_PRIVATE_KEY_FILE;
  if (pemFile && fs.existsSync(pemFile) && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      // Accept keys stored with literal \n sequences as well as real newlines
      private_key: fs.readFileSync(pemFile, 'utf8').split(String.fromCharCode(92) + 'n').join(String.fromCharCode(10)),
    };
  }
  if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY.split(String.fromCharCode(92) + 'n').join(String.fromCharCode(10)),
    };
  }
  console.error('Set FIREBASE_SERVICE_ACCOUNT_FILE (service-account JSON), or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY_FILE.');
  process.exit(1);
}
const serviceAccount = loadServiceAccount();
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function serialize(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Timestamp) return { __timestamp: value.toDate().toISOString() };
  if (value instanceof GeoPoint) return { __geo: [value.latitude, value.longitude] };
  if (value instanceof DocumentReference) return { __ref: value.path };
  if (Array.isArray(value)) return value.map(serialize);
  if (typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  return value;
}

async function dumpCollection(ref) {
  const snap = await ref.get();
  const out = [];
  for (const doc of snap.docs) {
    const entry = { __id: doc.id, ...serialize(doc.data()) };
    const subs = await doc.ref.listCollections();
    if (subs.length) {
      entry.__subcollections = {};
      for (const sub of subs) entry.__subcollections[sub.id] = await dumpCollection(sub);
    }
    out.push(entry);
  }
  return out;
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join(process.cwd(), 'backups', stamp);
fs.mkdirSync(dir, { recursive: true });

const collections = await db.listCollections();
let total = 0;
for (const col of collections) {
  const docs = await dumpCollection(col);
  fs.writeFileSync(path.join(dir, `${col.id}.json`), JSON.stringify(docs, null, 2));
  total += docs.length;
  console.log(`${col.id.padEnd(28)} ${docs.length} documents`);
}
fs.writeFileSync(path.join(dir, '_manifest.json'), JSON.stringify({
  projectId: serviceAccount.project_id,
  createdAt: new Date().toISOString(),
  collections: collections.map(c => c.id),
  documents: total,
}, null, 2));
console.log(`\nBackup complete: ${total} documents in ${dir}`);
