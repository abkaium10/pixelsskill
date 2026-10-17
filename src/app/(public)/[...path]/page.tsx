import { notFound, permanentRedirect, redirect } from "next/navigation";
import { db } from "@/lib/db";
/** Catch-all: applies admin-managed redirects, otherwise 404. Real routes always win over this. */
export default async function Catch({ params }: { params: Promise<{ path: string[] }> }) {
  const source = `/${(await params).path.map((p) => decodeURIComponent(p)).join("/")}`;
  const r = await db.redirect.findUnique({ where: { source } });
  if (r?.active && r.target !== source) (r.permanent ? permanentRedirect : redirect)(r.target);
  notFound();
}
