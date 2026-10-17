import { NextResponse } from "next/server";
import { guardApi } from "@/lib/auth";
import { signPrivateUpload } from "@/lib/privateUploads";
export async function POST() {
  const g = await guardApi(true); if ("error" in g) return g.error;
  return NextResponse.json(signPrivateUpload("deliverables"));
}
