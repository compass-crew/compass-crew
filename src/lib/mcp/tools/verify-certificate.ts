import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "verify_certificate",
  title: "Verify a certificate",
  description:
    "Verify a Compass Crew certificate by its code and return the minimal public verification details.",
  inputSchema: { code: z.string().trim().min(4).describe("The certificate verification code.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ code }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("verify_certificate", { _code: code });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return { content: [{ type: "text", text: `No certificate found for code "${code}".` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(row) }],
      structuredContent: { certificate: row },
    };
  },
});
