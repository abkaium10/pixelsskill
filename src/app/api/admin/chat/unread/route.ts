import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
export async function GET() {
  const g = await guardApi(); if ("error" in g) return g.error;
  const [open, unread] = await Promise.all([db.chatSession.count({ where: { status: "OPEN" } }), db.chatSession.count({ where: { unreadAdmin: { gt: 0 } } })]);
  return NextResponse.json({ open, unread });
}
