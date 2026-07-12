import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Compass Crew" },
      { name: "description", content: "Choose a new password for your Compass Crew account." },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type Values = z.infer<typeof schema>;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    // Supabase attaches a recovery session automatically when the user opens
    // the email link. Confirm the session is present before allowing update.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(values: Values) {
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1500);
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-3xl animate-blob" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="border-border/70 bg-card/70 shadow-glow backdrop-blur-xl">
          <CardContent className="space-y-6 p-8">
            {done ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h1 className="font-display text-2xl font-semibold">Password updated</h1>
                <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="flex items-center gap-2 font-display text-2xl font-semibold">
                    <ShieldCheck className="h-6 w-6 text-primary" /> Set a new password
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a strong new password for your account.
                  </p>
                </div>
                {!ready ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying reset link…
                  </div>
                ) : (
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-pw">New password</Label>
                      <Input
                        id="rp-pw"
                        type="password"
                        autoComplete="new-password"
                        {...form.register("password")}
                      />
                      {form.formState.errors.password && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="rp-confirm">Confirm password</Label>
                      <Input
                        id="rp-confirm"
                        type="password"
                        autoComplete="new-password"
                        {...form.register("confirm")}
                      />
                      {form.formState.errors.confirm && (
                        <p className="text-xs text-destructive">
                          {form.formState.errors.confirm.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-brand text-white hover:opacity-90"
                    >
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Update password
                    </Button>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
