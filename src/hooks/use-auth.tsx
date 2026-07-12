import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const ROLES = [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
  "campus_ambassador",
  "participant",
  "guest",
] as const;

export type AppRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  organizer: "Organizer",
  judge: "Judge",
  mentor: "Mentor",
  campus_ambassador: "Campus Ambassador",
  participant: "Participant",
  guest: "Guest",
};

export interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  state: string | null;
  college: string | null;
  degree: string | null;
  year_of_study: string | null;
  branch: string | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  newsletter_opt_in: boolean;
  is_public: boolean;
}

interface AuthContextValue {
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Priority order for the "primary" dashboard target.
const ROLE_PRIORITY: AppRole[] = [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
  "campus_ambassador",
  "participant",
  "guest",
];

export function pickPrimaryRole(roles: AppRole[]): AppRole {
  for (const r of ROLE_PRIORITY) if (roles.includes(r)) return r;
  return "guest";
}

export function dashboardPathForRole(_role: AppRole): string {
  // Single dashboard route that renders role-specific content.
  return "/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const loadUserData = useCallback(async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      setRoles([]);
      return;
    }
    const [{ data: profileRow }, { data: rolesRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);
    setProfile((profileRow as Profile | null) ?? null);
    setRoles((rolesRows ?? []).map((r) => r.role as AppRole));
  }, []);

  useEffect(() => {
    // 1. Register listener FIRST (per Supabase best practice).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // Never call other supabase methods synchronously inside the callback.
      if (newSession?.user) {
        setTimeout(() => {
          void loadUserData(newSession.user.id);
        }, 0);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
      }
    });

    // 2. Then fetch current session.
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        await loadUserData(data.session.user.id);
      }
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const refresh = useCallback(async () => {
    if (session?.user) await loadUserData(session.user.id);
  }, [session, loadUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRoles([]);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const primaryRole = pickPrimaryRole(roles);
    return {
      loading,
      session,
      user: session?.user ?? null,
      profile,
      roles,
      primaryRole,
      hasRole: (r) => roles.includes(r),
      hasAnyRole: (rs) => rs.some((r) => roles.includes(r)),
      refresh,
      signOut,
    };
  }, [loading, session, profile, roles, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export function profileCompletion(p: Profile | null): number {
  if (!p) return 0;
  const fields: (keyof Profile)[] = [
    "full_name",
    "username",
    "avatar_url",
    "bio",
    "country",
    "state",
    "college",
    "degree",
    "year_of_study",
    "branch",
    "github_url",
    "linkedin_url",
    "portfolio_url",
  ];
  let filled = 0;
  for (const f of fields) {
    const v = p[f];
    if (typeof v === "string" && v.trim().length > 0) filled += 1;
  }
  if (p.skills && p.skills.length > 0) filled += 1;
  const total = fields.length + 1;
  return Math.round((filled / total) * 100);
}
