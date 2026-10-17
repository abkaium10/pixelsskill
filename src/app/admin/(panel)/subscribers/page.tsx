import { db } from "@/lib/db";
import { SubscriberDelete } from "@/components/admin/SubscriberDelete";
export default async function Subscribers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 80);
  const [items, total] = await Promise.all([db.subscriber.findMany({ where: q ? { email: { contains: q, mode: "insensitive" } } : {}, orderBy: { createdAt: "desc" }, take: 200 }), db.subscriber.count()]);
  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Newsletter subscribers</h1><p className="text-sm text-neutral-600">{total} total. Emails are collected with consent from the footer form. Sending is done in your email tool.</p></div><a href="/api/admin/subscribers/export" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white">Export CSV</a></div>
      <form className="mb-4"><input name="q" defaultValue={q} placeholder="Search email…" aria-label="Search" className="rounded-full border px-4 py-2 text-sm" /></form>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-neutral-50 text-neutral-500"><tr><th className="p-3">Email</th><th>Consent date</th><th>Source</th><th /></tr></thead>
        <tbody className="divide-y">{items.map((s) => <tr key={s.id}><td className="p-3 font-medium">{s.email}</td><td>{s.consentAt.toLocaleDateString()}</td><td>{s.source}</td><td className="p-3 text-right"><SubscriberDelete id={s.id} /></td></tr>)}{!items.length && <tr><td colSpan={4} className="p-10 text-center text-neutral-500">No subscribers yet.</td></tr>}</tbody></table></div>
    </div>
  );
}
