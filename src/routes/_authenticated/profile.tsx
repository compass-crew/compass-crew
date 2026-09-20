import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  User as UserIcon,
  Eye,
  EyeOff,
  Camera,
  Trash2,
  Lock,
  Phone,
  ShieldCheck,
} from "lucide-react";
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
import { uploadProfileAvatarFn, removeProfileAvatarFn } from "@/lib/profile.functions";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Compass Crew" },
      {
        name: "description",
        content: "Manage your Compass Crew profile, credentials, and settings.",
      },
    ],
  }),
  component: ProfilePage,
});

/* ============================ Schemas ============================ */

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  username: z
    .string()
    .trim()
    .max(40)
    .regex(/^[a-zA-Z0-9_.-]*$/, "Only letters, numbers, dot, dash, underscore")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(25)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => {
        if (!v) return true;
        const digits = v.replace(/[\s\-()+]/g, "");
        return (
          digits.length >= 10 &&
          digits.length <= 15 &&
          /^\+?[0-9]+$/.test(v.replace(/[\s\-()]/g, ""))
        );
      },
      { message: "Enter a valid mobile number (e.g. +91 9876543210 or 9876543210)" },
    ),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
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
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type PasswordValues = z.infer<typeof passwordSchema>;

/* ============================ Profile Page ============================ */

function ProfilePage() {
  const { profile, user, session, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      username: "",
      phone: "",
      bio: "",
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
    if (!profile && !user) return;
    const userMetaPhone = (user?.user_metadata?.phone as string | undefined) ?? "";
    const existingPhone = profile?.phone || userMetaPhone;

    form.reset({
      full_name: profile?.full_name ?? (user?.user_metadata?.full_name as string | undefined) ?? "",
      username: profile?.username ?? "",
      phone: existingPhone,
      bio: profile?.bio ?? "",
      country: profile?.country ?? "",
      state: profile?.state ?? "",
      college: profile?.college ?? "",
      degree: profile?.degree ?? "",
      year_of_study: profile?.year_of_study ?? "",
      branch: profile?.branch ?? "",
      skills: (profile?.skills ?? []).join(", "),
      github_url: profile?.github_url ?? "",
      linkedin_url: profile?.linkedin_url ?? "",
      portfolio_url: profile?.portfolio_url ?? "",
      is_public: profile?.is_public ?? true,
    });
  }, [profile, user, form]);

  /* ============================ Avatar Upload ============================ */

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user || !session?.access_token) return;

    e.target.value = "";

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image is too large. Maximum file size is 5 MB.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Invalid image format. Please use JPG, PNG, WebP, or GIF.");
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading("Uploading photo…");

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const res = await uploadProfileAvatarFn({
        data: {
          base64Data,
          mimeType: file.type.toLowerCase(),
          fileName: file.name,
          accessToken: session.access_token,
          userId: user.id,
        },
      });

      if (res?.ok && res.avatarUrl) {
        toast.success("Profile photo updated.", { id: toastId });
        await refresh();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload photo.", { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    if (!user || !session?.access_token) return;
    setUploadingAvatar(true);
    const toastId = toast.loading("Removing photo…");
    try {
      await removeProfileAvatarFn({
        data: { accessToken: session.access_token },
      });
      toast.success("Profile photo removed.", { id: toastId });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove photo.", { id: toastId });
    } finally {
      setUploadingAvatar(false);
    }
  }

  /* ============================ Profile Submit ============================ */

  async function onSubmit(values: ProfileValues) {
    if (!user) return;
    setSaving(true);
    const skills = (values.skills ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          username: values.username || null,
          phone: values.phone || null,
          bio: values.bio || null,
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

      if (profileError) throw profileError;

      await supabase.auth.updateUser({
        data: {
          full_name: values.full_name,
          phone: values.phone || null,
        },
      });

      toast.success("Profile saved successfully.");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const phoneValue =
    form.watch("phone") || profile?.phone || (user?.user_metadata?.phone as string | undefined);
  const completion = profileCompletion(profile, phoneValue);
  const isPublic = form.watch("is_public");
  const fullName = form.watch("full_name");
  const currentAvatarUrl = profile?.avatar_url;

  return (
    <>
      <PageHeader
        eyebrow="Your profile"
        title="Make it yours."
        description="This is what mentors, teammates, and organizers see when they meet you on Compass Crew."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          {/* Sidebar: Photo, Completion, Privacy */}
          <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="space-y-6 p-6">
                {/* Avatar with Upload Action */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 ring-2 ring-border shadow-md">
                      {currentAvatarUrl ? (
                        <AvatarImage src={currentAvatarUrl} alt={fullName || "Profile"} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-brand text-xl font-bold text-white">
                        {(fullName || user?.email || "?").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {uploadingAvatar && (
                      <div className="absolute inset-0 grid place-items-center rounded-full bg-background/70 backdrop-blur-xs">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}

                    <button
                      type="button"
                      aria-label="Upload new profile photo"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:scale-105 hover:border-primary/50"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarChange}
                  />

                  <div className="mt-3">
                    <p className="font-semibold text-foreground">{fullName || "Unnamed Builder"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 text-xs"
                    >
                      <Camera className="mr-1.5 h-3.5 w-3.5" />
                      {currentAvatarUrl ? "Change photo" : "Upload photo"}
                    </Button>
                    {currentAvatarUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploadingAvatar}
                        onClick={handleRemoveAvatar}
                        className="h-8 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    JPG, PNG, WebP or GIF. Max 5 MB.
                  </p>
                </div>

                {/* Profile Completion */}
                <div className="space-y-2.5 border-t border-border/60 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Profile completion</span>
                    <span className="font-semibold text-primary">{completion}%</span>
                  </div>
                  <Progress value={completion} className="h-2" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Includes photo, phone, college, degree, and skills to unlock hackathons and
                    mentorship.
                  </p>
                </div>

                {/* Visibility Toggle */}
                <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      {isPublic ? (
                        <Eye className="h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" />
                      )}
                      Visibility
                    </span>
                    <Badge variant={isPublic ? "default" : "secondary"} className="text-[10px]">
                      {isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-muted-foreground leading-relaxed">
                    {isPublic
                      ? "Anyone in the community can find your profile and invite you to hackathons."
                      : "Only you and administrators can view your profile."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Card */}
            <ChangePasswordCard />
          </div>

          {/* Main Edit Form */}
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <SectionTitle icon={UserIcon} title="Identity & Account" />
                <Grid2>
                  <F label="Full name" error={form.formState.errors.full_name?.message}>
                    <Input placeholder="Priya Sharma" {...form.register("full_name")} />
                  </F>
                  <F label="Username" error={form.formState.errors.username?.message}>
                    <Input placeholder="priyasharma" {...form.register("username")} />
                  </F>
                </Grid2>

                <Grid2>
                  <F
                    label="Mobile number"
                    error={form.formState.errors.phone?.message}
                    hint="Used for hackathon team coordination. Kept private."
                  >
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="+91 98765 43210"
                        className="pl-9"
                        {...form.register("phone")}
                      />
                    </div>
                  </F>
                  <F label="Email address" hint="Managed through your login provider">
                    <Input
                      value={user?.email ?? ""}
                      disabled
                      className="bg-muted/40 cursor-not-allowed opacity-80"
                    />
                  </F>
                </Grid2>

                <F label="Bio" error={form.formState.errors.bio?.message}>
                  <Textarea
                    rows={3}
                    placeholder="Tell other builders what you're passionate about and what you're building."
                    {...form.register("bio")}
                  />
                </F>

                <SectionTitle title="Location" />
                <Grid2>
                  <F label="Country">
                    <Input placeholder="India" {...form.register("country")} />
                  </F>
                  <F label="State">
                    <Input placeholder="Karnataka" {...form.register("state")} />
                  </F>
                </Grid2>

                <SectionTitle title="Education" />
                <F label="College / University">
                  <Input
                    placeholder="Indian Institute of Technology, Bombay"
                    {...form.register("college")}
                  />
                </F>
                <Grid3>
                  <F label="Degree">
                    <Input placeholder="B.Tech" {...form.register("degree")} />
                  </F>
                  <F label="Year of study">
                    <Input placeholder="3rd Year" {...form.register("year_of_study")} />
                  </F>
                  <F label="Branch / Major">
                    <Input placeholder="Computer Science" {...form.register("branch")} />
                  </F>
                </Grid3>

                <SectionTitle title="Skills & Interests" />
                <F
                  label="Skills (comma separated)"
                  error={form.formState.errors.skills?.message}
                  hint="e.g. Next.js, Python, PyTorch, UI Design, Rust"
                >
                  <Input
                    placeholder="React, TypeScript, Python, FastAPI"
                    {...form.register("skills")}
                  />
                </F>

                <SectionTitle title="Social & Portfolio Links" />
                <Grid2>
                  <F label="GitHub URL" error={form.formState.errors.github_url?.message}>
                    <Input
                      placeholder="https://github.com/username"
                      {...form.register("github_url")}
                    />
                  </F>
                  <F label="LinkedIn URL" error={form.formState.errors.linkedin_url?.message}>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      {...form.register("linkedin_url")}
                    />
                  </F>
                </Grid2>
                <F label="Portfolio URL" error={form.formState.errors.portfolio_url?.message}>
                  <Input
                    placeholder="https://yourportfolio.dev"
                    {...form.register("portfolio_url")}
                  />
                </F>

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Community profile visibility
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Allow other builders to discover your profile on Compass Crew.
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("is_public")}
                    onCheckedChange={(v) => form.setValue("is_public", v)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-gradient-brand px-6 text-white hover:opacity-90 shadow-sm"
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

/* ============================ Password Card ============================ */

function ChangePasswordCard() {
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onPasswordSubmit(values: PasswordValues) {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully.");
      form.reset({ password: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-foreground text-sm">Change Password</p>
            <p className="text-xs text-muted-foreground">Update your account security.</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-3 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-pw" className="text-xs">
              New password
            </Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pr-9 text-xs"
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
              <p className="text-[11px] text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw" className="text-xs">
              Confirm new password
            </Label>
            <div className="relative">
              <Input
                id="confirm-pw"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat new password"
                className="pr-9 text-xs"
                {...form.register("confirmPassword")}
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
            {form.formState.errors.confirmPassword && (
              <p className="text-[11px] text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={updating}
            size="sm"
            className="w-full bg-gradient-brand text-white hover:opacity-90 text-xs"
          >
            {updating ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            )}
            Update password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/* ============================ Helper Components ============================ */

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 pb-2 pt-2">
      {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
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
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
