import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const expeditions = [
  {
    tag: "Patagonia",
    title: "Torres del Paine Traverse",
    duration: "9 days · Nov–Mar",
    price: "From $3,890",
  },
  {
    tag: "High Atlas",
    title: "Berber Villages & Mount Toubkal",
    duration: "7 days · Apr–Oct",
    price: "From $2,450",
  },
  {
    tag: "Iceland",
    title: "Highlands & Volcanic Coast",
    duration: "6 days · Jun–Sep",
    price: "From $3,120",
  },
];

const principles = [
  {
    n: "01",
    title: "Small groups, always",
    body: "No more than eight travelers per crew. Real conversations, real trails, no coach buses.",
  },
  {
    n: "02",
    title: "Guides who live it",
    body: "Every expedition is led by locals and lifers — climbers, cartographers, cooks, and biologists.",
  },
  {
    n: "03",
    title: "Slower on purpose",
    body: "We build in the pauses. Time to notice the light change, the ridge shift, the story unfold.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
          <a href="#" className="flex items-center gap-2 text-background">
            <CompassMark />
            <span className="font-display text-lg tracking-tight">Compass Crew</span>
          </a>
          <div className="hidden items-center gap-8 text-sm text-background/85 md:flex">
            <a href="#expeditions" className="transition hover:text-background">Expeditions</a>
            <a href="#approach" className="transition hover:text-background">Approach</a>
            <a href="#journal" className="transition hover:text-background">Journal</a>
            <a href="#contact" className="transition hover:text-background">Contact</a>
          </div>
          <a
            href="#contact"
            className="rounded-full border border-background/40 px-4 py-2 text-sm text-background transition hover:bg-background hover:text-foreground"
          >
            Plan a trip
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative h-[92vh] min-h-[620px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Hikers on a mountain ridge at golden hour"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-foreground/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 lg:px-10 lg:pb-28">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-background/80">
            Guided expeditions · Est. 2014
          </p>
          <h1 className="max-w-4xl font-display text-5xl font-light leading-[1.02] text-background sm:text-6xl lg:text-7xl">
            Find your bearings <br />
            <span className="italic text-background/90">somewhere farther out.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-background/85 sm:text-lg">
            Compass Crew runs small-group expeditions into the world's quieter corners —
            planned with care, guided by locals, remembered for a lifetime.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#expeditions"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90"
            >
              See 2026 expeditions
              <span aria-hidden>→</span>
            </a>
            <a
              href="#approach"
              className="inline-flex items-center gap-2 rounded-full border border-background/40 px-6 py-3 text-sm text-background transition hover:bg-background/10"
            >
              How we travel
            </a>
          </div>
        </div>
      </section>

      {/* Intro strip */}
      <section id="approach" className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-12 lg:px-10 lg:py-32">
          <div className="lg:col-span-5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Our approach</p>
            <h2 className="mt-4 font-display text-4xl font-light leading-tight text-foreground sm:text-5xl">
              Trips that feel like <em className="text-accent">yours</em>, not a tour.
            </h2>
          </div>
          <div className="grid gap-10 lg:col-span-7 lg:grid-cols-3">
            {principles.map((p) => (
              <div key={p.n} className="flex flex-col gap-3">
                <span className="font-display text-sm text-accent">{p.n}</span>
                <h3 className="font-display text-xl text-foreground">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expeditions */}
      <section id="expeditions" className="bg-secondary">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Featured · 2026
              </p>
              <h2 className="mt-4 font-display text-4xl font-light leading-tight text-foreground sm:text-5xl">
                Where we're headed next.
              </h2>
            </div>
            <a
              href="#"
              className="text-sm font-medium text-accent underline-offset-4 hover:underline"
            >
              View the full atlas →
            </a>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {expeditions.map((e, i) => (
              <article
                key={e.title}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-8 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.25em] text-accent">
                      {e.tag}
                    </span>
                    <span className="font-display text-sm text-muted-foreground">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl leading-tight text-card-foreground">
                    {e.title}
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground">{e.duration}</p>
                </div>
                <div className="mt-16 flex items-end justify-between border-t border-border pt-6">
                  <span className="font-display text-lg text-foreground">{e.price}</span>
                  <span className="text-sm text-accent transition group-hover:translate-x-1">
                    Details →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section id="journal" className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-28 text-center lg:py-36">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            From the trail
          </p>
          <blockquote className="mt-8 font-display text-3xl font-light leading-snug text-foreground sm:text-4xl">
            "We didn't just see Patagonia — we listened to it. Nine days,
            eight strangers, one crew. I came home a little rearranged."
          </blockquote>
          <p className="mt-8 text-sm text-muted-foreground">
            Maren H. — Torres del Paine, 2025
          </p>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-24 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-light leading-tight sm:text-5xl">
              Ready to point the compass somewhere new?
            </h2>
            <p className="mt-5 text-base text-primary-foreground/75">
              Tell us where you've been dreaming of. We'll design the route, gather the crew,
              and handle the logistics — you just show up.
            </p>
          </div>
          <a
            href="mailto:hello@compasscrew.co"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-medium text-accent-foreground transition hover:opacity-90"
          >
            Start planning
            <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground/70">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 border-t border-primary-foreground/10 px-6 py-10 sm:flex-row sm:items-center lg:px-10">
          <div className="flex items-center gap-2 text-primary-foreground">
            <CompassMark />
            <span className="font-display text-base">Compass Crew</span>
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} Compass Crew. Traveling gently, on purpose.
          </p>
        </div>
      </footer>
    </div>
  );
}

function CompassMark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
    >
      <circle cx="13" cy="13" r="11" />
      <path d="M13 4 L15.5 13 L13 22 L10.5 13 Z" fill="currentColor" stroke="none" opacity="0.9" />
      <circle cx="13" cy="13" r="1.2" fill="var(--background)" stroke="none" />
    </svg>
  );
}
