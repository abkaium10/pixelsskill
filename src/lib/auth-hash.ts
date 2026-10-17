import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
export function hashPassword(pw: string): string {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(pw, salt, 64).toString("hex")}`;
}
export function verifyPassword(pw: string, stored: string): boolean {
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  return timingSafeEqual(expected, scryptSync(pw, Buffer.from(saltHex, "hex"), expected.length));
}
