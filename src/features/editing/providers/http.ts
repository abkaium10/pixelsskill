import { createHmac } from "node:crypto";
import type { EditProvider } from "../types";

/**
 * Generic webhook provider. POSTs the job to your service (set the URL in Admin → Online editing) with an HMAC-SHA256
 * signature in `x-signature` (secret = EDIT_WEBHOOK_SECRET). Your service answers `{ externalId }` and later calls
 * POST /api/edit/webhook with `{ jobId, status, outputs: [{ name, url }] }` signed the same way.
 */
export function httpProvider(webhookUrl: string): EditProvider {
  return {
    id: "http", label: "HTTP webhook",
    async submit(job) {
      const secret = process.env.EDIT_WEBHOOK_SECRET;
      if (!secret) throw new Error("EDIT_WEBHOOK_SECRET is not set");
      if (!/^https:\/\//i.test(webhookUrl)) throw new Error("Webhook URL must be https");
      const body = JSON.stringify({ jobId: job.id, serviceSlug: job.serviceSlug, options: job.options, inputs: job.inputs.map((f, i) => ({ name: f.name, url: job.inputUrls[i] })) });
      const res = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json", "x-signature": createHmac("sha256", secret).update(body).digest("hex") }, body, signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`Editing service answered ${res.status}`);
      const j = await res.json().catch(() => ({}));
      return { status: "PROCESSING", externalId: typeof j.externalId === "string" ? j.externalId.slice(0, 120) : undefined };
    },
  };
}
