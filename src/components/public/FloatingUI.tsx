"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
/** Back-to-top button (after scrolling) and a sticky quote / free-trial bar on small screens. */
export function FloatingUI({ whatsapp, chat }: { whatsapp?: string; chat?: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const on = () => setShow(window.scrollY > 700); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  return (
    <>
      {whatsapp && /^https:\/\//i.test(whatsapp) && <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" title="Chat on WhatsApp" className="fixed bottom-20 left-4 z-[55] grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105 md:bottom-5"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.4 8.4 0 1 1 21 11.5z" /></svg></a>}
      <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`fixed right-4 z-[55] grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-navy text-xl text-white shadow-xl transition ${chat ? "bottom-[9.25rem] md:bottom-24" : "bottom-20 md:bottom-5"} ${show ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"}`}>↑</button>
      <div className="fixed inset-x-0 bottom-0 z-[54] grid grid-cols-2 gap-2 border-t border-white/10 bg-navy/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
        <Link href="/quote" className="rounded-full bg-cyan py-2.5 text-center text-sm font-bold text-navy">Get a Quote</Link>
        <Link href="/free-trial" className="rounded-full bg-sun py-2.5 text-center text-sm font-bold text-navy">Free Trial</Link>
      </div>
    </>
  );
}
