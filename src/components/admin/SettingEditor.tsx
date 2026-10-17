import { getSetting, loadMedia, loadRelations } from "@/lib/cms";
import { singleton, walkMediaIds } from "@/lib/defs";
import { ResourceForm } from "./ResourceForm";
import { notFound } from "next/navigation";
export async function SettingEditor({ k, back }: { k: string; back?: string }) {
  const def = singleton(k); if (!def) notFound();
  const data = await getSetting(k);
  return <ResourceForm fields={def.fields} title={def.label} initial={data} media={await loadMedia(walkMediaIds(def.fields, data))} relations={await loadRelations(def.fields)} save={{ url: `/api/admin/s/${k}`, method: "PUT" }} hasStatus={false} backHref={back} viewHref={def.paths[0]} />;
}
