import Link from "next/link";
import { notFound } from "next/navigation";
import { collection, listCollection } from "@/lib/cms";
import { ResourceRowActions } from "@/components/admin/ResourceRowActions";

const badge = (s: string) => (s === "PUBLISHED" ? "bg-green-100 text-green-800" : s === "DRAFT" ? "bg-amber-100 text-amber-800" : "bg-neutral-200 text-neutral-700");
export default async function ResourceList({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; status?: string; page?: string }> }) {
  const def = collection((await params).resource); if (!def) notFound();
  const sp = await searchParams; const page = Number(sp.page ?? 1);
  const { items, total, pages } = await listCollection(def, { q: sp.q, status: sp.status, page });
  const qs = (p: number) => `?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.status ? { status: sp.status } : {}), page: String(p) })}`;
  return (
    <div className="max-w-6xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{def.plural}</h1><Link href={`/admin/${def.key}/new`} className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">+ Add {def.label}</Link></div>
      <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Search…" aria-label="Search" className="rounded-full border px-4 py-2 text-sm" />
        {def.hasStatus && <select name="status" defaultValue={sp.status ?? ""} aria-label="Status" className="rounded-full border px-4 py-2 text-sm"><option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select>}
        <button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm">
        <thead className="bg-neutral-50 text-neutral-500"><tr>{def.columns.map((c) => <th key={c.name} className="p-3">{c.label}</th>)}<th className="p-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">{items.map((r) => (<tr key={r.id}>{def.columns.map((c) => { const v = r[c.name]; return (<td key={c.name} className="p-3">
          {c.kind === "status" ? <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge(String(v))}`}>{String(v)}</span> : c.kind === "bool" ? (v ? "Yes" : "No") : c.kind === "date" ? (v ? new Date(v).toLocaleDateString() : "—") : c.kind === "money" ? Number(v).toFixed(2) : String(v ?? "—")}</td>); })}
          <td className="p-3 text-right"><ResourceRowActions resource={def.key} id={r.id} status={def.hasStatus ? r.status : undefined} publicHref={def.publicPath?.(r)} canArchive={def.hasStatus} /></td></tr>))}
          {!items.length && <tr><td colSpan={def.columns.length + 1} className="p-10 text-center text-neutral-500">Nothing here yet. Click “Add {def.label}” to create the first one.</td></tr>}</tbody></table></div>
      <div className="mt-4 flex items-center justify-between text-sm"><span className="text-neutral-500">{total} total</span><span className="flex gap-2">{page > 1 && <Link className="rounded-full border px-3 py-1" href={qs(page - 1)}>Previous</Link>}<span>Page {page} / {pages}</span>{page < pages && <Link className="rounded-full border px-3 py-1" href={qs(page + 1)}>Next</Link>}</span></div>
    </div>
  );
}
