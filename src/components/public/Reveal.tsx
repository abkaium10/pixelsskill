"use client";
import { useEffect, useRef } from "react";
/** Lightweight scroll reveal (IntersectionObserver + CSS). No animation library. Content is visible without JS and for reduced-motion users. */
export function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    el.classList.add("rv");
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("rv-in"); io.disconnect(); } }, { rootMargin: "0px 0px -60px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={className} style={delay ? { transitionDelay: `${delay}s` } : undefined}>{children}</div>;
}
