import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import type { PlatformSectionSettings, ContentSectionSettings } from "@/lib/platform-settings";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Off the map</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Compass Crew — AI, Tech & Startup Community for Students" },
      {
        name: "description",
        content:
          "Compass Crew is a student-led community running hackathons, workshops, bootcamps and startup programs in AI, technology and innovation across India.",
      },
      { name: "author", content: "Compass Crew" },
      { name: "theme-color", content: "#3b46f4" },
      { property: "og:site_name", content: "Compass Crew" },
      { property: "og:title", content: "Compass Crew — AI, Tech & Startup Community for Students" },
      {
        property: "og:description",
        content:
          "Hackathons, workshops, bootcamps and startup programs — built by students, for students, across campuses in India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@compasscrew" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function PlatformStatusOverlay() {
  const { hasRole, loading } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [platformSettings, setPlatformSettings] = useState<PlatformSectionSettings | null>(null);
  const [contentSettings, setContentSettings] = useState<ContentSectionSettings | null>(null);

  useEffect(() => {
    supabase
      .from("platform_settings")
      .select("section, data")
      .in("section", ["platform", "content"])
      .then(({ data }) => {
        for (const row of data ?? []) {
          if (row.section === "platform")
            setPlatformSettings(row.data as unknown as PlatformSectionSettings);
          if (row.section === "content")
            setContentSettings(row.data as unknown as ContentSectionSettings);
        }
      });
  }, []);

  const isSuperAdmin = hasRole("super_admin");
  const isExcludedRoute = pathname.startsWith("/admin") || pathname.startsWith("/auth");

  // Maintenance mode handling
  if (platformSettings?.maintenance_mode) {
    // If not super_admin and visiting a non-admin/auth route, display maintenance screen
    if (!loading && !isSuperAdmin && !isExcludedRoute) {
      return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-4 text-center">
          <div className="max-w-md space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-lg">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Scheduled Maintenance
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {platformSettings.maintenance_message ||
                "Compass Crew is currently undergoing scheduled platform maintenance. We will be back online shortly!"}
            </p>
            <div className="pt-4">
              <Link
                to="/auth"
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Administrator Login
              </Link>
            </div>
          </div>
        </div>
      );
    }

    // If super admin is browsing, show a top banner
    if (isSuperAdmin && !pathname.startsWith("/admin")) {
      return (
        <div className="relative z-50 flex items-center justify-between bg-amber-500/15 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
          <span className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Maintenance mode is currently ACTIVE. Public visitors see maintenance screen.
          </span>
          <Link to="/admin/settings" className="underline hover:opacity-80">
            Configure in Admin Settings
          </Link>
        </div>
      );
    }
  }

  // Announcement banner
  if (
    contentSettings?.announcement_banner_enabled &&
    contentSettings.announcement_banner_text &&
    !isExcludedRoute
  ) {
    return (
      <div className="relative z-40 flex items-center justify-center gap-2 bg-gradient-brand px-4 py-1.5 text-xs font-medium text-white shadow-sm">
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span>{contentSettings.announcement_banner_text}</span>
        {contentSettings.announcement_banner_link && (
          <Link
            to={contentSettings.announcement_banner_link}
            className="ml-1 underline font-semibold hover:opacity-90"
          >
            Learn more →
          </Link>
        )}
      </div>
    );
  }

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Auth pages provide their own shell — suppress global nav/footer
  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <PlatformStatusOverlay />
          <div className="flex min-h-dvh flex-col bg-background text-foreground">
            {!isAuthPage && <Navbar />}
            <main className="flex-1">
              <Outlet />
            </main>
            {!isAuthPage && pathname !== "/" && <Footer />}
          </div>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
