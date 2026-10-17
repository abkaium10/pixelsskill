"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function Breadcrumbs() {
  const parts = usePathname().split("/").filter(Boolean); let acc = "";
  return (<nav aria-label="Breadcrumb" className="text-sm text-neutral-500"><ol className="flex flex-wrap items-center gap-1">{parts.map((p, i) => { acc += `/${p}`; const last = i === parts.length - 1; const label = p.length > 20 ? "…" : p.replace(/-/g, " "); return (<li key={acc} className="flex items-center gap-1 capitalize">{i > 0 && <span aria-hidden>/</span>}{last ? <span aria-current="page" className="font-medium text-neutral-800">{label}</span> : <Link href={acc} className="hover:underline">{label}</Link>}</li>); })}</ol></nav>);
}
