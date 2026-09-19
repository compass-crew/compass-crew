import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { HeartHandshake, ShieldAlert, CheckCircle2, XCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/code-of-conduct")({
  head: () => ({
    meta: [
      { title: "Code of Conduct — Compass Crew" },
      {
        name: "description",
        content:
          "Community guidelines and behavioral expectations for every Compass Crew member, mentor, and partner.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: CocPage,
});

export function CocPage() {
  const lastUpdated = "September 2026";

  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Code of Conduct"
        description={`Last updated: ${lastUpdated} · Fostering an inclusive, respectful, and ambitious builder community.`}
      />

      <Section className="max-w-4xl py-10">
        <div className="space-y-10">
          {/* Summary Banner */}
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Our Core Pledge
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Compass Crew is dedicated to providing a safe, welcoming, and empowering
                    environment for every student builder, regardless of background, identity,
                    college campus, or technical experience level. We collaborate with integrity and
                    treat each other with dignity.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expected Behaviors */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Behaviors We Encourage &amp; Expect
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              As members of the Compass Crew community, we hold ourselves and each other to the
              following principles:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="font-medium text-foreground">Respectful Collaboration</h3>
                  <p className="text-sm text-muted-foreground">
                    Engage in constructive discussions, appreciate different perspectives, and
                    welcome newcomers into teams.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="font-medium text-foreground">Academic &amp; Build Integrity</h3>
                  <p className="text-sm text-muted-foreground">
                    Honor originality in projects. Always give clear attribution for open-source
                    libraries, assets, and teammates.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="font-medium text-foreground">Constructive Feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Deliver peer reviews and judging critique with kindness, empathy, and actionable
                    improvement steps.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/50">
                <CardContent className="p-5 space-y-1.5">
                  <h3 className="font-medium text-foreground">Privacy &amp; Boundaries</h3>
                  <p className="text-sm text-muted-foreground">
                    Respect members&apos; privacy. Obtain explicit consent before recording,
                    photographing, or publishing private messages.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Unacceptable Behaviors */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 text-foreground">
              <XCircle className="h-5 w-5 text-rose-500" />
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Unacceptable Behavior
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              The following actions violate our community values and are strictly prohibited across
              all hackathons, workshops, and communication channels:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <strong>Harassment &amp; Discrimination:</strong> Offensive comments, unwelcome
                sexual attention, or slurs related to gender, sexual orientation, disability,
                physical appearance, race, ethnicity, or religion.
              </li>
              <li>
                <strong>Abusive Conduct &amp; Threats:</strong> Intimidation, stalking, doxxing,
                personal attacks, or threats of violence directed toward any individual or group.
              </li>
              <li>
                <strong>Spam &amp; Commercial Solicitations:</strong> Unsolicited advertisements,
                recruitment spam, cryptocurrency promotions, or misuse of member contact lists.
              </li>
              <li>
                <strong>Impersonation &amp; Dishonesty:</strong> Pretending to represent another
                builder, organizer, mentor, partner, or institution.
              </li>
              <li>
                <strong>Malicious Activity:</strong> Deploying malicious code, attempting
                unauthorized system penetration, or manipulating hackathon voting or scoring.
              </li>
              <li>
                <strong>Disruption of Events:</strong> Intentional disruption of presentations,
                mentor office hours, judging sessions, or community livestreams.
              </li>
            </ul>
          </section>

          {/* Enforcement & Consequences */}
          <section className="space-y-3">
            <div className="flex items-center gap-2.5 text-foreground">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Enforcement &amp; Consequences
              </h2>
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Community organizers take all reports seriously. Participants asked to cease
              prohibited behavior are expected to comply immediately. Depending on severity,
              organizers may issue formal warnings, temporarily suspend team participation,
              disqualify hackathon submissions, or permanently ban offenders from the platform
              without refund of any event access or certificates.
            </p>
          </section>

          {/* Reporting */}
          <Card className="border-border/60 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">Reporting an Incident</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you experience or witness behavior that violates this Code of Conduct, or have
                any safety concerns, please notify our core team immediately. All reports will be
                handled confidentially and investigated promptly:
              </p>
              <div className="pt-2">
                <a
                  href="mailto:compasscrewnetwork.team@gmail.com"
                  className="inline-flex items-center gap-2 font-mono text-sm font-medium text-primary hover:underline"
                >
                  compasscrewnetwork.team@gmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
