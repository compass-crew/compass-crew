import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listHackathonsTool from "./tools/list-hackathons";
import getHackathonTool from "./tools/get-hackathon";
import listMyRegistrationsTool from "./tools/list-my-registrations";
import listMyTeamsTool from "./tools/list-my-teams";
import listMyCertificatesTool from "./tools/list-my-certificates";
import verifyCertificateTool from "./tools/verify-certificate";
import listEventsTool from "./tools/list-events";
import listBlogPostsTool from "./tools/list-blog-posts";
import getMyProfileTool from "./tools/get-my-profile";

// The OAuth issuer must be the direct Supabase host: on publish SUPABASE_URL is
// rewritten to a proxy that fails the RFC 8414 issuer check. The project ref is
// inlined at build time by Vite.
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "compass-crew-homepage",
  title: "Compass Crew Homepage",
  version: "0.1.0",
  instructions:
    "Tools for Compass Crew, a student hackathon and community platform. Read hackathons, tracks, community events and blog posts, and read the signed-in user's own registrations, teams, certificates and profile. All calls act as the signed-in Compass Crew user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listHackathonsTool,
    getHackathonTool,
    listMyRegistrationsTool,
    listMyTeamsTool,
    listMyCertificatesTool,
    verifyCertificateTool,
    listEventsTool,
    listBlogPostsTool,
    getMyProfileTool,
  ],
});
