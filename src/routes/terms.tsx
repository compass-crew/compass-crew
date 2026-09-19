import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Mail } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Compass Crew" },
      {
        name: "description",
        content:
          "Terms governing account access, hackathon participation, submissions, and platform use across Compass Crew.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  const lastUpdated = "September 2026";

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description={`Last updated: ${lastUpdated} · Terms and conditions for participating in the Compass Crew platform and hackathons.`}
      />

      <Section className="max-w-4xl py-10">
        <div className="space-y-10">
          {/* Summary Banner */}
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Community Agreement
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    These Terms of Service govern your use of the Compass Crew website, platform
                    features, hackathons, and builder community. By creating an account or
                    participating in any Compass Crew event, you agree to adhere to these terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Acceptance of Terms */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              By accessing or using the Compass Crew website, platform services, APIs, hackathons,
              or community forums (&quot;Platform&quot;), you confirm that you have read,
              understood, and agree to be bound by these Terms of Service. If you do not agree to
              these terms, you must not access or use the Platform.
            </p>
          </section>

          {/* Section 2: Eligibility */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              2. Eligibility
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Compass Crew is primarily designed for students, early-career developers, designers,
              researchers, and innovators. You must be at least 13 years old to register. If you are
              under the legal age of majority in your area, you represent that you have obtained
              consent from a parent or legal guardian to access and participate in the Platform.
            </p>
          </section>

          {/* Section 3: Account Registration */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              3. Account Registration &amp; Accuracy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              To participate in hackathons, register teams, and access verified credentials, you
              must create an account. You agree to provide accurate, current, and complete
              registration information during onboarding and to keep your profile updated. Creating
              automated accounts, bot accounts, or falsifying your identity or academic affiliation
              is prohibited.
            </p>
          </section>

          {/* Section 4: Account Security */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              4. Account Security
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              You are responsible for maintaining the confidentiality of your authentication
              credentials and for all activities that occur under your account. You agree to notify
              Compass Crew immediately of any unauthorized access or security breach. We are not
              liable for any loss or damage arising from your failure to safeguard your credentials.
            </p>
          </section>

          {/* Section 5: Platform Use & License */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              5. Platform Use &amp; Limited License
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Compass Crew grants you a personal, non-exclusive, non-transferable, revocable license
              to access and use the Platform for learning, project building, hackathon
              participation, and community networking in accordance with these Terms.
            </p>
          </section>

          {/* Section 6: Community Conduct */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              6. Community Conduct
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              All members are required to uphold our Code of Conduct across all platform modules,
              team channels, submission repositories, and public interactions. Respect, constructive
              feedback, honesty, and inclusivity are fundamental to Compass Crew.
            </p>
          </section>

          {/* Section 7: Hackathons & Events */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              7. Hackathons &amp; Events
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Participation in specific hackathons, workshops, and challenge tracks may be subject
              to additional event guidelines, eligibility criteria, track prompts, and submission
              deadlines. Event organizers and judges have final discretion in evaluating submissions
              based on published scoring criteria.
            </p>
          </section>

          {/* Section 8: User Submissions & Project Content */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              8. User Submissions &amp; Content
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              You retain full intellectual property ownership of the code, designs, presentations,
              and materials you build and submit during hackathons. By submitting projects to
              Compass Crew, you grant us a worldwide, non-exclusive, royalty-free license to
              showcase, display, and reference your project for educational and promotional
              highlights with proper attribution.
            </p>
          </section>

          {/* Section 9: Intellectual Property of Compass Crew */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              9. Compass Crew Intellectual Property
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The Compass Crew brand, website design, 3D assets, logos, visual identity, software
              code, curriculum tracks, and original content are protected by copyright, trademark,
              and intellectual property laws. You may not copy, modify, or reverse-engineer platform
              components without prior written permission.
            </p>
          </section>

          {/* Section 10: Third-Party Services & Links */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              10. Third-Party Services &amp; Links
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The Platform may reference or integrate third-party tools, repository hosts (e.g.,
              GitHub), identity providers (e.g., Google), or sponsor resources. Your interactions
              with third-party providers are governed by their respective terms and policies.
              Compass Crew does not endorse or assume responsibility for third-party websites or
              services.
            </p>
          </section>

          {/* Section 11: Platform Availability & Changes */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              11. Platform Availability &amp; Modifications
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We continually enhance and update our features. We reserve the right to modify,
              suspend, or discontinue any part of the Platform at any time without prior notice. We
              do not guarantee uninterrupted, error-free, or continuously available service.
            </p>
          </section>

          {/* Section 12: Prohibited Activities */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              12. Prohibited Activities
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              When using the Platform, you agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                Plagiarize projects or submit work created entirely prior to the hackathon without
                disclosure.
              </li>
              <li>
                Attempt unauthorized access to any accounts, databases, or systems connected to
                Compass Crew.
              </li>
              <li>
                Introduce viruses, malware, logic bombs, or other malicious technology into the
                community or codebase.
              </li>
              <li>
                Harass, threaten, defame, impersonate, or intimidate other participants, mentors, or
                organizers.
              </li>
              <li>
                Scrape or harvest participant data, email addresses, or submissions for unauthorized
                commercial solicitations.
              </li>
            </ul>
          </section>

          {/* Section 13: Suspension & Termination */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              13. Suspension &amp; Termination
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We reserve the right to suspend or terminate your account and revoke hackathon
              participation if you violate these Terms, infringe on intellectual property, or engage
              in behavior harmful to other community members. You may also terminate your account at
              any time by contacting our team.
            </p>
          </section>

          {/* Section 14: Disclaimers */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              14. Disclaimers
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The Platform, content, hackathons, and credentials are provided on an &quot;as
              is&quot; and &quot;as available&quot; basis without warranties of any kind, whether
              express or implied, including warranties of merchantability, fitness for a particular
              purpose, or non-infringement.
            </p>
          </section>

          {/* Section 15: Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              15. Limitation of Liability
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              To the maximum extent permitted by applicable law, Compass Crew, its team members,
              mentors, and event organizers shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, or loss of profits or data, resulting
              from your access to or inability to access the Platform or participate in events.
            </p>
          </section>

          {/* Section 16: Changes to Terms */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              16. Changes to Terms
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We may revise these Terms of Service as our community and platform evolve. Revisions
              will be posted on this page with an updated effective date. Your continued access to
              the Platform after updates signifies your agreement to the revised terms.
            </p>
          </section>

          {/* Section 17: Contact Information */}
          <Card className="border-border/60 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">17. Contact Information</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have questions regarding these Terms of Service or need assistance with your
                account, please reach out to us:
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
