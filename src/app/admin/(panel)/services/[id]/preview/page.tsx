import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ServiceDetail } from "@/components/public/ServiceDetail";
import { serviceInclude } from "@/lib/services";
/** Draft preview. Protected by the (panel) layout auth check; never reachable publicly. */
export default async function Preview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await db.service.findUnique({ where: { id }, include: serviceInclude });
  if (!s) notFound();
  const related = s.relatedSlugs.length ? await db.service.findMany({ where: { slug: { in: s.relatedSlugs } }, select: { slug: true, name: true, shortDescription: true } }) : [];
  return (<div className="-m-6"><p className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-900">Preview · status: {s.status}</p><ServiceDetail s={s} related={related} /></div>);
}
