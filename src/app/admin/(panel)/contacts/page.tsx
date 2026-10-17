import { db } from "@/lib/db";
import { ContactActions } from "@/components/admin/ContactActions";
export default async function Contacts({ searchParams }: { searchParams: Promise<{ q?: string; unread?: string }> }) {
  const sp = await searchParams;
  const items = await db.contactMessage.findMany({ where: { ...(sp.unread ? { read: false } : {}), ...(sp.q ? { OR: [{ name: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }, { message: { contains: sp.q, mode: "insensitive" } }] } : {}) }, orderBy: { createdAt: "desc" }, take: 100 });
  return (<div className="max-w-4xl"><h1 className="mb-4 text-2xl font-bold">Contact messages</h1>
    <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Search…" aria-label="Search" className="rounded-full border px-4 py-2 text-sm" /><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="unread" value="1" defaultChecked={!!sp.unread} /> Unread only</label><button className="rounded-full border px-4 py-2 text-sm">Filter</button></form>
    <ul className="space-y-3">{items.map((m) => <li key={m.id} className={`rounded-2xl border bg-white p-4 ${m.read ? "" : "border-cyan-400"}`}><div className="flex flex-wrap items-center justify-between gap-2"><div><b>{m.name}</b> · <a className="text-teal underline" href={`mailto:${m.email}`}>{m.email}</a>{!m.read && <span className="ml-2 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold">New</span>}</div><ContactActions id={m.id} read={m.read} /></div>{m.subject && <p className="mt-1 text-sm font-semibold">{m.subject}</p>}<p className="mt-1 whitespace-pre-wrap text-sm">{m.message}</p><p className="mt-2 text-xs text-neutral-500">{m.createdAt.toLocaleString()}</p></li>)}
      {!items.length && <li className="rounded-2xl border bg-white p-10 text-center text-neutral-500">No messages yet.</li>}</ul></div>);
}
