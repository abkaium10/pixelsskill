import { SettingEditor } from "@/components/admin/SettingEditor";
import { notFound } from "next/navigation";
import { singleton } from "@/lib/defs";
export default async function PageEditor({ params }: { params: Promise<{ key: string }> }) {
  const key = `page_${(await params).key}`; if (!singleton(key)) notFound();
  return <SettingEditor k={key} back="/admin/pages" />;
}
