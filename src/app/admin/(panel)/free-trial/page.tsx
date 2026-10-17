import Link from "next/link";
import { db } from "@/lib/db";
import type { RequestStatus } from "@prisma/client";
const S = ["PENDING", "REVIEWING", "QUOTED", "APPROVED", "COMPLETED", "CANCELLED"];
export default async function Trials({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams; const page = Math.max(1, Number(sp.page ?? 1)); const take = 20;
  const where = { ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" as const } }, { email: { contains: sp.q, mode: "insensitive" as const } }] } : {}), ...(sp.status && S.includes(sp.status) ? { status: sp.status as RequestStatus } : {}) };
  const [items, total] = await Promise.all([db.freeTrial.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }), db.freeTrial.count({ where })]);
  return (<div className="max-w-6xl"><h1 className="mb-4 text-2xl font-bold">Free trial requests</h1>
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Search name or email…" className="rounded-full border px-4 py-2 text-sm" aria-label="Search" /><select name="status" defaultValue={sp.status ?? ""} className="rounded-full border px-4 py-2 text-sm" aria-label="Status"><option value="">All statuses</option>{S.map((s) => <option key={s}>{s}</option>)}</select><button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Received</th><th>Name</th><th>Service</th><th>Images</th><th>Format</th><th>Status</th><th /></tr></thead>
      <tbody className="divide-y">{items.map((t) => <tr key={t.id}><td className="p-3">{t.createdAt.toLocaleDateString()}</td><td><b>{t.name}</b><br /><span className="text-neutral-500">{t.email}</span></td><td>{t.serviceSlug ?? "—"}</td><td>{t.imageCount}</td><td>{t.outputFormat}</td><td><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold">{t.status}</span></td><td className="p-3 text-right"><Link className="rounded-full border px-3 py-1" href={`/admin/free-trial/${t.id}`}>Open</Link></td></tr>)}
        {!items.length && <tr><td colSpan={7} className="p-10 text-center text-neutral-500">No free trial requests yet.</td></tr>}</tbody></table></div>
    <p className="mt-3 text-sm text-neutral-500">{total} total · page {page}{page > 1 && <> · <Link className="underline" href={`?page=${page - 1}`}>Previous</Link></>}{page * take < total && <> · <Link className="underline" href={`?page=${page + 1}`}>Next</Link></>}</p></div>);
}
