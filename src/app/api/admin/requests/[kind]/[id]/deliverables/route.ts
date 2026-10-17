import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { fileRef, verifyPrivateFiles } from "@/lib/privateUploads";

export async function POST(req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const { kind, id } = await params; if (kind !== "free-trial") return NextResponse.json({ error: "Unsupported" }, { status: 404 });
  const p = z.object({ files: z.array(fileRef).min(1).max(50) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  try {
    const verified = await verifyPrivateFiles(p.data.files, "deliverables");
    const cur = await db.freeTrial.findUnique({ where: { id }, select: { deliverables: true } });
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await db.freeTrial.update({ where: { id }, data: { deliverables: [...((cur.deliverables as unknown as object[]) ?? []), ...verified] } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 422 }); }
}
