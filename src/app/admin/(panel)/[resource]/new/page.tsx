import { notFound } from "next/navigation";
import { collection, loadRelations } from "@/lib/cms";
import { blank } from "@/lib/defs";
import { ResourceForm } from "@/components/admin/ResourceForm";
export default async function NewResource({ params }: { params: Promise<{ resource: string }> }) {
  const def = collection((await params).resource); if (!def) notFound();
  return <ResourceForm fields={def.fields} title={`Add ${def.label}`} initial={blank(def.fields)} media={{}} relations={await loadRelations(def.fields)} save={{ url: `/api/admin/r/${def.key}`, method: "POST" }} hasStatus={def.hasStatus} backHref={`/admin/${def.key}`} afterCreate={(id) => `/admin/${def.key}/${id}`} />;
}
