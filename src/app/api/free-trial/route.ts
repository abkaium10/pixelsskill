import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trialSchema } from "@/lib/publicForms";
import { readPublicForm } from "@/lib/formHandler";
import { verifyPrivateFiles } from "@/lib/privateUploads";
export async function POST(req: Request) {
  const r = await readPublicForm(req, "trial", trialSchema, 3, 30); if ("res" in r) return r.res;
  const d = r.data;
  try {
    const files = await verifyPrivateFiles(d.files, "trial");
    await db.freeTrial.create({ data: { name: d.name, email: d.email, company: d.company || null, phone: d.phone || null, serviceSlug: d.serviceSlug || null, imageCount: d.imageCount, outputFormat: d.outputFormat, instructions: d.instructions || null, files, fileLinks: d.fileLinks } });
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Could not save your request" }, { status: 422 }); }
}
