import { NextResponse } from "next/server";
import { editingConfig, jobForToken, outputLinks } from "@/features/editing/service";

/** Visitor status check. The job token travels in a header, never in the URL. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await editingConfig()).enabled) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const j = await jobForToken((await params).id, req.headers.get("x-job-token"));
  if (!j) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: j.id,
    status: j.status,
    error: j.status === "FAILED" ? "The job could not be completed. Please contact us." : null,
    outputs: j.status === "DONE" ? outputLinks(j.outputs) : [],
  });
}
