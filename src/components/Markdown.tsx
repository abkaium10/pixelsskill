import type { ReactNode } from "react";
/** Safe Markdown subset → React elements. No raw HTML is ever interpreted, so content cannot inject scripts. */
const SAFE = /^(https?:\/\/|\/(?!\/)|mailto:|tel:|#)/i;
function inline(src: string, key: string): ReactNode[] {
  const out: ReactNode[] = []; let rest = src; let i = 0;
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/;
  while (rest) {
    const m = re.exec(rest);
    if (!m) { out.push(rest); break; }
    if (m.index > 0) out.push(rest.slice(0, m.index));
    const k = `${key}-${i++}`;
    if (m[2] !== undefined && m[3]) { if (/^(https:\/\/res\.cloudinary\.com\/|\/(?!\/))/i.test(m[3])) out.push(/* eslint-disable-next-line @next/next/no-img-element */ <img key={k} src={m[3]} alt={m[2]} loading="lazy" className="my-4 h-auto max-w-full rounded-xl" />); }
    else if (m[4] && m[5]) out.push(SAFE.test(m[5]) ? <a key={k} href={m[5]} className="text-teal underline underline-offset-2" rel={m[5].startsWith("http") ? "noopener noreferrer" : undefined}>{m[4]}</a> : m[4]);
    else if (m[6]) out.push(<strong key={k}>{m[6]}</strong>);
    else if (m[7]) out.push(<em key={k}>{m[7]}</em>);
    else if (m[8]) out.push(<code key={k} className="rounded bg-black/5 px-1">{m[8]}</code>);
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}
export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  const lines = (source ?? "").replace(/\r/g, "").split("\n"); const nodes: ReactNode[] = []; let i = 0, n = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m: RegExpExecArray | null;
    if ((m = /^(#{1,4})\s+(.*)$/.exec(l))) { const lvl = Math.min(4, Math.max(2, m[1].length)); const Tag = (`h${lvl}`) as "h2" | "h3" | "h4"; nodes.push(<Tag key={n++} id={m[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")} className="mb-3 mt-8 scroll-mt-28 font-display font-bold">{inline(m[2], `h${n}`)}</Tag>); i++; continue; }
    if (/^\|/.test(l)) { const rows: string[][] = []; while (i < lines.length && /^\|/.test(lines[i])) rows.push(lines[i++].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim())); const body = rows.filter((r) => !r.every((c) => /^[-: ]*$/.test(c))); nodes.push(<div key={n++} className="my-6 overflow-x-auto"><table className="w-full border-collapse text-sm"><thead><tr>{body[0].map((c, j) => <th key={j} className="border border-mist bg-cream p-2 text-left">{inline(c, `th${n}${j}`)}</th>)}</tr></thead><tbody>{body.slice(1).map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j} className="border border-mist p-2 align-top">{inline(c, `td${n}${k}${j}`)}</td>)}</tr>)}</tbody></table></div>); continue; }
    if (/^\s*[-*]\s+/.test(l)) { const items: string[] = []; while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, "")); nodes.push(<ul key={n++} className="my-4 list-disc space-y-1 pl-6">{items.map((t, j) => <li key={j}>{inline(t, `u${n}${j}`)}</li>)}</ul>); continue; }
    if (/^\s*\d+\.\s+/.test(l)) { const items: string[] = []; while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\.\s+/, "")); nodes.push(<ol key={n++} className="my-4 list-decimal space-y-1 pl-6">{items.map((t, j) => <li key={j}>{inline(t, `o${n}${j}`)}</li>)}</ol>); continue; }
    if (/^>\s?/.test(l)) { const q: string[] = []; while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, "")); nodes.push(<blockquote key={n++} className="my-4 border-l-4 border-cyan pl-4 italic">{inline(q.join(" "), `q${n}`)}</blockquote>); continue; }
    const p: string[] = []; while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|\s*[-*]\s|\s*\d+\.\s|>|\|)/.test(lines[i])) p.push(lines[i++]);
    nodes.push(<p key={n++} className="my-4 leading-7">{inline(p.join(" "), `p${n}`)}</p>);
  }
  return <div className={className}>{nodes}</div>;
}
