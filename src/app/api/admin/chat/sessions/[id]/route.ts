import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { messageSchema, serialize } from "@/lib/chat";
import { onAdminReply } from "@/lib/chatNotify";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const { id } = await params; const s = await db.chatSession.findUnique({ where: { id } });
  if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const after = new URL(req.url).searchParams.get("after"); const a = after && !Number.isNaN(Date.parse(after)) ? new Date(after) : null;
  const messages = await db.chatMessage.findMany({ where: { sessionId: id, ...(a ? { createdAt: { gt: a } } : {}) }, orderBy: { createdAt: "asc" }, take: 300 });
  if (s.unreadAdmin) await db.chatSession.update({ where: { id }, data: { unreadAdmin: 0 } });
  return NextResponse.json({ session: { id: s.id, name: s.visitorName, email: s.visitorEmail, page: s.page, status: s.status, createdAt: s.createdAt.toISOString() }, messages: messages.map(serialize) });
}
/** Reply as the team. */
export async function POST(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { id } = await params; const p = messageSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Invalid message" }, { status: 422 });
  const s = await db.chatSession.findUnique({ where: { id } }); if (!s) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const m = await db.chatMessage.create({ data: { sessionId: id, sender: "ADMIN", body: p.data.body } });
  await db.chatSession.update({ where: { id }, data: { unreadVisitor: { increment: 1 }, lastMessageAt: new Date(), status: "OPEN" } });
  void onAdminReply(s, p.data).catch(() => undefined);
  return NextResponse.json({ message: serialize(m) }, { status: 201 });
}
export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const p = z.object({ status: z.enum(["OPEN", "CLOSED"]) }).safeParse(await req.json().catch(() => null)); if (!p.success) return NextResponse.json({ error: "Invalid status" }, { status: 422 });
  await db.chatSession.update({ where: { id: (await params).id }, data: { status: p.data.status } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  await db.chatSession.delete({ where: { id: (await params).id } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
