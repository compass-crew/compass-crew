import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { listHomepageSections, findSection } from "@/lib/public-cms";
import { FAQS } from "@/data/site";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs — Compass Crew" },
      {
        name: "description",
        content:
          "Answers to common questions about joining Compass Crew, hackathons, chapters and sponsorship.",
      },
      { property: "og:title", content: "FAQs — Compass Crew" },
      { property: "og:description", content: "Common questions about Compass Crew." },
    ],
    links: [{ rel: "canonical", href: "/faqs" }],
  }),
  component: FaqsPage,
});

type FaqItem = { q: string; a: string };

function FaqsPage() {
  const { data } = useQuery({ queryKey: ["homepage-sections"], queryFn: listHomepageSections });
  const faqCms = findSection(data ?? [], "faq");
  const items: FaqItem[] = (faqCms?.data as { items?: FaqItem[] } | null)?.items ?? FAQS;

  return (
    <>
      <PageHeader
        eyebrow="FAQs"
        title="Questions, answered."
        description="Can't find what you're looking for? Reach out via the Contact page."
      />
      <Section className="max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {items.map((f, i) => (
            <AccordionItem key={f.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-display text-base font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-8 text-sm text-muted-foreground">
          Still have questions?{" "}
          <Link to="/contact" className="text-primary">
            Contact us →
          </Link>
        </p>
      </Section>
    </>
  );
}
