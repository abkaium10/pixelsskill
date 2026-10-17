import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ServiceEditor } from "@/components/admin/ServiceEditor";
import { toForm } from "@/lib/serviceForm";
export default async function EditService({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await db.service.findUnique({ where: { id }, include: { heroBefore: true, heroAfter: true, ogImage: true, cards: { orderBy: { displayOrder: "asc" }, include: { before: true, after: true } } } });
  if (!s) notFound();
  return <ServiceEditor id={s.id} initial={toForm(s)} />;
}
