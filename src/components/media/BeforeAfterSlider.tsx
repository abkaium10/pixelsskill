"use client";
import { useCallback, useRef, useState } from "react";
import { cld } from "@/lib/cld";

type Props = {
  beforeSrc?: string | null; afterSrc?: string | null;
  beforeAlt?: string; afterAlt?: string; beforeLabel?: string; afterLabel?: string;
  initial?: number; aspect?: string; priority?: boolean; className?: string;
};

/** Mouse: just hover to compare (no click). Touch/pen: drag. Keyboard: arrows / Home / End. */
export function BeforeAfterSlider({ beforeSrc, afterSrc, beforeAlt = "Before editing", afterAlt = "After editing", beforeLabel = "Before", afterLabel = "After", initial = 50, aspect = "4 / 3", priority = false, className = "" }: Props) {
  const [pos, setPos] = useState(Math.min(100, Math.max(0, initial)));
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const move = useCallback((clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r || r.width === 0) return;
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  if (!beforeSrc || !afterSrc) {
    return <div className={`grid place-items-center rounded-3xl border border-dashed border-mist bg-cream text-sm text-slate-500 ${className}`} style={{ aspectRatio: aspect }}>Before/after images not set</div>;
  }
  const loading = priority ? "eager" : "lazy";
  return (
    <div
      ref={box}
      className={`group relative cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-3xl bg-mist ${className}`}
      style={{ aspectRatio: aspect }}
      onPointerDown={(e) => { dragging.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); move(e.clientX); }}
      onPointerMove={(e) => { if (e.pointerType === "mouse" || dragging.current) move(e.clientX); }}
      onPointerUp={() => { dragging.current = false; }}
      onPointerCancel={() => { dragging.current = false; }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cld(afterSrc, 1400)} alt={afterAlt} loading={loading} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cld(beforeSrc, 1400)} alt={beforeAlt} loading={loading} draggable={false} className="h-full w-full object-cover" />
      </div>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-xs font-bold text-white backdrop-blur">{beforeLabel}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-cyan px-3 py-1 text-xs font-bold text-navy backdrop-blur">{afterLabel}</span>
      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,.4)]" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy shadow-lg transition group-hover:scale-110">⇆</div>
      </div>
      <div role="slider" tabIndex={0} aria-label="Before and after comparison" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pos)}
        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          if (e.key === "ArrowLeft") { e.preventDefault(); setPos((p) => Math.max(0, p - step)); }
          if (e.key === "ArrowRight") { e.preventDefault(); setPos((p) => Math.min(100, p + step)); }
          if (e.key === "Home") setPos(0);
          if (e.key === "End") setPos(100);
        }} />
    </div>
  );
}
