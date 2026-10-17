import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { db } from "./db";

export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const newToken = () => randomBytes(24).toString("hex"); // 48 hex chars, returned to the visitor once
export const TOKEN_RE = /^[a-f0-9]{48}$/;
export const MAX_MESSAGES = 300;

const body = z.string().transform((s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim()).pipe(z.string().min(1, "Write a message").max(1000, "Messages are limited to 1000 characters"));
export const messageSchema = z.object({ body });
export const startSchema = z.object({
  name: z.string().trim().max(80).optional().default(""),
  email: z.union([z.literal(""), z.string().trim().email().max(200)]).optional().default(""),
  page: z.string().max(200).regex(/^\/(?!\/)[^\s<>"']*$/).optional().default("/"),
});

type Msg = { id: string; sender: "VISITOR" | "ADMIN" | "SYSTEM"; body: string; createdAt: Date };
export const serialize = (m: Msg) => ({ id: m.id, sender: m.sender, body: m.body, at: m.createdAt.toISOString() });

export async function sessionFromToken(token: string | null) {
  if (!token || !TOKEN_RE.test(token)) return null;
  return db.chatSession.findUnique({ where: { tokenHash: hashToken(token) } });
}
