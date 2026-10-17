import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rateLimit";
import { signPrivateUpload } from "@/lib/privateUploads";

/** Public: visitors upload originals to a PRIVATE (authenticated-delivery) Cloudinary area. */
export async function POST(req: Request) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`sign:${ip}`, 40, 10 * 60 * 1000)) return NextResponse.json({ error: "Too many uploads. Please wait and try again." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const sub = body?.scope === "quote" ? "quote" : body?.scope === "edit" ? "edit" : "trial";
  if (!process.env.CLOUDINARY_API_SECRET) return NextResponse.json({ error: "Uploads are not configured" }, { status: 503 });
  return NextResponse.json(signPrivateUpload(sub));
}
