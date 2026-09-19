import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTurnstileSiteKey } from "@/lib/public-forms.functions";

/**
 * Cloudflare Turnstile widget. Renders nothing when TURNSTILE_SITE_KEY
 * is not configured (dev-friendly). In production the server verifier
 * still enforces a token when TURNSTILE_SECRET_KEY is set.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (document.getElementById(SCRIPT_ID)) {
    return new Promise((resolve) => {
      const el = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (!el) return resolve();
      el.addEventListener("load", () => resolve(), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(s);
  });
}

export interface TurnstileHandle {
  reset: () => void;
}

export function Turnstile({
  onToken,
  size = "flexible",
  theme = "auto",
}: {
  onToken: (token: string | null) => void;
  size?: "normal" | "compact" | "flexible";
  theme?: "light" | "dark" | "auto";
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const getKey = useServerFn(getTurnstileSiteKey);

  const { data } = useQuery({
    queryKey: ["turnstile-site-key"],
    queryFn: () => getKey(),
    staleTime: Infinity,
  });
  const siteKey = data?.siteKey ?? null;

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled) return;
        setReady(true);
      })
      .catch(() => setReady(false));
    return () => {
      cancelled = true;
    };
  }, [siteKey]);

  useEffect(() => {
    if (!ready || !siteKey || !ref.current || !window.turnstile || errored) return;
    let removed = false;
    const id = window.turnstile.render(ref.current, {
      sitekey: siteKey,
      size,
      theme,
      callback: (t) => onToken(t),
      "expired-callback": () => onToken(null),
      "error-callback": () => {
        // Stop the retry loop — an invalid sitekey / non-allow-listed hostname
        // (Turnstile error 400020) keeps re-rendering otherwise. Fail-open on
        // the client; the server-side verifier is authoritative.
        if (removed) return;
        removed = true;
        setErrored(true);
        try {
          if (widgetId.current) window.turnstile?.remove(widgetId.current);
        } catch {
          /* noop */
        }
        widgetId.current = null;
        onToken(null);
      },
    });
    widgetId.current = id;
    return () => {
      removed = true;
      try {
        if (widgetId.current) window.turnstile?.remove(widgetId.current);
      } catch {
        /* noop */
      }
      widgetId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, siteKey, size, errored]);

  if (!siteKey) return null;
  if (errored) {
    return (
      <p className="text-xs text-muted-foreground" role="status">
        Bot-check unavailable on this host; submission will still be verified server-side.
      </p>
    );
  }
  return <div ref={ref} className="cf-turnstile" data-testid="cf-turnstile" />;
}
