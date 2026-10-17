"use client";
import { useEffect, useRef, useState } from "react";
import { cld } from "@/lib/cld";

export type VideoSource = { src: string; type: string };
/** Full-background hero video: muted, inline, loops forever. Reduced-motion users get the poster; a pause control is always available. */
export function HeroVideo({ sources, poster, overlay }: { sources: VideoSource[]; poster?: string | null; overlay: "light" | "medium" | "strong" }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    v.muted = true; v.loop = true;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { v.pause(); setPaused(true); return; }
    void v.play().catch(() => undefined);
    const onVis = () => { if (!document.hidden && !userPaused) void v.play().catch(() => undefined); };
    const sync = () => setPaused(v.paused);
    v.addEventListener("play", sync); v.addEventListener("pause", sync); v.addEventListener("ended", () => { v.currentTime = 0; void v.play(); });
    document.addEventListener("visibilitychange", onVis);
    return () => { v.removeEventListener("play", sync); v.removeEventListener("pause", sync); document.removeEventListener("visibilitychange", onVis); };
  }, [userPaused]);
  const o = overlay === "light" ? "from-navy/55" : overlay === "strong" ? "from-navy/90" : "from-navy/80";
  return (
    <div className="absolute inset-0 overflow-hidden bg-navy">
      <video ref={ref} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto" poster={poster ? cld(poster, 1600) : undefined} aria-hidden="true" tabIndex={-1}>
        {sources.map((s) => <source key={s.src} src={s.type.startsWith("video/mp4") || s.src.startsWith("/") ? s.src : cld(s.src)} type={s.type} />)}
      </video>
      <div className={`absolute inset-0 bg-gradient-to-r ${o} via-navy/45 to-navy/10 max-md:bg-navy/70`} />
      <button type="button" aria-pressed={paused} onClick={() => { const v = ref.current; if (!v) return; if (v.paused) { setUserPaused(false); void v.play(); } else { setUserPaused(true); v.pause(); } }}
        className="absolute bottom-4 right-4 z-10 rounded-full border border-white/25 bg-navy/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-navy/85">{paused ? "▶ Play background" : "❚❚ Pause background"}</button>
    </div>
  );
}
