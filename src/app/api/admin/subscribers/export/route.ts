import { db } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { csvCell } from "@/lib/subscribe";
/** Admin-only CSV export. Cells are protected against spreadsheet formula injection. */
export async function GET() {
  const g = await guardApi(); if ("error" in g) return g.error;
  const rows = await db.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,consent,consent_at,source,created_at", ...rows.map((r) => [r.email, r.consent, r.consentAt, r.source, r.createdAt].map(csvCell).join(","))].join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="subscribers.csv"', "Cache-Control": "no-store" } });
}
