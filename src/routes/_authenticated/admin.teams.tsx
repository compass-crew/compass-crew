import { createFileRoute } from "@tanstack/react-router";
import { Users2 } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/teams")({
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Teams & Submissions — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminTeamsPage,
});

function AdminTeamsPage() {
  return (
    <AdminModulePlaceholder
      title="Teams & Submissions"
      subtitle="Supervise team formations, member lock states, code plagiarism audits, and final project submissions."
      icon={Users2}
      capabilities={[
        {
          title: "Team Roster Audits",
          description: "Inspect team composition, member invitations, and leadership transfers.",
          permission: "teams:read",
        },
        {
          title: "Submission Locking",
          description: "Enforce code freeze checkpoints and deadline grace extensions.",
          permission: "teams:update",
        },
        {
          title: "Dispute Mediation",
          description: "Disband non-compliant squads or resolve ownership disagreements.",
          permission: "teams:delete",
        },
        {
          title: "Repository Integrity",
          description: "Verify GitHub repositories, commit timestamps, and open-source licenses.",
          permission: "teams:read",
        },
        {
          title: "Project Artifacts",
          description: "Review uploaded video demos, pitch decks, and architectural schematics.",
          permission: "teams:read",
        },
        {
          title: "Score Normalization",
          description: "Calibrate cross-track judge grading for equitable leaderboard standings.",
          permission: "teams:update",
        },
      ]}
    />
  );
}
