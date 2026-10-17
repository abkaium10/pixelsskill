import Link from "next/link";
import { db } from "@/lib/db";
import type { EditStatus } from "@prisma/client";

const STATUSES = ["QUEUED", "PROCESSING", "DONE", "FAILED", "CANCELLED"];
export default async function EditJobs({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = sp.status && STATUSES.includes(sp.status) ? (sp.status as EditStatus) : undefined;
  const items = await db.editJob.findMany({ where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold">Editing jobs</h1>
      <p className="mb-4 text-sm text-neutral-600">Jobs created from the online editing studio. They appear here only after you enable the studio in <Link className="underline" href="/admin/editing-settings">Online editing settings</Link>.</p>
      <form className="mb-4 flex gap-2"><select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className="rounded-full border px-4 py-2 text-sm"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select><button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Created</th><th>Service</th><th>Provider</th><th>Files</th><th>Status</th><th /></tr></thead>
        <tbody className="divide-y">{items.map((j) => <tr key={j.id}><td className="p-3">{j.createdAt.toLocaleString()}</td><td>{j.serviceSlug}</td><td>{j.provider}</td><td>{(j.inputs as unknown[]).length}</td><td><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold">{j.status}</span></td><td className="p-3 text-right"><Link className="rounded-full border px-3 py-1" href={`/admin/edit-jobs/${j.id}`}>Open</Link></td></tr>)}
          {!items.length && <tr><td colSpan={6} className="p-10 text-center text-neutral-500">No jobs yet.</td></tr>}</tbody></table></div>
    </div>
  );
}
