import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSetting } from "./cms";
import { rateLimit } from "./rateLimit";

/** Shared guard for public chat endpoints: chat enabled, same-origin, per-IP rate limit, small bodies. */
export async function chatGuard(name: string, max: number, windowSec: number) {
  const h = await headers();
  const settings = await getSetting("chat");
  if (!settings.enabled) return { res: NextResponse.json({ enabled: false }, { status: 404 }) };
  const origin = h.get("origin");
  if (origin && new URL(origin).host !== h.get("host")) return { res: NextResponse.json({ error: "Bad origin" }, { status: 403 }) };
  if (Number(h.get("content-length") ?? 0) > 20_000) return { res: NextResponse.json({ error: "Request too large" }, { status: 413 }) };
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!rateLimit(`chat:${name}:${ip}`, max, windowSec * 1000)) return { res: NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 }) };
  return { settings, token: h.get("x-chat-token"), ip };
}
