import type { ReactNode } from "react";
/** Social links shown in the top bar, mobile menu and footer. Only platforms with a URL in Admin → Site Settings → Social are rendered. */
const P: Record<string, ReactNode> = {
  Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  Instagram: <><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></>,
  LinkedIn: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></>,
  YouTube: <><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></>,
  X: <path d="M4 4l16 16M20 4 4 20" />,
  WhatsApp: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" />,
};
export type SocialLink = { name: string; url: string };
export function socialLinks(site: Record<string, unknown>): SocialLink[] {
  const m: [string, string][] = [["Facebook", "facebook"], ["Instagram", "instagram"], ["LinkedIn", "linkedin"], ["YouTube", "youtube"], ["X", "x"], ["WhatsApp", "whatsapp"]];
  return m.map(([name, k]) => ({ name, url: String(site[k] ?? "") })).filter((s) => /^https:\/\//i.test(s.url));
}
export function SocialList({ links, className = "", size = 32, icon = 18 }: { links: SocialLink[]; className?: string; size?: number; icon?: number }) {
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Social media">
      {links.map((s) => (
        <li key={s.name}><a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} title={s.name} style={{ width: size, height: size }} className="grid place-items-center rounded-full border border-white/15 bg-white/10 text-inherit transition hover:-translate-y-0.5 hover:bg-cyan hover:text-navy">
          <svg viewBox="0 0 24 24" width={icon} height={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[s.name]}</svg></a></li>
      ))}
    </ul>
  );
}
