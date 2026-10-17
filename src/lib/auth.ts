import { randomBytes, createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "./db";
import { rateLimit } from "./rateLimit";

const COOKIE = "ps_admin";
const TTL_MS = 1000 * 60 * 60 * 12;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export { hashPassword, verifyPassword } from "./auth-hash";

export async function createSession(adminId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TTL_MS);
  await db.adminSession.create({ data: { tokenHash: sha(token), adminId, expiresAt } });
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: expiresAt });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.adminSession.deleteMany({ where: { tokenHash: sha(token) } });
  jar.delete(COOKIE);
}
/** Returns the admin or null. Used by pages AND every protected API independently. */
export async function getAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await db.adminSession.findUnique({ where: { tokenHash: sha(token) }, include: { admin: { select: { id: true, email: true, name: true } } } });
  if (!s || s.expiresAt < new Date()) return null;
  return s.admin;
}

/** Same-origin check for mutating requests (defence in depth on top of SameSite=Lax). */
async function sameOrigin() {
  const h = await headers();
  const origin = h.get("origin"); const host = h.get("host");
  if (origin) { try { return new URL(origin).host === host; } catch { return false; } }
  // No Origin header: only accept browsers that say the request is same-origin (Fetch Metadata). Everything else is rejected.
  const site = h.get("sec-fetch-site");
  return site === "same-origin" || site === "none";
}

type Guard = { admin: NonNullable<Awaited<ReturnType<typeof getAdmin>>> } | { error: NextResponse };
export async function guardApi(mutating = false): Promise<Guard> {
  const admin = await getAdmin();
  if (!admin) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (mutating && !(await sameOrigin())) return { error: NextResponse.json({ error: "Bad origin" }, { status: 403 }) };
  if (mutating && !rateLimit(`admin-write:${admin.id}`, 240, 60_000)) return { error: NextResponse.json({ error: "Too many requests" }, { status: 429 }) };
  return { admin };
}
