import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Compass Crew" },
      { name: "description", content: "The terms under which Compass Crew operates its community, events and website." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of Service" description="Last updated: January 2026" />
      <Section className="max-w-3xl">
        <article className="space-y-6 text-muted-foreground">
          <p>By joining Compass Crew or attending our events, you agree to these terms. They exist to keep the community safe, respectful and useful for every student builder.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Membership</h2>
          <p>Compass Crew membership is free and open to students in India. We reserve the right to revoke membership for anyone who violates our Code of Conduct.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Content</h2>
          <p>You retain ownership of everything you build and share. By posting to Compass Crew channels, you grant us permission to highlight and share your work with appropriate credit.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Events</h2>
          <p>Hackathons and bootcamps may have additional rules; those override these terms for the duration of the event.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Liability</h2>
          <p>Compass Crew is provided on an "as-is" basis. We are not liable for outcomes of business decisions you make based on our programs.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">Contact</h2>
          <p>Questions? Email us at hello@compasscrew.in.</p>
        </article>
      </Section>
    </>
  );
}
