import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { collection, deleteCollection, getCollectionRecord, saveCollection } from "@/lib/cms";
import { handle } from "@/lib/apiError";

type Ctx = { params: Promise<{ resource: string; id: string }> };
export async function GET(_: Request, { params }: Ctx) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const { resource, id } = await params; const def = collection(resource); if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  const r = await getCollectionRecord(def, id); return r ? NextResponse.json(r) : NextResponse.json({ error: "Not found" }, { status: 404 });
}
export async function PUT(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { resource, id } = await params; const def = collection(resource); if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try { const r = await saveCollection(def, await req.json(), id); return NextResponse.json({ id: r.id }); } catch (e) { return handle(e); }
}
export async function DELETE(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { resource, id } = await params; const def = collection(resource); if (!def) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  try { await deleteCollection(def, id, new URL(req.url).searchParams.get("hard") === "1"); return NextResponse.json({ ok: true }); } catch (e) { return handle(e); }
}
