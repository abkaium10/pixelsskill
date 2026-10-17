import { z } from "zod";
export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email").max(200),
  consent: z.literal(true, { errorMap: () => ({ message: "Please tick the box to subscribe" }) }),
  website: z.string().max(0).optional().default(""), // honeypot
});
/** Neutralise spreadsheet formula injection in CSV cells (=, +, -, @, tab, CR) and escape quotes. */
export function csvCell(v: unknown): string {
  let s = v instanceof Date ? v.toISOString() : String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
/** Escape text for XML/RSS. */
export const xmlEscape = (s: string) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c] as string));
export const cleanQuery = (q: unknown) => String(q ?? "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, 80);
