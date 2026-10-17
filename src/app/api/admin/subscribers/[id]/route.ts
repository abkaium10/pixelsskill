import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  await db.subscriber.delete({ where: { id: (await params).id } }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
