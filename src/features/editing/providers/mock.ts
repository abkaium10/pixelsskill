import type { EditProvider } from "../types";
/** Development provider: completes instantly and returns the uploaded files unchanged. Lets you test the whole flow without any AI. */
export const mockProvider: EditProvider = { id: "mock", label: "Mock (development)", async submit(job) { return { status: "DONE", externalId: `mock-${job.id}`, outputs: job.inputs }; } };
