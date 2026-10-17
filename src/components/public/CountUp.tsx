"use client";
import { useEffect, useRef, useState } from "react";
/** Counts up to a numeric value when scrolled into view; non-numeric values render as-is. Respects reduced motion. */
export function CountUp({ value }: { value: string }) {
  const n = /^\d+$/.test(value) ? parseInt(value, 10) : null;
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current; if (n === null || !el || matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; io.disconnect(); let t0 = 0; const step = (t: number) => { if (!t0) t0 = t; const p = Math.min(1, (t - t0) / 900); setShown(String(Math.round(n * p))); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
    io.observe(el); return () => io.disconnect();
  }, [n]);
  return <b ref={ref} className="block font-display text-4xl text-teal">{shown}</b>;
}
