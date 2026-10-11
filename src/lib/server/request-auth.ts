// ═══════════════════════════════════════════════════════
//  Request authorisation helpers for API routes & middleware
// ═══════════════════════════════════════════════════════

import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { COOKIE_NAME, verifyAdminToken } from '@/lib/admin-auth';

/** True when the request carries a valid admin session cookie (or Bearer admin JWT). */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  return !!(await verifyAdminToken(token));
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * True when the request comes from the scheduler: `Authorization: Bearer <CRON_SECRET>`.
 * Vercel Cron sends this header automatically when CRON_SECRET is set.
 * With no CRON_SECRET configured, scheduled calls are always refused.
 */
export function isCronRequest(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false;
  const header = req.headers.get('authorization') || '';
  return safeEqual(header, `Bearer ${secret}`);
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/** Returns a 401 response unless the caller is the admin. */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  return (await isAdminRequest(req)) ? null : unauthorized();
}

/** Returns a 401 response unless the caller is the scheduler or the admin. */
export async function requireCronOrAdmin(req: NextRequest): Promise<NextResponse | null> {
  if (isCronRequest(req)) return null;
  return (await isAdminRequest(req)) ? null : unauthorized();
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
