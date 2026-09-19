import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Save, User as UserIcon, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, profileCompletion } from "@/hooks/use-auth";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Compass Crew" },
      { name: "description", content: "Manage your Compass Crew profile." },
    ],
  }),
  component: ProfilePage,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(100),
  username: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9_.-]*$/, "Only letters, numbers, dot, dash, underscore")
    .optional()
    .or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  avatar_url: z.string().trim().max(500).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  state: z.string().trim().max(80).optional().or(z.literal("")),
  college: z.string().trim().max(160).optional().or(z.literal("")),
  degree: z.string().trim().max(80).optional().or(z.literal("")),
  year_of_study: z.string().trim().max(20).optional().or(z.literal("")),
  branch: z.string().trim().max(80).optional().or(z.literal("")),
  skills: z.string().trim().max(400).optional().or(z.literal("")),
  github_url: z
    .string()
    .trim()
    .max(255)
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Must be a valid URL starting with http:// or https://",
    })
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .trim()
    .max(255)
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Must be a valid URL starting with http:// or https://",
    })
    .optional()
    .or(z.literal("")),
  portfolio_url: z
    .string()
    .trim()
    .max(255)
    .refine((v) => !v || /^https?:\/\//i.test(v), {
      message: "Must be a valid URL starting with http:// or https://",
    })
    .optional()
    .or(z.literal("")),
  is_public: z.boolean(),
});
type Values = z.infer<typeof schema>;

function ProfilePage() {
  const { profile, user, refresh } = useAuth();
  const [saving, setSaving] = useState(false);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      username: "",
      bio: "",
      avatar_url: "",
      country: "",
      state: "",
      college: "",
      degree: "",
      year_of_study: "",
      branch: "",
      skills: "",
      github_url: "",
      linkedin_url: "",
      portfolio_url: "",
      is_public: true,
    },
  });

  useEffect(() => {
    if (!profile) return;
    form.reset({
      full_name: profile.full_name ?? "",
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      avatar_url: profile.avatar_url ?? "",
      country: profile.country ?? "",
      state: profile.state ?? "",
      college: profile.college ?? "",
      degree: profile.degree ?? "",
      year_of_study: profile.year_of_study ?? "",
      branch: profile.branch ?? "",
      skills: profile.skills.join(", "),
      github_url: profile.github_url ?? "",
      linkedin_url: profile.linkedin_url ?? "",
      portfolio_url: profile.portfolio_url ?? "",
      is_public: profile.is_public,
    });
  }, [profile, form]);

  async function onSubmit(values: Values) {
    if (!user) return;
    setSaving(true);
    const skills = (values.skills ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        username: values.username || null,
        bio: values.bio || null,
        avatar_url: values.avatar_url || null,
        country: values.country || null,
        state: values.state || null,
        college: values.college || null,
        degree: values.degree || null,
        year_of_study: values.year_of_study || null,
        branch: values.branch || null,
        skills,
        github_url: values.github_url || null,
        linkedin_url: values.linkedin_url || null,
        portfolio_url: values.portfolio_url || null,
        is_public: values.is_public,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved.");
    void refresh();
  }

  const completion = profileCompletion(profile);
  const isPublic = form.watch("is_public");
  const avatarUrl = form.watch("avatar_url");
  const fullName = form.watch("full_name");

  return (
    <>
      <PageHeader
        eyebrow="Your profile"
        title="Make it yours."
        description="This is what mentors, teammates and organizers see when they meet you on Compass Crew."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Sidebar */}
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
                  <AvatarFallback className="bg-gradient-brand text-white">
                    {(fullName || user?.email || "?").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{fullName || "Unnamed"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium">Profile completion</p>
                  <span className="font-semibold text-primary">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Complete your profile to unlock hackathon registrations and mentor matching.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    {isPublic ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                    Visibility
                  </span>
                  <Badge variant="secondary">{isPublic ? "Public" : "Private"}</Badge>
                </div>
                <p className="mt-1.5 text-muted-foreground">
                  {isPublic
                    ? "Anyone in the crew can find you and see your profile."
                    : "Only you and admins can see your profile."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <SectionTitle icon={UserIcon} title="Identity" />
                <Grid2>
                  <F label="Full name" error={form.formState.errors.full_name?.message}>
                    <Input {...form.register("full_name")} />
                  </F>
                  <F label="Username" error={form.formState.errors.username?.message}>
                    <Input placeholder="ada.lovelace" {...form.register("username")} />
                  </F>
                </Grid2>
                <F label="Avatar URL" error={form.formState.errors.avatar_url?.message}>
                  <Input placeholder="https://…" {...form.register("avatar_url")} />
                </F>
                <F label="Bio" error={form.formState.errors.bio?.message}>
                  <Textarea
                    rows={3}
                    placeholder="Tell the crew what you're building."
                    {...form.register("bio")}
                  />
                </F>

                <SectionTitle title="Location" />
                <Grid2>
                  <F label="Country">
                    <Input {...form.register("country")} />
                  </F>
                  <F label="State">
                    <Input {...form.register("state")} />
                  </F>
                </Grid2>

                <SectionTitle title="Education" />
                <F label="College / University">
                  <Input {...form.register("college")} />
                </F>
                <Grid3>
                  <F label="Degree">
                    <Input {...form.register("degree")} />
                  </F>
                  <F label="Year">
                    <Input {...form.register("year_of_study")} />
                  </F>
                  <F label="Branch">
                    <Input {...form.register("branch")} />
                  </F>
                </Grid3>

                <SectionTitle title="Skills" />
                <F label="Skills (comma separated)" error={form.formState.errors.skills?.message}>
                  <Input
                    placeholder="React, Python, ML, Product design"
                    {...form.register("skills")}
                  />
                </F>

                <SectionTitle title="Links" />
                <Grid2>
                  <F label="GitHub">
                    <Input placeholder="https://github.com/you" {...form.register("github_url")} />
                  </F>
                  <F label="LinkedIn">
                    <Input
                      placeholder="https://linkedin.com/in/you"
                      {...form.register("linkedin_url")}
                    />
                  </F>
                </Grid2>
                <F label="Portfolio">
                  <Input placeholder="https://you.dev" {...form.register("portfolio_url")} />
                </F>

                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
                  <div>
                    <p className="font-medium">Public profile</p>
                    <p className="text-xs text-muted-foreground">
                      Allow other builders to discover your profile on Compass Crew.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("is_public")}
                    onCheckedChange={(v) => form.setValue("is_public", v)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-brand text-white hover:opacity-90"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-2 pt-2">
      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
}
function F({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
