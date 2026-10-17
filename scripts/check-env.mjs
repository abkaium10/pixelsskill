// Friendly first-run check: tells you exactly which environment variables are missing before anything fails.
import fs from "node:fs";
const env = { ...(fs.existsSync(".env") ? Object.fromEntries(fs.readFileSync(".env", "utf8").split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, "")]; })) : {}), ...process.env };
const need = [["DATABASE_URL", "Neon pooled connection string"], ["DIRECT_URL", "Neon direct connection string (migrations)"], ["NEXT_PUBLIC_SITE_URL", "Public site URL, e.g. http://localhost:3000"]];
const opt = [["CLOUDINARY_CLOUD_NAME", "uploads / media library"], ["CLOUDINARY_API_KEY", "uploads / media library"], ["CLOUDINARY_API_SECRET", "uploads / media library"], ["ADMIN_EMAIL", "creating the first admin (seed)"], ["ADMIN_PASSWORD", "creating the first admin (seed, 12+ chars)"]];
let bad = 0;
for (const [k, why] of need) if (!env[k] || /replace|USER:PASSWORD|your-/i.test(env[k])) { console.error(`✗ ${k} is missing or still a placeholder — ${why}`); bad++; }
for (const [k, why] of opt) if (!env[k] || /replace|your-|change-me/i.test(env[k])) console.warn(`! ${k} not set — needed for ${why}`);
if (env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length < 12) { console.error("✗ ADMIN_PASSWORD must be at least 12 characters"); bad++; }
if (bad) { console.error("\nCopy .env.example to .env and fill in the values above, then run again."); process.exit(1); }
console.log("✓ Environment looks good.");
