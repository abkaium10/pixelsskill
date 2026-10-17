import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/public/PageHero";
import { EditStudio } from "@/components/public/EditStudio";
import { availableServices, editingConfig } from "@/features/editing/service";

export const dynamic = "force-dynamic"; // reads the feature flag on every request
export const metadata: Metadata = { title: "Online Editing Studio", description: "Upload your images, choose a service and get them edited.", robots: { index: false, follow: false } };

/** Feature-flagged: 404 until it is switched on in Admin → Online editing (AI-ready). */
export default async function EditPage() {
  const cfg = await editingConfig();
  if (!cfg.enabled) notFound();
  const services = await availableServices();
  return (
    <>
      <PageHero title="Online editing studio" description="Choose a service, upload your images and we will take it from there." tone="teal" />
      <section className="px-4 py-14"><div className="mx-auto max-w-3xl">
        {services.length ? <EditStudio services={services} maxFiles={cfg.maxFiles} disclaimer={cfg.disclaimer} /> : <p className="rounded-2xl bg-white p-8 text-center text-slate-500">No services are available in the studio yet.</p>}
      </div></section>
    </>
  );
}
