import { createFileRoute } from "@tanstack/react-router";
import { FileCheck2 } from "lucide-react";
import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Applications — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  return (
    <AdminModulePlaceholder
      title="Applications Review"
      subtitle="Screen incoming student hackathon applicants, verify eligibility criteria, and process acceptance waves."
      icon={FileCheck2}
      capabilities={[
        {
          title: "Batch Application Screening",
          description:
            "Filter applicants by graduation year, technical track, and portfolio strength.",
          permission: "applications:read",
        },
        {
          title: "Acceptance Decisions",
          description: "Approve, waitlist, or decline applicant submissions in staggered cohorts.",
          permission: "applications:review",
        },
        {
          title: "RSVP & Confirmation Tracking",
          description: "Monitor confirmation rates and release unclaimed spots to the waitlist.",
          permission: "applications:review",
        },
        {
          title: "Travel Grant Management",
          description: "Evaluate out-of-town applicant stipends and reimbursement claims.",
          permission: "applications:review",
        },
        {
          title: "Custom Intake Forms",
          description: "Define hackathon-specific questions, resume requirements, and checkboxes.",
          permission: "applications:review",
        },
        {
          title: "Decision Notifications",
          description: "Trigger automated transactional emails with customized decision templates.",
          permission: "emails:send",
        },
      ]}
    />
  );
}
