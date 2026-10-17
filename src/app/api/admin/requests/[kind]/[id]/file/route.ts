import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { privateDownloadUrl } from "@/lib/privateUploads";

type F = { publicId: string; resourceType: string; format: string };
/** Admin-only: redirects to a 10-minute signed download URL. Only files stored on the record can be requested. */
export async function GET(req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const { kind, id } = await params;
  const publicId = new URL(req.url).searchParams.get("publicId") ?? "";
  let files: F[] = [];
  if (kind === "quotes") { const r = await db.quote.findUnique({ where: { id }, select: { files: true } }); files = (r?.files as unknown as F[]) ?? []; }
  else if (kind === "free-trial") { const r = await db.freeTrial.findUnique({ where: { id }, select: { files: true, deliverables: true } }); files = [...((r?.files as unknown as F[]) ?? []), ...((r?.deliverables as unknown as F[]) ?? [])]; }
  const f = files.find((x) => x.publicId === publicId);
  if (!f) return NextResponse.json({ error: "File not found" }, { status: 404 });
  return NextResponse.redirect(privateDownloadUrl(f.publicId, f.format, f.resourceType));
}
