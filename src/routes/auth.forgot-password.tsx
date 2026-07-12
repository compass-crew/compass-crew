import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Compass Crew" },
      { name: "description", content: "Reset your Compass Crew account password." },
    ],
  }),
  component: ForgotPasswordPage,
});

const schema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
});
type Values = z.infer<typeof schema>;

function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit({ email }: Values) {
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(email);
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
            {sent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                  <MailCheck className="h-7 w-7" />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold">Reset link sent</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    If an account exists for <span className="font-medium text-foreground">{sent}</span>,
                    you'll get a password reset link shortly.
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">
                    <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <h1 className="font-display text-2xl font-semibold">Forgot your password?</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Enter the email you used to sign up and we'll send you a reset link.
                  </p>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fp-email">Email</Label>
                    <Input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@campus.edu"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-brand text-white hover:opacity-90"
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send reset link
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/auth">
                      <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to sign in
                    </Link>
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
