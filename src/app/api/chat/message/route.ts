import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { MAX_MESSAGES, messageSchema, serialize, sessionFromToken } from "@/lib/chat";
import { chatGuard } from "@/lib/chatHandler";
import { rateLimit } from "@/lib/rateLimit";
import { onVisitorMessage } from "@/lib/chatNotify";

export async function POST(req: Request) {
  const g = await chatGuard("msg", 60, 60); if ("res" in g) return g.res;
  const s = await sessionFromToken(g.token); if (!s) return NextResponse.json({ error: "Chat session not found. Please reopen the chat." }, { status: 401 });
  if (!rateLimit(`chat-session:${s.id}`, 20, 60_000)) return NextResponse.json({ error: "You are sending messages too quickly." }, { status: 429 });
  const p = messageSchema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? "Invalid message" }, { status: 422 });
  if ((await db.chatMessage.count({ where: { sessionId: s.id } })) >= MAX_MESSAGES) return NextResponse.json({ error: "This conversation is full. Please contact us by email." }, { status: 429 });
  const visitorCount = await db.chatMessage.count({ where: { sessionId: s.id, sender: "VISITOR" } });
  const m = await db.chatMessage.create({ data: { sessionId: s.id, sender: "VISITOR", body: p.data.body } });
  const out = [serialize(m)];
  if (visitorCount === 0 && String(g.settings.autoReply ?? "").trim()) out.push(serialize(await db.chatMessage.create({ data: { sessionId: s.id, sender: "SYSTEM", body: String(g.settings.autoReply).slice(0, 400) } })));
  await db.chatSession.update({ where: { id: s.id }, data: { unreadAdmin: { increment: 1 }, lastMessageAt: new Date(), status: "OPEN" } });
  void onVisitorMessage(s, p.data).catch(() => undefined);
  return NextResponse.json({ messages: out });
}
