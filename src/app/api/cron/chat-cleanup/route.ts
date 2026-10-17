import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/cms";
/** Optional retention job. Call daily with `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this automatically). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET; const got = req.headers.get("authorization") ?? "";
  const want = `Bearer ${secret}`;
  if (!secret || got.length !== want.length || !timingSafeEqual(Buffer.from(got), Buffer.from(want))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const days = Number((await getSetting("chat")).retentionDays ?? 0);
  if (!days) return NextResponse.json({ deleted: 0, note: "retention disabled" });
  const r = await db.chatSession.deleteMany({ where: { lastMessageAt: { lt: new Date(Date.now() - days * 86400000) } } });
  return NextResponse.json({ deleted: r.count });
}
