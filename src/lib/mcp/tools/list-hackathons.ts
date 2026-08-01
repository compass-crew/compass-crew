import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_hackathons",
  title: "List hackathons",
  description:
    "List Compass Crew hackathons visible to the signed-in user, newest first. Optionally filter by status.",
  inputSchema: {
    status: z
      .enum(["draft", "published", "registration_open", "ongoing", "judging", "completed", "archived"])
      .optional()
      .describe("Only return hackathons in this lifecycle status."),
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of hackathons to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("hackathons")
      .select("id, slug, title, status, mode, location, starts_at, ends_at, registration_closes_at, description")
      .order("starts_at", { ascending: false })
      .limit(limit ?? 10);
    if (status) query = query.eq("status", status as never);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { hackathons: data ?? [] },
    };
  },
});
