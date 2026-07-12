import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";

export const Route = createFileRoute("/code-of-conduct")({
  head: () => ({
    meta: [
      { title: "Code of Conduct — Compass Crew" },
      { name: "description", content: "The values and behaviors we expect from every Compass Crew member, mentor and partner." },
    ],
  }),
  component: CocPage,
});

function CocPage() {
  return (
    <>
      <PageHeader eyebrow="Community" title="Code of Conduct" description="How we treat each other in the Compass Crew community." />
      <Section className="max-w-3xl">
        <article className="space-y-6 text-muted-foreground">
          <p>Compass Crew is a place for students of every background, campus and level of experience to build together. Our community works because we hold each other to the following behaviors.</p>
          <h2 className="font-display text-xl font-semibold text-foreground">We expect you to</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Treat every member with respect, regardless of gender, caste, religion, campus or background.</li>
            <li>Give credit generously. Share knowledge and help newcomers ship their first project.</li>
            <li>Ask before recording, screenshotting or reposting private conversations.</li>
            <li>Report harassment or unsafe behavior to the Compass Crew team.</li>
          </ul>
          <h2 className="font-display text-xl font-semibold text-foreground">We do not tolerate</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Harassment, discrimination, or targeted abuse of any kind.</li>
            <li>Plagiarism, cheating or misrepresenting someone else's work as your own.</li>
            <li>Spam, phishing, or misuse of member data.</li>
          </ul>
          <h2 className="font-display text-xl font-semibold text-foreground">Reporting</h2>
          <p>Write to <a href="mailto:conduct@compasscrew.in" className="text-primary">conduct@compasscrew.in</a> or reach out privately to any core team member. Reports are handled confidentially.</p>
        </article>
      </Section>
    </>
  );
}
