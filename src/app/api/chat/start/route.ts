import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashToken, newToken, serialize, sessionFromToken, startSchema } from "@/lib/chat";
import { chatGuard } from "@/lib/chatHandler";

/** Resumes the visitor's session when a valid token is sent; otherwise creates a session and posts the automatic welcome message. */
export async function POST(req: Request) {
  const g = await chatGuard("start", 12, 3600); if ("res" in g) return g.res;
  const existing = await sessionFromToken(g.token);
  if (existing) {
    const messages = await db.chatMessage.findMany({ where: { sessionId: existing.id }, orderBy: { createdAt: "asc" }, take: 300 });
    await db.chatSession.update({ where: { id: existing.id }, data: { unreadVisitor: 0 } });
    return NextResponse.json({ resumed: true, messages: messages.map(serialize), status: existing.status });
  }
  const p = startSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Please check your email address" }, { status: 422 });
  const token = newToken();
  const s = await db.chatSession.create({ data: { tokenHash: hashToken(token), visitorName: p.data.name || null, visitorEmail: p.data.email || null, page: p.data.page } });
  const welcome = await db.chatMessage.create({ data: { sessionId: s.id, sender: "SYSTEM", body: String(g.settings.welcomeMessage).slice(0, 600) } });
  return NextResponse.json({ resumed: false, token, messages: [serialize(welcome)], status: "OPEN" }, { status: 201 });
}
