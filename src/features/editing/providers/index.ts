import type { EditProvider } from "../types";
import { manualProvider } from "./manual";
import { mockProvider } from "./mock";
import { httpProvider } from "./http";

/** ADD YOUR OWN PROVIDER HERE: import it and add one line to `build`. Then select it in Admin → Online editing. */
export function getProvider(id: string, cfg: { webhookUrl?: string } = {}): EditProvider {
  switch (id) {
    case "mock": return process.env.NODE_ENV === "production" ? manualProvider : mockProvider; // mock never runs in production
    case "http": return httpProvider(cfg.webhookUrl ?? "");
    // case "my-ai": return myAiProvider();   <- your engine
    default: return manualProvider;
  }
}
