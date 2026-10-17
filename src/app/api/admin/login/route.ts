import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/auth-hash";

// Verified against when the account does not exist, so response time does not reveal which emails are admins.
const DUMMY_HASH = hashPassword("dummy-password-for-timing");
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  const origin = (await headers()).get("origin");
  if (origin && new URL(origin).host !== (await headers()).get("host")) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const admin = await db.admin.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  // same error + same work whether or not the account exists
  const ok = verifyPassword(parsed.data.password, admin ? admin.passwordHash : DUMMY_HASH) && !!admin;
  if (!admin || !ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  await createSession(admin.id);
  return NextResponse.json({ ok: true });
}
