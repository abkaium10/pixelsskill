import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema } from "@/lib/publicForms";
import { readPublicForm } from "@/lib/formHandler";
export async function POST(req: Request) {
  const r = await readPublicForm(req, "contact", contactSchema); if ("res" in r) return r.res;
  const { name, email, subject, message } = r.data;
  await db.contactMessage.create({ data: { name, email, subject, message } });
  return NextResponse.json({ ok: true });
}
