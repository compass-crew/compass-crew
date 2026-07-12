import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Compass Crew" },
      { name: "description", content: "How Compass Crew collects, uses and protects your information." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Privacy Policy" description="Last updated: January 2026" />
      <Section className="max-w-3xl">
        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>This page is maintained by the Compass Crew team to explain what data we collect, how we use it, and the controls you have. Compass Crew is a student-run community; we take privacy seriously and only collect what we need to operate.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Information we collect</h2>
          <p>When you sign up, register for a hackathon, or subscribe to our newsletter, we collect your name, email address, campus and (optionally) links to your public work. Event registrations may include additional information relevant to that event.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">How we use information</h2>
          <p>We use your information to run events, send you relevant updates, match you with mentors, and improve our programs. We never sell your data.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Sharing</h2>
          <p>We share limited information with event sponsors only when you explicitly opt in during registration. Everything else stays with Compass Crew.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Your controls</h2>
          <p>You can request access to, correction of, or deletion of your personal information at any time by writing to hello@compasscrew.in.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
          <p>Questions? Email us at hello@compasscrew.in.</p>
        </article>
      </Section>
    </>
  );
}
