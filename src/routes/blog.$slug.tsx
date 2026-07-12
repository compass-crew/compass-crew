import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { getBlogPost, listBlogPosts, type BlogPost } from "@/lib/public-cms";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getBlogPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Not found — Compass Crew" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    return {
      meta: [
        { title: `${post.title} — Compass Crew Blog` },
        { name: "description", content: post.excerpt ?? post.title },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt ?? "" },
        { property: "og:type", content: "article" },
        ...(post.cover_url ? [{ property: "og:image", content: post.cover_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/blog/${post.slug}` }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          datePublished: post.published_at,
          author: post.author_name ? { "@type": "Person", name: post.author_name } : undefined,
          image: post.cover_url ?? undefined,
        }),
      }],
    };
  },
  notFoundComponent: BlogPostNotFound,
  errorComponent: ({ error }) => (
    <Section>
      <p className="text-center text-muted-foreground">{error.message}</p>
    </Section>
  ),
  component: BlogPostPage,
});

function BlogPostNotFound() {
  return (
    <Section>
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl font-semibold">Post not found</h1>
        <p className="mt-3 text-muted-foreground">This article may have been moved or unpublished.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/blog"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to blog</Link>
        </Button>
      </div>
    </Section>
  );
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const { data: all } = useQuery({ queryKey: ["blog-posts"], queryFn: listBlogPosts });
  const related = (all ?? []).filter((p: BlogPost) => p.id !== post.id && p.category === post.category).slice(0, 3);

  return (
    <>
      <Section className="max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
        <article className="mt-6">
          {post.category && <Badge variant="secondary" className="mb-4">{post.category}</Badge>}
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {post.author_name && <span>By <span className="font-medium text-foreground">{post.author_name}</span></span>}
            {post.published_at && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {fmtDate(post.published_at)}</span>
            )}
            {post.reading_minutes ? (
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {post.reading_minutes} min read</span>
            ) : null}
          </div>
          {post.cover_url && (
            <img src={post.cover_url} alt="" className="mt-8 w-full rounded-2xl object-cover" loading="lazy" />
          )}
          <div className="mt-10">
            <Markdown>{post.body_md}</Markdown>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((t: string) => <Badge key={t} variant="outline">#{t}</Badge>)}
            </div>
          )}
        </article>
      </Section>

      {related.length > 0 && (
        <Section className="border-t border-border bg-muted/30 max-w-5xl">
          <h2 className="font-display text-2xl font-semibold">Related articles</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to="/blog/$slug" params={{ slug: r.slug }} className="group">
                <div className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-elegant">
                  <p className="text-xs text-muted-foreground">{fmtDate(r.published_at)}</p>
                  <h3 className="mt-2 font-display text-base font-semibold">{r.title}</h3>
                  {r.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}
    </>
  );
}
