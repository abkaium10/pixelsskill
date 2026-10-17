/** Insert Cloudinary delivery transforms; non-Cloudinary (sample) URLs pass through. */
export function cld(url: string | null | undefined, w?: number): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const t = ["f_auto", "q_auto", w ? `w_${w}` : null].filter(Boolean).join(",");
  return url.replace("/upload/", `/upload/${t}/`);
}
