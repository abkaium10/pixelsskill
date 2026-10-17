import { notFound } from "next/navigation";
import { collection, getCollectionRecord, loadMedia, loadRelations } from "@/lib/cms";
import { walkMediaIds } from "@/lib/defs";
import { ResourceForm } from "@/components/admin/ResourceForm";
export default async function EditResource({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params; const def = collection(resource); if (!def) notFound();
  const rec = await getCollectionRecord(def, id); if (!rec) notFound();
  const media = await loadMedia(walkMediaIds(def.fields, rec));
  return <ResourceForm fields={def.fields} title={`Edit ${def.label}`} initial={rec} media={media} relations={await loadRelations(def.fields)} save={{ url: `/api/admin/r/${def.key}/${id}`, method: "PUT" }} hasStatus={def.hasStatus} backHref={`/admin/${def.key}`} viewHref={def.publicPath?.(rec) ?? null} />;
}
