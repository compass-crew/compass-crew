import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description: "List published Compass Crew blog posts with excerpt, tags and publish date, newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Maximum number of posts to return."),
    tag: z.string().trim().min(1).optional().describe("Only return posts carrying this tag."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, tag }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("blog_posts")
      .select("slug, title, excerpt, category, tags, author_name, published_at, reading_minutes")
      .order("published_at", { ascending: false })
      .limit(limit ?? 10);
    if (tag) query = query.contains("tags", [tag]);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
