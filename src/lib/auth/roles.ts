/**
 * Compass Crew Role & Permission System
 *
 * Centralized, type-safe definitions for database roles and granular permissions.
 * Maps directly to PostgreSQL public.app_role enum.
 */

export const APP_ROLES = [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
  "campus_ambassador",
  "participant",
  "guest",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ADMINISTRATIVE_ROLES: readonly AppRole[] = ["super_admin"] as const;

export type AdministrativeRole = (typeof ADMINISTRATIVE_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: "Super Admin",
  organizer: "Organizer",
  judge: "Judge",
  mentor: "Mentor",
  campus_ambassador: "Campus Ambassador",
  participant: "Participant",
  guest: "Guest",
};

export const ROLE_DESCRIPTIONS: Record<AppRole, string> = {
  super_admin: "Full platform management, security, users, and system configuration",
  organizer: "Manage hackathons, assign judges, review submissions, and view registrations",
  judge: "Score and evaluate assigned submissions during active hackathon rounds",
  mentor: "Guide and support registered teams and review mentorship requests",
  campus_ambassador: "Lead outreach, student community growth, and campus engagement",
  participant: "Form teams, register for hackathons, submit projects, and earn certificates",
  guest: "Public visitor with limited read access",
};

export const ROLE_BADGE_VARIANTS: Record<AppRole, { bg: string; text: string; border: string }> = {
  super_admin: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  organizer: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  judge: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  mentor: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
  },
  campus_ambassador: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  participant: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  guest: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/30",
  },
};

/**
 * Priority order for dashboard targeting and primary identity resolution.
 */
export const ROLE_PRIORITY: readonly AppRole[] = [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
  "campus_ambassador",
  "participant",
  "guest",
] as const;

/**
 * Granular platform permissions across all administrative and operational areas.
 */
export const PERMISSIONS = [
  // User Management
  "users:read",
  "users:update",
  "users:suspend",
  "users:manage_roles",

  // Hackathons & Competitions
  "hackathons:read",
  "hackathons:create",
  "hackathons:update",
  "hackathons:delete",

  // Events & Workshops
  "events:read",
  "events:create",
  "events:update",
  "events:delete",

  // Teams & Submissions
  "teams:read",
  "teams:manage",
  "submissions:read",
  "submissions:score",

  // Applications (Partners, Mentors, Ambassadors)
  "applications:read",
  "applications:review",

  // Sponsors & Partners
  "sponsors:read",
  "sponsors:manage",

  // CMS & Content
  "content:read",
  "content:create",
  "content:update",
  "content:delete",

  // Communications & Notifications
  "emails:read",
  "emails:send",
  "notifications:broadcast",

  // Analytics & Intelligence
  "analytics:read",

  // Platform Security & Settings
  "security:read",
  "security:manage",
  "settings:read",
  "settings:manage",

  // System & Audit
  "audit:read",
  "system:read",
  "system:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/**
 * Centralized Permission Matrix
 * Maps each role to its allowed set of permissions.
 * super_admin possesses universal access (*).
 */
export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  super_admin: PERMISSIONS, // All permissions
  organizer: [
    "hackathons:read",
    "hackathons:create",
    "hackathons:update",
    "events:read",
    "events:create",
    "events:update",
    "teams:read",
    "teams:manage",
    "submissions:read",
    "applications:read",
    "applications:review",
    "content:read",
    "analytics:read",
  ],
  judge: ["hackathons:read", "teams:read", "submissions:read", "submissions:score"],
  mentor: ["hackathons:read", "teams:read", "submissions:read"],
  campus_ambassador: ["events:read", "hackathons:read"],
  participant: ["hackathons:read", "events:read", "teams:read"],
  guest: ["hackathons:read", "events:read"],
};

/**
 * Resolves whether a collection of user roles contains the requested permission.
 */
export function hasPermission(userRoles: readonly AppRole[], permission: Permission): boolean {
  if (userRoles.includes("super_admin")) return true;
  return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

/**
 * Resolves whether a user has any administrative role.
 */
export function isAdministrativeRole(role: AppRole): boolean {
  return ADMINISTRATIVE_ROLES.includes(role);
}

/**
 * Resolves whether a collection of user roles contains at least one administrative role.
 */
export function hasAdminAccess(userRoles: readonly AppRole[]): boolean {
  return userRoles.some((r) => ADMINISTRATIVE_ROLES.includes(r));
}

/**
 * Selects the highest priority role from a user's role list.
 */
export function pickPrimaryRole(roles: readonly AppRole[]): AppRole {
  for (const r of ROLE_PRIORITY) {
    if (roles.includes(r)) return r;
  }
  return "guest";
}
