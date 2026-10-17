import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { collection, listCollection, saveCollection } from "@/lib/cms";
import { handle } from "@/lib/apiError";

type Ctx = { params: Promise<{ resource: string }> };
export async function GET(req: Request, { params }: Ctx) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const def = collection((await params).resource); if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const u = new URL(req.url);
  return NextResponse.json(await listCollection(def, { q: u.searchParams.get("q") ?? undefined, status: u.searchParams.get("status") ?? undefined, page: Number(u.searchParams.get("page") ?? 1) }));
}
export async function POST(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const def = collection((await params).resource); if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try { const r = await saveCollection(def, await req.json()); return NextResponse.json({ id: r.id }, { status: 201 }); } catch (e) { return handle(e); }
}
