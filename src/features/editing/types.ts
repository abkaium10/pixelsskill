import type { EditStatus } from "@prisma/client";

/** A private file reference (Cloudinary authenticated asset) or an external https link produced by a provider. */
export type FileRef = { publicId?: string; resourceType?: string; format?: string; name: string; url?: string };

export type JobInput = {
  id: string;
  serviceSlug: string;
  inputs: FileRef[];
  options: Record<string, string | number | boolean>;
  /** Short-lived (1 h) signed download URLs for the inputs, for providers that need to fetch the files. */
  inputUrls: string[];
};
export type SubmitResult = { externalId?: string; status?: EditStatus; outputs?: FileRef[]; error?: string };

/**
 * ONE interface to implement to plug any editing engine (AI model, third-party API, your own server) into the studio.
 * Register it in providers/index.ts and pick it in Admin → Online editing. No other file needs to change.
 */
export interface EditProvider {
  id: string;
  label: string;
  /** Called once when a job is created. Return an externalId and/or a status. Throwing marks the job FAILED. */
  submit(job: JobInput): Promise<SubmitResult>;
  /** Optional: called when an admin or visitor refreshes a PROCESSING job. */
  poll?(job: JobInput & { externalId: string | null }): Promise<{ status: EditStatus; outputs?: FileRef[]; error?: string }>;
}
