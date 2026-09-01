import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "esmeralda_admin_session";
const SESSION_DURATION = 60 * 60 * 8;

function loadLocalEnvironment() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    const environmentPath = resolve(process.cwd(), "../../.env");
    if (existsSync(environmentPath)) process.loadEnvFile(environmentPath);
  }
}

function getAdminConfig() {
  loadLocalEnvironment();
  const email = process.env.ADMIN_EMAIL;
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!email || !password || !secret) return null;
  return { email, username, password, secret };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function validateCredentials(identifier: string, password: string) {
  const config = getAdminConfig();
  if (!config) return { valid: false, configured: false } as const;
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const validIdentifier = safeEqual(normalizedIdentifier, config.email.trim().toLowerCase()) ||
    safeEqual(normalizedIdentifier, config.username.trim().toLowerCase());
  return {
    valid: validIdentifier && safeEqual(password, config.password),
    configured: true,
    email: config.email,
  } as const;
}

export async function createAdminSession(email: string) {
  const config = getAdminConfig();
  if (!config) throw new Error("Credenciais administrativas não configuradas.");
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  const token = `${payload}.${sign(payload, config.secret)}`;
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function deleteAdminSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const config = getAdminConfig();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!config || !token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, config.secret))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    if (typeof session.email !== "string" || typeof session.expiresAt !== "number") return null;
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    if (!safeEqual(session.email.trim().toLowerCase(), config.email.trim().toLowerCase())) return null;
    return { email: session.email };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
