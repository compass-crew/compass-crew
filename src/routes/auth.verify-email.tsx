import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { MailCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VerifySearch = { email?: string };

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — Compass Crew" },
      { name: "description", content: "Check your inbox to verify your Compass Crew account." },
    ],
  }),
  component: VerifyEmailPage,
});

const RESEND_COOLDOWN = 45;

function VerifyEmailPage() {
  const { email } = useSearch({ from: "/auth/verify-email" });
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function resend() {
    if (!email) {
      toast.error("Missing email. Please sign up again.");
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/verify-email` },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email sent again.");
      setCountdown(RESEND_COOLDOWN);
    }
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-3xl animate-blob" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="border-border/70 bg-card/70 shadow-glow backdrop-blur-xl">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
              <MailCheck className="h-9 w-9" />
              <span className="absolute -inset-2 rounded-3xl bg-gradient-brand opacity-30 blur-xl animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Check your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a verification link
                {email ? (
                  <>
                    {" "}to <span className="font-medium text-foreground">{email}</span>
                  </>
                ) : null}
                . Verify your account to start using Compass Crew.
              </p>
            </div>

            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-4 text-left text-xs text-muted-foreground">
              Didn't get the email? Check your spam folder, or wait{" "}
              {countdown > 0 ? (
                <span className="font-semibold text-foreground">{countdown}s</span>
              ) : (
                <span className="font-semibold text-primary">now</span>
              )}{" "}
              and resend below.
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={resend}
                disabled={sending || countdown > 0 || !email}
                className="bg-gradient-brand text-white hover:opacity-90"
              >
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend verification email"}
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth">Back to sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
