import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";
import { AdminNotificationsPage } from "./admin.admin-notifications";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Notifications — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return <AdminNotificationsPage />;
}
