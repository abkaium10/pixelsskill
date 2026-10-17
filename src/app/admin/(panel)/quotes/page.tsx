import Link from "next/link";
import { db } from "@/lib/db";
import type { RequestStatus } from "@prisma/client";
const S = ["PENDING", "REVIEWING", "QUOTED", "APPROVED", "COMPLETED", "CANCELLED"];
export default async function Quotes({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const sp = await searchParams; const page = Math.max(1, Number(sp.page ?? 1)); const take = 20;
  const where = { ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" as const } }, { email: { contains: sp.q, mode: "insensitive" as const } }, { company: { contains: sp.q, mode: "insensitive" as const } }] } : {}), ...(sp.status && S.includes(sp.status) ? { status: sp.status as RequestStatus } : {}) };
  const [items, total] = await Promise.all([db.quote.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }), db.quote.count({ where })]);
  return (<div className="max-w-6xl"><h1 className="mb-4 text-2xl font-bold">Quote requests</h1>
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Search name, email, company…" className="rounded-full border px-4 py-2 text-sm" aria-label="Search" /><select name="status" defaultValue={sp.status ?? ""} className="rounded-full border px-4 py-2 text-sm" aria-label="Status"><option value="">All statuses</option>{S.map((s) => <option key={s}>{s}</option>)}</select><button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
    <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Received</th><th>Name</th><th>Service</th><th>Qty</th><th>Files</th><th>Status</th><th /></tr></thead>
      <tbody className="divide-y">{items.map((q) => <tr key={q.id}><td className="p-3">{q.createdAt.toLocaleDateString()}</td><td><b>{q.name}</b><br /><span className="text-neutral-500">{q.email}</span></td><td>{q.serviceSlug ?? "—"}</td><td>{q.quantity ?? "—"}</td><td>{(q.files as unknown[]).length}</td><td><span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-semibold">{q.status}</span></td><td className="p-3 text-right"><Link className="rounded-full border px-3 py-1" href={`/admin/quotes/${q.id}`}>Open</Link></td></tr>)}
        {!items.length && <tr><td colSpan={7} className="p-10 text-center text-neutral-500">No quote requests yet.</td></tr>}</tbody></table></div>
    <p className="mt-3 text-sm text-neutral-500">{total} total · page {page}{page > 1 && <> · <Link className="underline" href={`?page=${page - 1}`}>Previous</Link></>}{page * take < total && <> · <Link className="underline" href={`?page=${page + 1}`}>Next</Link></>}</p></div>);
}
