import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck, Mail, KeyRound, Ban, CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  getAdminUser,
  sendPasswordReset,
  setUserRole,
  setUserSuspended,
  type AdminUserDetail,
} from "@/lib/admin-users";
import { ROLES } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/users/$userId")({
  head: () => ({ meta: [{ title: "User — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UserDetailPage,
});

function UserDetailPage() {
  const { userId } = Route.useParams();
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  async function reload() {
    setLoading(true);
    try {
      const u = await getAdminUser(userId);
      setUser(u);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
     
  }, [userId]);

  async function toggleRole(role: string, next: boolean) {
    setBusy(true);
    try {
      await setUserRole(userId, role, next);
      toast.success(next ? `Granted ${role}` : `Revoked ${role}`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update role.");
    } finally {
      setBusy(false);
    }
  }

  async function suspend(next: boolean) {
    setBusy(true);
    try {
      await setUserSuspended(userId, next, next ? reason.trim() || null as unknown as string : undefined);
      toast.success(next ? "User suspended" : "User reactivated");
      setReason("");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setBusy(false);
    }
  }

  async function resetPw() {
    if (!user) return;
    setBusy(true);
    try {
      await sendPasswordReset(user.email);
      toast.success("Password reset email sent.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send reset.");
    } finally {
      setBusy(false);
    }
  }

  if (loading || !user) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const roleSet = new Set(user.roles);

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/admin/users"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to users</Link>
      </Button>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
          <Avatar className="h-16 w-16">
            {user.avatar_url ? <AvatarImage src={user.avatar_url} /> : null}
            <AvatarFallback>{(user.full_name ?? user.email ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold">{user.full_name || user.username || user.email}</h1>
              {user.suspended_at ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="secondary">Active</Badge>}
              {!user.email_confirmed_at && <Badge variant="outline">Email unverified</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-2"><Mail className="h-3.5 w-3.5" />{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Joined {new Date(user.joined_at).toLocaleString()} · {user.last_sign_in_at ? `Last seen ${new Date(user.last_sign_in_at).toLocaleString()}` : "Never signed in"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={resetPw} disabled={busy}>
              <KeyRound className="mr-1.5 h-4 w-4" /> Send password reset
            </Button>
            {user.suspended_at ? (
              <Button variant="outline" size="sm" onClick={() => suspend(false)} disabled={busy}>
                <CircleCheck className="mr-1.5 h-4 w-4" /> Reactivate
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={busy}><Ban className="mr-1.5 h-4 w-4" /> Suspend</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Suspend this user?</AlertDialogTitle>
                    <AlertDialogDescription>They keep their data but cannot use signed-in features until reactivated.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-1.5">
                    <Label>Reason (optional)</Label>
                    <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. abuse of platform policy" />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => suspend(true)}>Suspend</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {user.suspended_at && user.suspended_reason && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm">
            <strong>Suspension reason:</strong> {user.suspended_reason}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> Roles</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {ROLES.map((r) => (
              <label key={r} className="flex items-center gap-3 rounded-md border border-border/60 px-3 py-2 text-sm">
                <Checkbox
                  checked={roleSet.has(r)}
                  onCheckedChange={(v) => toggleRole(r, Boolean(v))}
                  disabled={busy}
                />
                <span className="flex-1">{r}</span>
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Username" value={user.username} />
            <Row label="College" value={user.college} />
            <Row label="Country" value={user.country} />
            <Row label="User ID" value={user.id} mono />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {user.recent_audit.length === 0 ? (
            <p className="text-muted-foreground">No admin activity recorded for this user.</p>
          ) : (
            user.recent_audit.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0">
                <span><Badge variant="outline" className="mr-2">{a.action}</Badge>{a.resource_type}</span>
                <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value || "—"}</span>
    </div>
  );
}
