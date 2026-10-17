import type { EditProvider } from "../types";
/** Default provider: nothing is automated. The job waits in Admin → Editing jobs for a human editor, who uploads the result. */
export const manualProvider: EditProvider = { id: "manual", label: "Manual (human editors)", async submit() { return { status: "QUEUED" }; } };
