import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { RequestDetail } from "@/components/admin/RequestDetail";
export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const q = await db.quote.findUnique({ where: { id: (await params).id } }); if (!q) notFound();
  const rows: [string, string][] = [["Name", q.name], ["Email", q.email], ["Company", q.company ?? "—"], ["Phone", q.phone ?? "—"], ["Service", q.serviceSlug ?? "—"], ["Quantity", String(q.quantity ?? "—")], ["Complexity", q.complexity ?? "—"], ["Output format", q.outputFormat ?? "—"], ["Deadline", q.deadline ? q.deadline.toLocaleDateString() : "—"], ["Received", q.createdAt.toLocaleString()]];
  return (<div className="max-w-3xl space-y-4"><Link href="/admin/quotes" className="text-sm underline">← All quotes</Link><h1 className="text-2xl font-bold">Quote from {q.name}</h1>
    <dl className="grid gap-2 rounded-2xl border bg-white p-5 text-sm sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}<div className="sm:col-span-2"><dt className="text-neutral-500">Instructions</dt><dd className="whitespace-pre-wrap">{q.instructions ?? "—"}</dd></div></dl>
    <RequestDetail kind="quotes" id={q.id} status={q.status} notes={q.internalNotes ?? ""} price={q.proposedPrice?.toString() ?? ""} turnaround={q.proposedTurnaround ?? ""} files={q.files as never} fileLinks={q.fileLinks as never} /></div>);
}
