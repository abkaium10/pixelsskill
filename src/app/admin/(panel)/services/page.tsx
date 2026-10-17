import Link from "next/link";
import { db } from "@/lib/db";
import { RowActions } from "@/components/admin/RowActions";
export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams;
  const items = await db.service.findMany({
    where: { ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : {}), ...(status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED" ? { status } : {}) },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }], include: { heroBefore: true, heroAfter: true, _count: { select: { cards: true } } },
  });
  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Services</h1><Link href="/admin/services/new" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">+ Add New Service</Link></div>
      <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={q} placeholder="Search name or slug…" className="rounded-full border px-4 py-2 text-sm" />
        <select name="status" defaultValue={status ?? ""} className="rounded-full border px-4 py-2 text-sm"><option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select>
        <button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Order</th><th>Service</th><th>Slug</th><th>Cards</th><th>Status</th><th className="p-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">{items.map((s) => (<tr key={s.id}><td className="p-3">{s.displayOrder}</td><td className="font-medium">{s.name}</td><td className="text-neutral-500">/services/{s.slug}</td><td>{s._count.cards}</td>
          <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${s.status === "PUBLISHED" ? "bg-green-100 text-green-800" : s.status === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-neutral-200"}`}>{s.status}</span></td>
          <td className="p-3 text-right"><RowActions id={s.id} slug={s.slug} status={s.status} /></td></tr>))}
          {!items.length && <tr><td colSpan={6} className="p-8 text-center text-neutral-500">No services match.</td></tr>}</tbody></table></div>
    </div>
  );
}
