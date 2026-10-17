import Link from "next/link";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

const COLORS = ["#22D3EE", "#BAC095", "#8686AC", "#FFC107"];
export const Kicker = ({ children, dark }: { children: ReactNode; dark?: boolean }) => (
  <span className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-widest ${dark ? "bg-cyan/10 text-cyan" : "bg-teal/10 text-teal"}`}><i className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_0_4px_rgba(34,211,238,.25)]" />{children}</span>
);
export function SectionHead({ kicker, title, accent, text, dark }: { kicker?: string; title: string; accent?: string; text?: string; dark?: boolean }) {
  return (<Reveal><div className="mb-10 max-w-2xl">{kicker && <Kicker dark={dark}>{kicker}</Kicker>}<h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title} {accent && <span className={`bg-gradient-to-r bg-clip-text text-transparent ${dark ? "from-cyan to-[#a7f3ff]" : "from-teal to-cyan"}`}>{accent}</span>}</h2>{text && <p className={`mt-2 ${dark ? "text-white/70" : "text-slate-600"}`}>{text}</p>}</div></Reveal>);
}
export const Band = ({ tone = "", children, id }: { tone?: "" | "white" | "sage" | "navy" | "mist" | "lav" | "cream"; children: ReactNode; id?: string }) => {
  const bg = { "": "", white: "bg-white", sage: "bg-mint", navy: "bg-navy text-white", mist: "bg-ice", lav: "bg-lilac", cream: "bg-cream" }[tone];
  return <section id={id} className={`cv px-4 py-16 ${bg}`}><div className="mx-auto max-w-7xl">{children}</div></section>;
};
export function IconCards({ items, cols = 4 }: { items: { title: string; description?: string; href?: string; meta?: string }[]; cols?: 3 | 4 }) {
  return (<div className={`grid gap-5 sm:grid-cols-2 ${cols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>{items.map((it, i) => {
    const inner = (<div className="h-full rounded-3xl border border-mist/60 bg-white p-6 text-ink transition hover:-translate-y-1 hover:border-cyan hover:shadow-xl"><span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl font-extrabold text-navy" style={{ background: COLORS[i % 4] }}>{i + 1}</span><h3 className="font-bold">{it.title}</h3>{it.description && <p className="mt-1 text-sm text-slate-600">{it.description}</p>}{it.meta && <p className="mt-3 text-sm font-semibold text-teal">{it.meta} →</p>}</div>);
    return <Reveal key={i} delay={(i % 4) * 0.04} className="h-full">{it.href ? <Link href={it.href} className="block h-full">{inner}</Link> : inner}</Reveal>;
  })}</div>);
}
export function Steps({ items }: { items: { title: string; description?: string }[] }) {
  return (<ol className="grid gap-4 md:grid-cols-2">{items.map((s, i) => <li key={i} className="flex gap-4 rounded-3xl bg-white/5 p-5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cyan font-bold text-navy">{i + 1}</span><div><b className="block">{s.title}</b><span className="text-sm text-white/70">{s.description}</span></div></li>)}</ol>);
}
export function DataTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (<div className="overflow-x-auto rounded-3xl border border-mist/60 bg-white"><table className="w-full border-collapse text-left text-[15px]"><thead><tr>{head.map((h) => <th key={h} className="bg-navy px-5 py-3.5 font-semibold text-white">{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i} className="hover:bg-cyan/5">{r.map((c, j) => <td key={j} className="border-t border-mist/60 px-5 py-3.5 align-top">{c}</td>)}</tr>)}</tbody></table></div>);
}
export function Faqs({ items }: { items: { question: string; answer: string }[] }) {
  return (<div className="max-w-3xl">{items.map((q, i) => <details key={i} className="mb-3 rounded-2xl border border-mist/60 bg-white p-4"><summary className="cursor-pointer font-semibold">{q.question}</summary><p className="mt-2 whitespace-pre-line text-slate-700">{q.answer}</p></details>)}</div>);
}
export function Marquee({ words }: { words: string[] }) {
  const row = words.map((w) => <span key={w} className="after:ml-10 after:text-[10px] after:text-cyan after:content-['◆']">{w}</span>);
  return (<div className="overflow-hidden border-y border-white/10 bg-navy py-3.5 text-sm font-semibold tracking-wide text-white/80" aria-hidden="true"><div className="mq-t flex w-max gap-10 whitespace-nowrap">{row}{row}</div></div>);
}
export function CtaBand({ title, text }: { title: string; text?: string }) {
  return (<section className="bg-navy px-4 py-20 text-center text-white"><h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>{text && <p className="mx-auto mt-3 max-w-xl text-white/70">{text}</p>}<div className="mt-8 flex justify-center gap-3"><Link href="/quote" className="rounded-full bg-cyan px-8 py-3 font-semibold text-navy shadow-[0_0_30px_rgba(34,211,238,.35)] transition hover:-translate-y-0.5">Get a Quote</Link><Link href="/free-trial" className="rounded-full bg-sun px-8 py-3 font-semibold text-navy transition hover:-translate-y-0.5">Free Trial</Link></div></section>);
}
