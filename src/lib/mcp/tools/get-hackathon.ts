import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_hackathon",
  title: "Get hackathon details",
  description:
    "Get one Compass Crew hackathon by slug, including its tracks, rules, prizes and key dates.",
  inputSchema: { slug: z.string().trim().min(1).describe("The hackathon slug, e.g. 'ship-it-2026'.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: hackathon, error } = await supabase
      .from("hackathons")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!hackathon) {
      return { content: [{ type: "text", text: `No hackathon found for slug "${slug}".` }], isError: true };
    }
    const { data: tracks } = await supabase
      .from("hackathon_tracks")
      .select("id, name, description")
      .eq("hackathon_id", hackathon.id);

    const payload = { ...hackathon, tracks: tracks ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: { hackathon: payload },
    };
  },
});
