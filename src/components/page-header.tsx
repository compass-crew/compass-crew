import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

/**
 * Editorial page header — matches the home hero language.
 *
 * Callers keep the same API (eyebrow / title / description / children).
 * `title` accepts ReactNode so pages can pass an italic accent span or a
 * gradient word inline, e.g.:
 *   <PageHeader title={<>Build with <span className="italic font-light">the</span> <span className="text-gradient-brand">Crew.</span></>} />
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Soft radial wash + grid whisper, identical to home hero */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-glow opacity-60" />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative mx-auto max-w-5xl px-5 pt-16 pb-14 text-center sm:px-6 sm:pt-24 sm:pb-20 lg:px-8">
        {eyebrow && (
          <div className="flex justify-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-elegant backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              {eyebrow}
            </span>
          </div>
        )}

        <h1
          className="mx-auto mt-6 max-w-4xl font-display font-bold tracking-[-0.04em] text-[2.25rem] leading-[1.02] sm:text-[3.5rem] lg:text-[4.5rem] animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {title}
        </h1>

        {description && (
          <p
            className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {description}
          </p>
        )}

        {children && (
          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
