import { cache } from "react";
import { db } from "./db";
export const getContact = cache(async () => {
  const row = await db.siteSetting.findUnique({ where: { key: "contact" } }).catch(() => null);
  const v = (row?.value ?? {}) as { phone?: string; email?: string };
  return { phone: v.phone || "+1 757 540-4885", email: v.email || "info@pixelskill.com" };
});
