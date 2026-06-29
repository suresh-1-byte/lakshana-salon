/**
 * Admin authentication utilities
 * JWT-based authentication for the admin panel
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'lakshana-admin-secret-key-2025-change-in-production'
);

export const COOKIE_NAME = 'lakshana_admin_token';
export const TOKEN_EXPIRY = '24h';

export interface AdminPayload {
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export async function signAdminToken(email: string): Promise<string> {
  return await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(SECRET);
}

export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdminSession(): Promise<AdminPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}
