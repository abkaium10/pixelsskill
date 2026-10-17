import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { cloudinary, MEDIA_FOLDER } from "@/lib/cloudinary";
import { mediaRegisterSchema } from "@/lib/validators";
import { handle } from "@/lib/apiError";

export async function GET(req: Request) {
  const g = await guardApi(); if ("error" in g) return g.error;
  const u = new URL(req.url);
  const q = u.searchParams.get("q")?.trim();
  const type = u.searchParams.get("type");
  const page = Math.max(1, Number(u.searchParams.get("page") ?? 1));
  const take = 24;
  const where = {
    ...(type === "image" || type === "video" ? { resourceType: type } : {}),
    ...(q ? { OR: [{ originalName: { contains: q, mode: "insensitive" as const } }, { alt: { contains: q, mode: "insensitive" as const } }, { publicId: { contains: q, mode: "insensitive" as const } }] } : {}),
  };
  const [items, total] = await Promise.all([
    db.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    db.media.count({ where }),
  ]);
  return NextResponse.json({ items, total, page, pages: Math.ceil(total / take) });
}

/** After a browser upload, the client sends ONLY the publicId; metadata is fetched from Cloudinary (never trusted from the client). */
export async function POST(req: Request) {
  const g = await guardApi(true); if ("error" in g) return g.error;
  try {
    const parsed = mediaRegisterSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
    const { publicId, resourceType, originalName } = parsed.data;
    if (!publicId.startsWith(`${MEDIA_FOLDER}/`)) return NextResponse.json({ error: "Invalid asset folder" }, { status: 422 });
    const r = await cloudinary.api.resource(publicId, { resource_type: resourceType });
    const media = await db.media.upsert({
      where: { publicId },
      update: {},
      create: { publicId, url: r.url, secureUrl: r.secure_url, resourceType, format: r.format, width: r.width, height: r.height, bytes: r.bytes, originalName: originalName ?? r.original_filename, folder: MEDIA_FOLDER },
    });
    return NextResponse.json(media, { status: 201 });
  } catch (e) { return handle(e); }
}
