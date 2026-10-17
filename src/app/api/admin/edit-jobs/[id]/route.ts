import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { fileRef, verifyPrivateFiles } from "@/lib/privateUploads";

type Ctx = { params: Promise<{ id: string }> };
const patch = z.object({ status: z.enum(["QUEUED", "PROCESSING", "DONE", "FAILED", "CANCELLED"]), internalNotes: z.string().max(5000).default("") });

export async function PATCH(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const p = patch.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid values" }, { status: 422 });
  await db.editJob.update({ where: { id: (await params).id }, data: p.data }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}

/** Attach finished files (uploaded privately by staff) to the job; visitors receive signed download links once it is DONE. */
export async function POST(req: Request, { params }: Ctx) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const p = z.object({ files: z.array(fileRef).min(1).max(50) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  try {
    const { id } = await params;
    const job = await db.editJob.findUnique({ where: { id }, select: { outputs: true } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const verified = await verifyPrivateFiles(p.data.files, "deliverables");
    await db.editJob.update({ where: { id }, data: { outputs: [...((job.outputs as object[]) ?? []), ...verified] } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 422 });
  }
}
