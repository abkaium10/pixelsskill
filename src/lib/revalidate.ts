import { revalidatePath } from "next/cache";
export function revalidateService(slug: string, oldSlug?: string) {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  if (oldSlug && oldSlug !== slug) revalidatePath(`/services/${oldSlug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/", "layout"); // navbar mega menu reads services
}
