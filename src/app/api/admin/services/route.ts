import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { parseService, saveService } from "@/lib/serviceSave";
import { handle } from "@/lib/apiError";

export async function GET(req: Request) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  const status = u.searchParams.get("status");
  const items = await db.service.findMany({
    where: { ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {}), ...(status && ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status) ? { status: status as "DRAFT" } : {}) },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, status: true, featured: true, displayOrder: true, updatedAt: true },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  try {
    const svc = await saveService(parseService(await req.json()));
    return NextResponse.json({ id: svc.id, slug: svc.slug }, { status: 201 });
  } catch (e) { return handle(e); }
}
