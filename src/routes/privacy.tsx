import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Compass Crew" },
      {
        name: "description",
        content:
          "How Compass Crew collects, uses, and safeguards student and builder data across our platform.",
      },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  const lastUpdated = "September 2026";

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: ${lastUpdated} · How we protect your data across the Compass Crew platform.`}
      />

      <Section className="max-w-4xl py-10">
        <div className="space-y-10">
          {/* Summary Banner */}
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    Our Privacy Commitment
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Compass Crew is an innovation and hackathon community built by students, for
                    students. We collect only the information necessary to operate hackathons, match
                    teams, issue verified credentials, and provide educational tracks. We never sell
                    your personal data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 1: Introduction */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              1. Introduction
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              This Privacy Policy explains how Compass Crew (&quot;we,&quot; &quot;our,&quot; or
              &quot;the platform&quot;) collects, processes, stores, and protects your information
              when you visit our website, register for an account, participate in hackathons, or
              interact with our community channels. By using Compass Crew, you agree to the
              practices described in this document.
            </p>
          </section>

          {/* Section 2: Information Collected */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              2. Information We Collect
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We collect information in three ways: information you provide directly, information
              generated during your participation in community events, and technical telemetry
              collected automatically for security and reliability.
            </p>
          </section>

          {/* Section 3: Account & Profile Information */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              3. Account &amp; Profile Information
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              When creating an account or completing onboarding, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Contact Details:</strong> Full name, email address, and optional
                communication preferences.
              </li>
              <li>
                <strong>Academic Background:</strong> College or university name, degree program,
                graduation year, and field of study.
              </li>
              <li>
                <strong>Builder Profile:</strong> Technical skills, interests, portfolio links (such
                as GitHub, LinkedIn, or personal websites), and short biographical statements.
              </li>
            </ul>
          </section>

          {/* Section 4: Authentication Information */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              4. Authentication Information
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              When authenticating via email and password, your credentials are securely hashed and
              stored by our authentication provider (Supabase Auth). We never store raw passwords.
              When authenticating via Google OAuth, we receive authorized profile attributes (such
              as your verified email address, full name, and avatar URL) to establish your local
              session.
            </p>
          </section>

          {/* Section 5: Community & Platform Activity */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              5. Community &amp; Platform Activity
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              As you participate in Compass Crew programs, we record:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                Hackathon registrations, track selections, and project submissions (including
                repository links, demo videos, and project descriptions).
              </li>
              <li>Team rosters, invitation workflows, and participant roles.</li>
              <li>Scoring criteria ratings, judge reviews, and leaderboard rankings.</li>
              <li>Issued achievement certificates and verifiable credential records.</li>
            </ul>
          </section>

          {/* Section 6: Information Users Voluntarily Provide */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              6. Information You Voluntarily Provide
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              If you submit messages through our contact forms, submit partner inquiries, respond to
              community surveys, or apply for mentor and organizer positions, we collect the content
              of your submission and any contact information you provide.
            </p>
          </section>

          {/* Section 7: Technical Information & Logs */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              7. Technical Telemetry &amp; Security Logs
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              To keep our platform secure and maintain operational health, our servers and edge
              networks automatically log:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                IP addresses, browser user-agent strings, operating system versions, and device
                viewports.
              </li>
              <li>Access timestamps, HTTP request paths, and response status codes.</li>
              <li>
                Cloudflare Turnstile telemetry tokens utilized for cryptographic bot and abuse
                prevention.
              </li>
            </ul>
          </section>

          {/* Section 8: How Information is Used */}
          <section className="space-y-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              8. How We Use Your Information
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We process information strictly for community and platform purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                To provide, personalize, and administer hackathons, workshops, and team
                collaboration features.
              </li>
              <li>
                To issue verifiable achievement certificates that can be independently validated.
              </li>
              <li>
                To communicate critical schedule changes, submission deadlines, and security
                announcements.
              </li>
              <li>
                To protect against malicious activity, spam submissions, and unauthorized account
                access.
              </li>
              <li>To analyze aggregate community metrics to improve future programs.</li>
            </ul>
          </section>

          {/* Section 9: Authentication & Security */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              9. Authentication &amp; Access Controls
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Access to protected platform modules is gated by session-token verification and
              database Row Level Security (RLS). Each user can only view and update their own
              authorized data. Administrative and judge functions require explicitly granted roles
              validated against internal access tables.
            </p>
          </section>

          {/* Section 10: Service Providers */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              10. Service Providers &amp; Infrastructure
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We partner with trusted infrastructure providers who adhere to strict data security
              standards:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Supabase:</strong> Cloud database, authentication services, and object
                storage.
              </li>
              <li>
                <strong>Cloudflare:</strong> Edge hosting, CDN acceleration, DDoS protection, and
                Turnstile bot challenge services.
              </li>
            </ul>
          </section>

          {/* Section 11: Cookies & Local Storage */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              11. Cookies &amp; Local Storage
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We use browser localStorage and session cookies exclusively for essential functional
              purposes: persisting your authenticated session token, remembering your UI theme
              preference (dark/light), and saving your intended destination across authentication
              redirections. We do not use third-party advertising tracking cookies.
            </p>
          </section>

          {/* Section 12: Communications */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              12. Communications
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              You may receive transactional emails regarding password resets, email verification,
              team invites, and hackathon milestones. If you opted into our community newsletter
              during registration, you may unsubscribe at any time using the link in the footer or
              by contacting us directly.
            </p>
          </section>

          {/* Section 13: Data Retention */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              13. Data Retention
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We retain account and profile information for as long as your account remains active.
              Hackathon submission archives and verified certificate IDs are retained indefinitely
              to ensure long-term verifiability of credentials, unless you request their deletion.
            </p>
          </section>

          {/* Section 14: Data Security */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              14. Data Security
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              All data transmitted between your browser and our platform is encrypted in transit
              using Transport Layer Security (TLS/HTTPS). Database records are safeguarded behind
              database-level firewalls and Row Level Security policies. While no digital platform
              can guarantee absolute security, we employ standard engineering defenses to safeguard
              your records.
            </p>
          </section>

          {/* Section 15: Your Rights & Choices */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              15. Your Rights &amp; Choices
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              You maintain control over your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>
                <strong>Access &amp; Update:</strong> You can edit your profile information at any
                time from your account settings.
              </li>
              <li>
                <strong>Account Deletion:</strong> You may request complete deletion of your account
                and personal records by emailing our team.
              </li>
              <li>
                <strong>Data Export:</strong> You can request an export of your registered project
                submissions and certificates.
              </li>
            </ul>
          </section>

          {/* Section 16: Children's Considerations */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              16. Age Requirements &amp; Student Eligibility
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Compass Crew is designed for school, college, university, and self-taught student
              builders. Individuals under 13 years of age may only participate with verified
              parental or educational institution consent.
            </p>
          </section>

          {/* Section 17: Third-Party Links */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              17. Third-Party Links &amp; External Services
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Our website and hackathon listings may contain links to third-party tools, repository
              hosts (e.g. GitHub), and sponsor websites. We are not responsible for the privacy
              practices or content of external sites.
            </p>
          </section>

          {/* Section 18: Policy Changes */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              18. Changes to This Privacy Policy
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We may update this policy periodically to reflect platform improvements or regulatory
              standards. The &quot;Last updated&quot; date at the top of this page indicates the
              effective date of any revision. Continued use of Compass Crew constitutes acceptance
              of the updated terms.
            </p>
          </section>

          {/* Section 19: Contact Information */}
          <Card className="border-border/60 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-3 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <h2 className="font-display text-xl font-semibold">19. Contact Us</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                For questions, concerns, data access requests, or deletion inquiries regarding this
                Privacy Policy, please email our team:
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
