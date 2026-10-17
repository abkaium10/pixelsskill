import { z } from "zod";
import { cloudinary } from "./cloudinary";

export const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "tif", "tiff", "psd", "webp"];
export const MAX_BYTES = 25 * 1024 * 1024;
export const MAX_FILES = 20;
export const PRIVATE_FOLDER = "pixelskill-private";
export const fileRef = z.object({ publicId: z.string().min(1).max(300), resourceType: z.enum(["image", "raw", "video"]).default("image"), name: z.string().max(200).default("file") });

export function signPrivateUpload(sub: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { allowed_formats: ALLOWED_FORMATS.join(","), folder: `${PRIVATE_FOLDER}/${sub}`, timestamp, type: "authenticated" }; // allowed_formats is part of the signature, so Cloudinary itself rejects other file types
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return { ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME };
}

/** Never trust client metadata: re-read the asset from Cloudinary, enforce type/size, delete if invalid. */
export async function verifyPrivateFiles(refs: z.infer<typeof fileRef>[], sub: string) {
  const out: { publicId: string; resourceType: string; name: string; bytes: number; format: string }[] = [];
  for (const r of refs) {
    if (!r.publicId.startsWith(`${PRIVATE_FOLDER}/${sub}/`)) throw new Error("Invalid upload reference");
    const a = await cloudinary.api.resource(r.publicId, { resource_type: r.resourceType, type: "authenticated" });
    const fmt = String(a.format ?? "").toLowerCase();
    if (!ALLOWED_FORMATS.includes(fmt) || a.bytes > MAX_BYTES) {
      await cloudinary.uploader.destroy(r.publicId, { resource_type: r.resourceType, type: "authenticated" }).catch(() => undefined);
      throw new Error(`File "${r.name}" is not allowed (JPG, PNG, TIFF, PSD, WEBP up to 25 MB)`);
    }
    out.push({ publicId: r.publicId, resourceType: r.resourceType, name: r.name, bytes: a.bytes, format: fmt });
  }
  return out;
}

export function privateDownloadUrl(publicId: string, format: string, resourceType: string) {
  return cloudinary.utils.private_download_url(publicId, format, { resource_type: resourceType, type: "authenticated", expires_at: Math.floor(Date.now() / 1000) + 600 });
}
