import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createTeam } from "@/lib/teams";
import { listHackathonTracks } from "@/lib/hackathons";

export const Route = createFileRoute("/_authenticated/teams/new")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    hackathon: (s.hackathon as string) ?? undefined,
  }),
  component: NewTeamPage,
});

function NewTeamPage() {
  const { hackathon: preselected } = Route.useSearch();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const [hackathonId, setHackathonId] = useState(preselected ?? "");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [trackId, setTrackId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Hackathons where the user is registered
  const regsQ = useQuery({
    queryKey: ["registrations", "mine", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("registrations")
        .select("hackathon_id, hackathons(id, title, slug, status)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const tracksQ = useQuery({
    queryKey: ["hackathon", hackathonId, "tracks"],
    queryFn: () => (hackathonId ? listHackathonTracks(hackathonId) : Promise.resolve([])),
    enabled: !!hackathonId,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      if (!hackathonId) throw new Error("Pick a hackathon");
      if (!name.trim()) throw new Error("Team name required");
      return createTeam({
        hackathon_id: hackathonId,
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        track_id: trackId || null,
        is_open: isOpen,
        leader_id: user.id,
      });
    },
    onSuccess: (t) => {
      toast.success("Team created");
      qc.invalidateQueries({ queryKey: ["teams", "mine"] });
      router.navigate({ to: "/teams/$teamId", params: { teamId: t.id } });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not create team"),
  });

  return (
    <>
      <PageHeader
        eyebrow="New team"
        title="Create a team"
        description="Team up with friends or open your team for others to join."
      />
      <Section>
        <Card>
          <CardContent className="p-8">
            <form
              className="grid gap-5"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <div className="grid gap-2">
                <Label>Hackathon</Label>
                <Select value={hackathonId} onValueChange={setHackathonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a hackathon you've registered for" />
                  </SelectTrigger>
                  <SelectContent>
                    {(regsQ.data ?? []).length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Register for a hackathon first.
                      </div>
                    ) : (
                      (regsQ.data ?? []).map((r) => (
                        <SelectItem key={r.hackathon_id} value={r.hackathon_id}>
                          {(r as { hackathons: { title: string } | null }).hackathons?.title ??
                            "Hackathon"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Team name</Label>
                <Input
                  id="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nebula Devs"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tag">One-line tagline (optional)</Label>
                <Input
                  id="tag"
                  maxLength={140}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Building AI tutors for rural India"
                />
              </div>

              {(tracksQ.data ?? []).length > 0 && (
                <div className="grid gap-2">
                  <Label>Track (optional)</Label>
                  <Select value={trackId} onValueChange={setTrackId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick later if unsure" />
                    </SelectTrigger>
                    <SelectContent>
                      {(tracksQ.data ?? []).map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-start justify-between rounded-lg border border-border bg-muted/30 p-4">
                <div>
                  <Label>Open joining</Label>
                  <p className="text-xs text-muted-foreground">
                    Anyone with the invite code can join without an invitation.
                  </p>
                </div>
                <Switch checked={isOpen} onCheckedChange={setIsOpen} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.history.back()}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="bg-gradient-brand text-white hover:opacity-90"
                >
                  {create.isPending ? "Creating…" : "Create team"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
