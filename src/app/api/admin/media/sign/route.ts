import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { cloudinary, MEDIA_FOLDER } from "@/lib/cloudinary";

/** Returns a short-lived signature. The API secret never leaves the server. */
export async function POST() {
  const g = await guardApi(true); if ("error" in g) return g.error;
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: MEDIA_FOLDER };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return NextResponse.json({ ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
}
