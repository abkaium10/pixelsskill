import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { getSetting, saveSetting } from "@/lib/cms";
import { singleton } from "@/lib/defs";
import { handle } from "@/lib/apiError";

type Ctx = { params: Promise<{ key: string }> };
export async function GET(_: Request, { params }: Ctx) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const { key } = await params; if (!singleton(key)) return NextResponse.json({ error: "Unknown settings group" }, { status: 404 });
  return NextResponse.json(await getSetting(key));
}
export async function PUT(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  try { await saveSetting((await params).key, await req.json()); return NextResponse.json({ ok: true }); } catch (e) { return handle(e); }
}
