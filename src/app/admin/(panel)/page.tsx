import Link from "next/link";
import { db } from "@/lib/db";
export default async function Dashboard() {
  const pend = { status: "PENDING" as const };
  const subs = await db.subscriber.count();
  const chatUnread = await db.chatSession.count({ where: { unreadAdmin: { gt: 0 } } });
  const [svcPub, svcDraft, portPub, priceCards, blogPub, blogDraft, media, quotes, quotesPend, trials, trialsPend, unread, rq, rt, rc, noSeoSvc, noSeoPort, noSeoBlog] = await Promise.all([
    db.service.count({ where: { status: "PUBLISHED" } }), db.service.count({ where: { status: "DRAFT" } }), db.portfolioItem.count({ where: { status: "PUBLISHED" } }), db.pricingCard.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "PUBLISHED" } }), db.blogPost.count({ where: { status: "DRAFT" } }), db.media.count(),
    db.quote.count(), db.quote.count({ where: pend }), db.freeTrial.count(), db.freeTrial.count({ where: pend }), db.contactMessage.count({ where: { read: false } }),
    db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, createdAt: true } }),
    db.freeTrial.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, createdAt: true } }),
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4, select: { id: true, name: true, createdAt: true } }),
    db.service.count({ where: { status: "PUBLISHED", OR: [{ metaDescription: "" }, { seoTitle: "" }] } }),
    db.portfolioItem.count({ where: { status: "PUBLISHED", OR: [{ metaDescription: "" }, { seoTitle: "" }] } }),
    db.blogPost.count({ where: { status: "PUBLISHED", OR: [{ metaDescription: "" }, { seoTitle: "" }] } }),
  ]);
  const stats: [string, number, string][] = [["Total quotes", quotes, "/admin/quotes"], ["Pending quotes", quotesPend, "/admin/quotes?status=PENDING"], ["Free trial requests", trials, "/admin/free-trial"], ["Pending trials", trialsPend, "/admin/free-trial?status=PENDING"], ["New messages", unread, "/admin/contacts?unread=1"], ["Published services", svcPub, "/admin/services"], ["Published portfolio", portPub, "/admin/portfolio"], ["Pricing cards", priceCards, "/admin/pricing"], ["Published posts", blogPub, "/admin/blog"], ["Draft posts", blogDraft, "/admin/blog?status=DRAFT"], ["Draft services", svcDraft, "/admin/services?status=DRAFT"], ["Media assets", media, "/admin/media"], ["Newsletter subscribers", subs, "/admin/subscribers"], ["Chats waiting for a reply", chatUnread, "/admin/chat"]];
  const activity = [...rq.map((x) => ({ ...x, t: "Quote", h: `/admin/quotes/${x.id}` })), ...rt.map((x) => ({ ...x, t: "Free trial", h: `/admin/free-trial/${x.id}` })), ...rc.map((x) => ({ ...x, t: "Message", h: "/admin/contacts" }))].sort((a, b) => +b.createdAt - +a.createdAt).slice(0, 8);
  const warn = noSeoSvc + noSeoPort + noSeoBlog;
  return (
    <div className="max-w-6xl"><h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([l, v, h]) => <Link key={l} href={h} className="rounded-2xl border bg-white p-5 hover:border-black"><p className="text-sm text-neutral-500">{l}</p><p className="text-3xl font-bold">{v}</p></Link>)}</div>
      {warn > 0 && <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">⚠ {warn} published item(s) are missing an SEO title or meta description. <Link href="/admin/seo" className="underline">Open SEO Center</Link></p>}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section><h2 className="mb-2 font-bold">Recent activity</h2><ul className="divide-y rounded-2xl border bg-white">{activity.map((a) => <li key={a.t + a.id}><Link href={a.h} className="flex justify-between p-4 text-sm hover:bg-neutral-50"><span><b>{a.t}</b> from {a.name}</span><span className="text-neutral-500">{a.createdAt.toLocaleDateString()}</span></Link></li>)}{!activity.length && <li className="p-4 text-sm text-neutral-500">No activity yet.</li>}</ul></section>
        <section><h2 className="mb-2 font-bold">Shortcuts</h2><div className="grid gap-2 sm:grid-cols-2">{[["/admin/services/new", "+ Service"], ["/admin/pricing/new", "+ Pricing card"], ["/admin/portfolio/new", "+ Portfolio project"], ["/admin/blog/new", "+ Blog post"], ["/admin/testimonials/new", "+ Testimonial"], ["/admin/faqs/new", "+ FAQ"], ["/admin/offers/new", "+ Offer"], ["/admin/homepage", "Edit homepage"]].map(([h, l]) => <Link key={h} href={h} className="rounded-full border bg-white px-4 py-2 text-center text-sm font-medium hover:bg-neutral-100">{l}</Link>)}</div></section>
      </div>
    </div>
  );
}
