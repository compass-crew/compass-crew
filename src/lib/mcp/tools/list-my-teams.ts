import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_teams",
  title: "List my teams",
  description:
    "List the Compass Crew teams the signed-in user belongs to, with hackathon, role and membership status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("team_members")
      .select(
        "role, status, team:teams(id, name, tagline, is_open, is_locked, hackathon:hackathons(slug, title, status))",
      )
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { memberships: data ?? [] },
    };
  },
});
