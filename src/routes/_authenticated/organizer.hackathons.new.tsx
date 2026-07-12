import { useState } from "react";
import { createFileRoute, useRouter, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify, type HackathonMode, type HackathonStatus } from "@/lib/hackathons";

export const Route = createFileRoute("/_authenticated/organizer/hackathons/new")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (data ?? []).map((r) => r.role);
    if (!roles.includes("organizer") && !roles.includes("super_admin")) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: NewHackathonPage,
});

function NewHackathonPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [mode, setMode] = useState<HackathonMode>("online");
  const [status, setStatus] = useState<HackathonStatus>("draft");
  const [location, setLocation] = useState("");
  const [minTeam, setMinTeam] = useState(1);
  const [maxTeam, setMaxTeam] = useState(4);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [rules, setRules] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Sign in required");
      if (!title.trim()) throw new Error("Title is required");
      const baseSlug = slugify(title) || `hackathon-${Date.now()}`;
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      const { data, error } = await supabase
        .from("hackathons")
        .insert({
          title: title.trim(),
          slug,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          theme: theme.trim() || null,
          mode,
          status,
          location: location.trim() || null,
          min_team_size: Math.max(1, minTeam),
          max_team_size: Math.max(minTeam, maxTeam),
          starts_at: startsAt || null,
          ends_at: endsAt || null,
          submission_deadline: submissionDeadline || null,
          eligibility: eligibility.trim() || null,
          rules: rules.trim() || null,
          created_by: userData.user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Hackathon created");
      if (data.status === "draft") {
        router.navigate({ to: "/organizer/hackathons" });
      } else {
        router.navigate({ to: "/hackathons/$slug", params: { slug: data.slug } });
      }
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not create hackathon"),
  });

  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="Create a hackathon"
        description="Set up the essentials now — you can add tracks, prizes, judges and criteria after it's created."
      />
      <Section>
        <Card>
          <CardContent className="p-8">
            <form
              className="grid gap-6"
              onSubmit={(e) => { e.preventDefault(); create.mutate(); }}
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Compass Build Season 2026" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="A one-line pitch that hooks builders" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Input id="theme" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="AI for Bharat, Climate, Health, etc." />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this hackathon? What will builders take away?" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Mode</Label>
                  <Select value={mode} onValueChange={(v) => setMode(v as HackathonMode)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="in_person">In-person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as HackathonStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (private)</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="registrations_open">Registrations Open</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Bengaluru, India" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="minTeam">Min team size</Label>
                  <Input id="minTeam" type="number" min={1} value={minTeam} onChange={(e) => setMinTeam(parseInt(e.target.value) || 1)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxTeam">Max team size</Label>
                  <Input id="maxTeam" type="number" min={1} value={maxTeam} onChange={(e) => setMaxTeam(parseInt(e.target.value) || 1)} />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="startsAt">Starts</Label>
                  <Input id="startsAt" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endsAt">Ends</Label>
                  <Input id="endsAt" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="submissionDeadline">Submissions close</Label>
                  <Input id="submissionDeadline" type="datetime-local" value={submissionDeadline} onChange={(e) => setSubmissionDeadline(e.target.value)} />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="eligibility">Eligibility</Label>
                <Textarea id="eligibility" rows={3} value={eligibility} onChange={(e) => setEligibility(e.target.value)} placeholder="Who can participate?" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="rules">Rules</Label>
                <Textarea id="rules" rows={4} value={rules} onChange={(e) => setRules(e.target.value)} placeholder="Code of conduct, IP rules, submission requirements…" />
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" size="lg" disabled={create.isPending} className="bg-gradient-brand text-white hover:opacity-90">
                  {create.isPending ? "Creating…" : "Create hackathon"}
                </Button>
                <Button type="button" size="lg" variant="outline" onClick={() => router.navigate({ to: "/organizer/hackathons" })}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
