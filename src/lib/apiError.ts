import { NextResponse } from "next/server";
import { ApiError } from "./serviceSave";
export function handle(e: unknown) {
  if (e instanceof ApiError) return NextResponse.json({ error: e.message, fields: e.fields }, { status: e.status });
  console.error(e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
