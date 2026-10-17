import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
export async function GET(req: Request) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const u = new URL(req.url); const status = u.searchParams.get("status"); const q = (u.searchParams.get("q") ?? "").trim().slice(0, 80);
  const items = await db.chatSession.findMany({
    where: { ...(status === "OPEN" || status === "CLOSED" ? { status } : {}), ...(q ? { OR: [{ visitorName: { contains: q, mode: "insensitive" } }, { visitorEmail: { contains: q, mode: "insensitive" } }, { messages: { some: { body: { contains: q, mode: "insensitive" } } } }] } : {}) },
    orderBy: { lastMessageAt: "desc" }, take: 100, include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  return NextResponse.json({ items: items.map((s) => ({ id: s.id, name: s.visitorName, email: s.visitorEmail, page: s.page, status: s.status, unread: s.unreadAdmin, lastAt: s.lastMessageAt.toISOString(), last: s.messages[0]?.body.slice(0, 120) ?? "" })) });
}
