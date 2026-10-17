import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribeSchema } from "@/lib/subscribe";
import { readPublicForm } from "@/lib/formHandler";

/** Always answers { ok: true } for valid input, whether or not the address already exists (no account/subscriber enumeration). */
export async function POST(req: Request) {
  const r = await readPublicForm(req, "subscribe", subscribeSchema, 5, 30); if ("res" in r) return r.res;
  await db.subscriber.upsert({ where: { email: r.data.email }, update: {}, create: { email: r.data.email, consent: true } });
  return NextResponse.json({ ok: true });
}
