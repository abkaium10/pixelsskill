import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serialize, sessionFromToken } from "@/lib/chat";
import { chatGuard } from "@/lib/chatHandler";

/** Polling endpoint. The token is sent in a header (never in the URL, so it does not end up in logs). */
export async function GET(req: Request) {
  const g = await chatGuard("poll", 240, 60); if ("res" in g) return g.res;
  const s = await sessionFromToken(g.token); if (!s) return NextResponse.json({ error: "Chat session not found" }, { status: 401 });
  const after = new URL(req.url).searchParams.get("after");
  const afterDate = after && !Number.isNaN(Date.parse(after)) ? new Date(after) : null;
  const messages = await db.chatMessage.findMany({ where: { sessionId: s.id, ...(afterDate ? { createdAt: { gt: afterDate } } : {}) }, orderBy: { createdAt: "asc" }, take: 100 });
  if (s.unreadVisitor) await db.chatSession.update({ where: { id: s.id }, data: { unreadVisitor: 0 } });
  return NextResponse.json({ messages: messages.map(serialize), status: s.status, unread: s.unreadVisitor });
}
