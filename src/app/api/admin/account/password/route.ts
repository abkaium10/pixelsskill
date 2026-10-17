import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi, destroySession } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/auth-hash";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({ current: z.string().min(1).max(200), next: z.string().min(12, "Use at least 12 characters").max(200) });
export async function POST(req: Request) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  if (!rateLimit(`pw:${g.admin.id}`, 5, 15 * 60 * 1000)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Invalid input" }, { status: 422 });
  const admin = await db.admin.findUnique({ where: { id: g.admin.id } });
  if (!admin || !verifyPassword(p.data.current, admin.passwordHash)) return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
  await db.admin.update({ where: { id: admin.id }, data: { passwordHash: hashPassword(p.data.next) } });
  await db.adminSession.deleteMany({ where: { adminId: admin.id } }); // revoke every session
  await destroySession();
  return NextResponse.json({ ok: true });
}
