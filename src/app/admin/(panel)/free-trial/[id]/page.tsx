import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { RequestDetail } from "@/components/admin/RequestDetail";
export default async function TrialDetail({ params }: { params: Promise<{ id: string }> }) {
  const t = await db.freeTrial.findUnique({ where: { id: (await params).id } }); if (!t) notFound();
  const rows: [string, string][] = [["Name", t.name], ["Email", t.email], ["Company", t.company ?? "—"], ["Phone", t.phone ?? "—"], ["Service", t.serviceSlug ?? "—"], ["Images", String(t.imageCount)], ["Output format", t.outputFormat], ["Received", t.createdAt.toLocaleString()]];
  return (<div className="max-w-3xl space-y-4"><Link href="/admin/free-trial" className="text-sm underline">← All free trials</Link><h1 className="text-2xl font-bold">Free trial from {t.name}</h1>
    <dl className="grid gap-2 rounded-2xl border bg-white p-5 text-sm sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}<div className="sm:col-span-2"><dt className="text-neutral-500">Instructions</dt><dd className="whitespace-pre-wrap">{t.instructions ?? "—"}</dd></div></dl>
    <RequestDetail kind="free-trial" id={t.id} status={t.status} notes={t.internalNotes ?? ""} files={t.files as never} fileLinks={t.fileLinks as never} deliverables={t.deliverables as never} /></div>);
}
