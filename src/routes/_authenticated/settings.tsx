import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Lock,
  Bell,
  Link2,
  Trash2,
  LogOut,
  ShieldCheck,
  Github,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Compass Crew" },
      { name: "description", content: "Manage your Compass Crew account." },
    ],
  }),
  component: SettingsPage,
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

function SettingsPage() {
  const { user, profile, signOut, refresh } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Account & preferences."
        description="Manage your security, notifications, connected accounts and profile visibility."
      />
      <Section>
        <div className="grid gap-6">
          {/* Profile summary */}
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white">
                  <UserIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{profile?.full_name ?? user?.email}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate({ to: "/profile" })}>
                Edit profile
              </Button>
            </CardContent>
          </Card>

          <MobileNumberCard />
          <PasswordCard />
          <ConnectedAccountsCard />
          <NotificationsCard onSaved={() => void refresh()} />

          {/* Sign out */}
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-muted text-foreground">
                  <LogOut className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">Sign out</p>
                  <p className="text-xs text-muted-foreground">End your session on this device.</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out.");
                  navigate({ to: "/" });
                }}
              >
                Sign out
              </Button>
            </CardContent>
          </Card>

          {/* Delete account */}
          <DeleteAccountCard />
        </div>
      </Section>
    </>
  );
}

/* ============================ Mobile Number ============================ */

function MobileNumberCard() {
  const { user, profile, refresh } = useAuth();
  const [phone, setPhone] = useState(
    profile?.phone || (user?.user_metadata?.phone as string | undefined) || "",
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhone(profile?.phone || (user?.user_metadata?.phone as string | undefined) || "");
  }, [profile, user]);

  async function handleSavePhone(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const cleanDigits = phone.replace(/[\s\-()+]/g, "");
    if (phone.trim() && (cleanDigits.length < 10 || cleanDigits.length > 15)) {
      toast.error("Please enter a valid mobile number (10 to 15 digits).");
      return;
    }
    setSaving(true);
    try {
      await supabase
        .from("profiles")
        .update({ phone: phone.trim() || null })
        .eq("id", user.id);
      await supabase.auth.updateUser({ data: { phone: phone.trim() || null } });
      toast.success("Mobile number updated.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update mobile number.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Phone className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Mobile number</p>
            <p className="text-xs text-muted-foreground">
              Used for hackathon coordination. Kept private.
            </p>
          </div>
        </div>
        <form
          onSubmit={handleSavePhone}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" disabled={saving} className="shrink-0">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save number
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ============================ Password ============================ */

function PasswordCard() {
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: PasswordValues) {
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated.");
    form.reset({ password: "", confirm: "" });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Security</p>
            <p className="text-xs text-muted-foreground">Change your password.</p>
          </div>
        </div>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-xs">
              New password
            </Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                className="pr-9"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw" className="text-xs">
              Confirm
            </Label>
            <div className="relative">
              <Input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                className="pr-9"
                {...form.register("confirm")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p>
            )}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ============================ Connected accounts ============================ */

function ConnectedAccountsCard() {
  const { user } = useAuth();
  const identities = user?.identities ?? [];
  const connected = new Set(identities.map((i) => i.provider));

  const providers = [
    { id: "google", label: "Google", icon: ShieldCheck, note: "Sign in with Google account" },
    { id: "github", label: "GitHub", icon: Github, note: "Coming soon" },
  ];

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Link2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Connected accounts</p>
            <p className="text-xs text-muted-foreground">
              Manage your third-party sign-in methods.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                <p.icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.note}</p>
                </div>
              </div>
              {connected.has(p.id) ? (
                <Badge className="bg-success text-success-foreground">Connected</Badge>
              ) : (
                <Badge variant="secondary">Not connected</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================ Notifications ============================ */

function NotificationsCard({ onSaved }: { onSaved: () => void }) {
  const { profile, user } = useAuth();
  const [newsletter, setNewsletter] = useState(profile?.newsletter_opt_in ?? false);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ newsletter_opt_in: newsletter })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Notification preferences saved.");
    onSaved();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              Choose what Compass Crew sends to your inbox.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
          <div>
            <p className="text-sm font-medium">Monthly newsletter</p>
            <p className="text-xs text-muted-foreground">
              Hackathons, workshops and community stories.
            </p>
          </div>
          <Switch checked={newsletter} onCheckedChange={setNewsletter} />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================ Delete ============================ */

function DeleteAccountCard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function del() {
    if (!user) return;
    // Users can only delete their own profile row from the client.
    // Full auth.users deletion requires an admin server function; we surface
    // that as a support flow rather than a self-serve destructive action.
    setDeleting(true);
    const { error } = await supabase.from("profiles").delete().eq("id", user.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await signOut();
    toast.success(
      "Your profile data has been removed. Contact support to delete your login credentials.",
    );
    navigate({ to: "/" });
  }

  return (
    <Card className="border-destructive/40">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-destructive/10 text-destructive">
            <Trash2 className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-destructive">Delete account</p>
            <p className="text-xs text-muted-foreground">
              This removes your Compass Crew profile data. To also delete your login credentials,
              contact support.
            </p>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete my profile</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Compass Crew profile?</AlertDialogTitle>
              <AlertDialogDescription>
                This action removes your public profile and cannot be undone. Type your email
                <span className="font-mono"> {user?.email} </span>to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input
              placeholder="you@campus.edu"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={del}
                disabled={deleting || confirmEmail !== user?.email}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
