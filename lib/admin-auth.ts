import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE = "cd_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const defaultSessionSecret = "change-this-admin-session-secret";

type AdminSession = {
  email: string;
  exp: number;
};

function getAllowedAdminEmails(): string[] {
  const raw = process.env.ADMIN_LOGIN_EMAILS || process.env.ADMIN_LOGIN_EMAIL || "";
  const normalized = raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return normalized;
}

function getAdminPassword(): string {
  return process.env.ADMIN_LOGIN_PASSWORD || "";
}

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || defaultSessionSecret;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function sign(payloadBase64: string): string {
  return createHmac("sha256", getSessionSecret()).update(payloadBase64).digest("base64url");
}

function decodeSession(token: string): AdminSession | null {
  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) return null;
  if (!safeEqual(sign(payloadBase64), signature)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf8")) as AdminSession;

    if (!decoded?.email || !decoded?.exp) return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    if (!getAllowedAdminEmails().includes(decoded.email.toLowerCase())) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(email: string, password: string): string | null {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  if (!password) return null;
  if (!getAdminPassword()) return null;
  if (getAllowedAdminEmails().length === 0) return null;

  if (!getAllowedAdminEmails().includes(normalizedEmail)) {
    return null;
  }

  if (!safeEqual(password, getAdminPassword())) {
    return null;
  }

  return normalizedEmail;
}

export function createAdminSessionToken(email: string): string {
  const payload: AdminSession = {
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSession | null {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function getAdminSessionFromCookiesStore(): AdminSession | null {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function isAdminRequest(request: NextRequest): boolean {
  return Boolean(getAdminSessionFromRequest(request));
}

export function getAdminSessionMaxAge(): number {
  return SESSION_TTL_SECONDS;
}
