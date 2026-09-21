import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const ROLES = [
  "super_admin",
  "organizer",
  "judge",
  "mentor",
  "participant",
  "guest",
] as const;

export type AppRole = (typeof ROLES)[number];

export const ROLE_LABEL: Record<AppRole, string> = {
  super_admin: "Super Admin",
  organizer: "Organizer",
  judge: "Judge",
  mentor: "Mentor",
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
  phone?: string | null;
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
    try {
      const [{ data: profileRow }, { data: rolesRows }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      let finalProfile = (profileRow as Profile | null) ?? null;

      // Self-healing check for new Google OAuth users where the trigger might be in flight
      if (!finalProfile) {
        await new Promise((r) => setTimeout(r, 400));
        const { data: retryRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (retryRow) {
          finalProfile = retryRow as Profile;
        } else {
          // Fallback minimal profile initialization from authenticated user identity
          const { data: userRes } = await supabase.auth.getUser();
          const u = userRes?.user;
          if (u && u.id === userId) {
            const meta = u.user_metadata || {};
            const fullName =
              meta.full_name || meta.name || (u.email ? u.email.split("@")[0] : "Builder");
            const avatarUrl = meta.avatar_url || meta.picture || null;

            await supabase.from("profiles").upsert(
              {
                id: userId,
                full_name: fullName,
                avatar_url: avatarUrl,
              },
              { onConflict: "id", ignoreDuplicates: true },
            );

            const { data: healedRow } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", userId)
              .maybeSingle();
            finalProfile = (healedRow as Profile | null) ?? null;
          }
        }
      }

      setProfile(finalProfile);

      // Ensure every authenticated user has at least the default 'participant' role
      const loadedRoles = (rolesRows ?? []).map((r) => r.role as AppRole);
      if (loadedRoles.length === 0) {
        setRoles(["participant"]);
      } else {
        setRoles(loadedRoles);
      }
    } catch (err) {
      console.warn("[AuthProvider] user data load notice:", err);
      // Fallback to participant so user is never blocked from authenticated dashboard
      setRoles((prev) => (prev.length > 0 ? prev : ["participant"]));
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Register listener FIRST (per Supabase best practice).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      setSession(newSession);

      if (newSession?.user) {
        await loadUserData(newSession.user.id);
      } else if (event === "SIGNED_OUT") {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    // 2. Then fetch current session.
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("[AuthProvider] session check note:", error.message);
        }
        if (mounted) {
          setSession(data.session);
          if (data.session?.user) {
            await loadUserData(data.session.user.id);
          }
        }
      } catch (err) {
        console.warn("[AuthProvider] getSession error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const refresh = useCallback(async () => {
    if (session?.user) await loadUserData(session.user.id);
  }, [session, loadUserData]);

  const queryClient = useQueryClient();
  const signingOutRef = useRef(false);

  const signOut = useCallback(async () => {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("[AuthProvider] signOut note:", err);
    } finally {
      setSession(null);
      setProfile(null);
      setRoles([]);
      try {
        sessionStorage.removeItem("cc:post-auth-redirect");
      } catch {
        /* ignore */
      }
      try {
        queryClient.clear();
      } catch {
        /* ignore */
      }
      signingOutRef.current = false;
    }
  }, [queryClient]);

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

export function profileCompletion(p: Profile | null, userPhone?: string | null): number {
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
  const phoneVal = (p.phone ?? userPhone ?? "").trim();
  if (phoneVal.length > 0) filled += 1;
  if (p.skills && p.skills.length > 0) filled += 1;
  const total = fields.length + 2;
  return Math.round((filled / total) * 100);
}
