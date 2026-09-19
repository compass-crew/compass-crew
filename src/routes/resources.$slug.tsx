import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Download, ExternalLink, BookOpen, Tag } from "lucide-react";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getResource } from "@/lib/public-cms";
import { safeExternalUrl } from "@/lib/safe-redirect";

export const Route = createFileRoute("/resources/$slug")({
  loader: async ({ params }) => {
    const resource = await getResource(params.slug);
    if (!resource) throw notFound();
    return { resource };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Resource Not Found — Compass Crew" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { resource } = loaderData;
    return {
      meta: [
        { title: `${resource.title} — Compass Crew Resources` },
        { name: "description", content: resource.description ?? resource.title },
        { property: "og:title", content: resource.title },
        { property: "og:description", content: resource.description ?? "" },
        ...(resource.cover_url ? [{ property: "og:image", content: resource.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/resources/${resource.slug}` }],
    };
  },
  notFoundComponent: ResourceNotFound,
  errorComponent: ({ error }) => (
    <Section className="py-16 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Button asChild variant="outline" className="mt-4">
        <Link to="/resources">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Resources
        </Link>
      </Button>
    </Section>
  ),
  component: ResourceDetailPage,
});

function ResourceNotFound() {
  return (
    <Section className="py-20">
      <div className="mx-auto max-w-md text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
        <h1 className="font-display text-3xl font-semibold text-foreground">Resource not found</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          This technical guide, starter kit, or template may have been updated, relocated, or
          unpublished.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/resources">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Resources
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ResourceDetailPage() {
  const { resource } = Route.useLoaderData();
  const safeUrl = safeExternalUrl(resource.url);
  const safeDownload = safeExternalUrl(resource.download_url);

  return (
    <Section className="max-w-4xl py-12">
      <Link
        to="/resources"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all resources
      </Link>

      <article className="mt-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {resource.category && (
            <Badge variant="secondary" className="capitalize text-xs font-semibold px-2.5 py-0.5">
              {resource.category}
            </Badge>
          )}
          {resource.published_at && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Published {fmtDate(resource.published_at)}
            </span>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl sm:leading-tight">
          {resource.title}
        </h1>

        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {resource.tags.map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-[11px]">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {resource.cover_url && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-muted/30 max-h-96">
            <img
              src={resource.cover_url}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overview & Guidelines
              </h2>
              <p className="mt-2 text-base text-foreground leading-relaxed whitespace-pre-wrap">
                {resource.description ??
                  "Curated developer resource and template maintained for Compass Crew participants and hackathon builders."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border/60">
              {safeUrl && (
                <Button asChild size="default" className="bg-gradient-brand text-white gap-2">
                  <a href={safeUrl} target="_blank" rel="noopener noreferrer">
                    Open Resource Repository <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {safeDownload && (
                <Button asChild variant="outline" size="default" className="gap-2">
                  <a href={safeDownload} target="_blank" rel="noopener noreferrer">
                    Download Starter Package <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </article>
    </Section>
  );
}
