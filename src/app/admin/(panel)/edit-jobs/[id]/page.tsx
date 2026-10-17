import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EditJobDetail } from "@/components/admin/EditJobDetail";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const j = await db.editJob.findUnique({ where: { id: (await params).id } });
  if (!j) notFound();
  const rows: [string, string][] = [["Service", j.serviceSlug], ["Provider", j.provider], ["Email", j.email ?? "—"], ["Created", j.createdAt.toLocaleString()], ["External id", j.externalId ?? "—"], ["Options", JSON.stringify(j.options)]];
  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/admin/edit-jobs" className="text-sm underline">← All jobs</Link>
      <h1 className="text-2xl font-bold">Editing job</h1>
      <dl className="grid gap-2 rounded-2xl border bg-white p-5 text-sm sm:grid-cols-2">{rows.map(([k, v]) => <div key={k}><dt className="text-neutral-500">{k}</dt><dd className="break-words font-medium">{v}</dd></div>)}</dl>
      <EditJobDetail id={j.id} status={j.status} notes={j.internalNotes ?? ""} inputs={j.inputs as never} outputs={j.outputs as never} error={j.error} />
    </div>
  );
}
