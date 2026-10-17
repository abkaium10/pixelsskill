import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

export const dynamic = "force-dynamic";
/** Independent admin layout: no public header/footer (those live only in the (public) route group). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <div className="min-h-screen bg-neutral-50 md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-neutral-950 p-4 text-white md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <p className="mb-5 text-lg font-bold">PixelSkill <span className="text-cyan-300">CMS</span></p>
        <AdminNav />
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-white px-6 py-3 text-sm">
          <Breadcrumbs />
          <div className="flex items-center gap-4"><Link href="/" target="_blank" className="font-medium underline-offset-4 hover:underline">View website ↗</Link><Link href="/admin/account" className="text-neutral-500 hover:underline">{admin.email}</Link><LogoutButton /></div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
