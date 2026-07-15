
# Compass Crew — Awwwards-tier Redesign

Scope: purely visual + motion. No changes to routes, DB, RLS, auth, RBAC, APIs, CMS fields, or business logic. Every page keeps its data and behavior; only the surface, typography, motion, and composition change.

## Reference read (from the attached video)

I studied the clip frame-by-frame and pulled the qualities that make it feel premium, without copying it:

- Deep near-black canvas with a single warm/cool accent, never pure `#000`.
- Editorial typography — one oversized display line per moment, wide leading, tight tracking, huge negative space.
- Scroll as narrative: each section owns the viewport, one idea at a time, mask/reveal on entry.
- Motion is slow and confident (500–800ms, custom easing), not busy. Hover lifts 2px, cards respond with hairline glow, never bounce.
- Cursor is present but subtle — magnetic CTAs, soft blend-mode blob on dark surfaces, disabled on touch.
- Ambient life: slow radial drift, faint grid, film grain, low-opacity gradient orbs — never distracting.
- Layouts vary constantly — bento, split, marquee, timeline, magazine — no repeated 3-col card grid.

## Design language for Compass Crew

- Palette (dark-first, light supported):
  - Canvas `#07070B` → elevated `#0E0E14` → surface `#14141C`, hairline borders `#1E1E28`.
  - Accent brand: violet `#7C6BFF` → indigo `#5B5BF5` → cyan `#22D3EE` gradient, used sparingly.
  - Ink: `#F5F5F7` primary, `#A1A1AA` secondary, `#6B7280` tertiary.
- Typography:
  - Display: Space Grotesk 600, tracking `-0.04em`, hero `clamp(56px, 8.5vw, 128px)`, leading `0.95`.
  - Body: Inter 400/500, leading `1.65`, max-width `62ch`.
  - Eyebrow: mono-ish uppercase 11px, `0.22em` tracking, dot rule.
- Elevation: hairline + soft ambient shadow + inner-top highlight (`inset 0 1px 0 rgba(255,255,255,.06)`). Glass = `bg-white/[.03]` + `backdrop-blur-xl` + `border-white/[.06]`.
- Motion tokens: `--ease-out-soft: cubic-bezier(.2,.7,.2,1)`, `--dur-1: 220ms`, `--dur-2: 500ms`, `--dur-3: 800ms`. Respect `prefers-reduced-motion`.

## Foundation (cascades site-wide)

1. `src/styles.css` — rewrite the token layer (OKLCH dark + light), add utilities: `.text-display`, `.text-gradient-brand`, `.hairline`, `.glass`, `.glass-strong`, `.bg-mesh`, `.bg-grid`, `.bg-noise`, `.hero-glow`, `.mask-fade-b`, `.scroll-fade`. Use `@utility` (v4).
2. `src/lib/motion.ts` — variants: `fadeUp`, `stagger`, `maskReveal`, `wordReveal`, `scaleIn`. Framer Motion.
3. `src/components/fx/` new primitives (visual only, no logic):
   - `SmoothScroll` (Lenis) with reduced-motion bypass.
   - `Cursor` — magnetic blend-mode dot, disabled on touch.
   - `Magnetic` wrapper for CTAs.
   - `TextReveal` (per-word mask), `Reveal` (fade-up on view), `Marquee`, `NoiseLayer`, `AmbientOrbs`.
4. Primitives retuned:
   - `button.tsx` — variants `primary` (gradient + inner highlight + soft glow), `secondary` (glass), `ghost`, `outline` (hairline), `link`. Animated arrow on `.group` hover. Focus ring `ring-2 ring-ring/60`.
   - `card.tsx` — glass + hairline + gradient-border-on-hover via masked pseudo.
   - `input/textarea/select` — floating labels, refined focus.
   - `navbar.tsx` — floating pill, glass, scroll shrink, gradient active underline.
   - `footer.tsx` — quieter, hairline dividers, brand mark bottom-left.
   - `page-header.tsx` — editorial, mesh backdrop, gentle parallax.
   - `section.tsx` — tones `default | alt | contrast`, rhythms `default | compact | loose`.

## Home page — completely different layout per section

`src/routes/index.tsx` rebuilt end-to-end. No repeating grid.

1. **Hero** — full-viewport dark stage. Oversized editorial headline with mask reveal, one brand-gradient accent word. Eyebrow pill top-left, dual CTAs bottom-left (primary gradient + ghost with animated arrow), trust row bottom (six pills — Student-first / AI-Native / Open Source / Hackathons / Research / Startup Ecosystem — no fake numbers). Ambient orbs + grid + noise + slow radial drift. Magnetic CTAs. Scroll cue.
2. **Manifesto** — one giant sentence, per-word reveal, split into 3 breaths. Massive whitespace.
3. **What we build (Bento)** — asymmetric bento (5 tiles: Hackathons wide, Team-matching tall, Certificates, AI Community, Portfolios). Each tile a mini interactive vignette.
4. **Hackathons — magazine** — editorial split, oversized event title, status pill, timeline rail below, thumb strip of upcoming.
5. **Innovation journey** — horizontal-pinned timeline (sticky, translateX on scroll) with milestones.
6. **AI Community** — split screen; left = live feed mock (channels, avatars redacted, no fake users — generic role tags), right = editorial copy.
7. **Team matching** — realistic product surface: skill chips, availability, role tags, animated match indicator (visual only).
8. **Certificates** — 3D-tilted certificate preview, verification input, trust marks. Links to existing `/verify/:code` route.
9. **Sponsors** — premium logo wall placeholder (data-driven from existing CMS; if empty, tasteful empty state — no fake logos), elegant hover desaturate-to-color, sponsor CTA.
10. **Testimonials** — placeholder marquee with quote cards, no fake names — labeled "Coming soon" if empty.
11. **FAQ** — editorial accordion, oversized questions, hairline dividers.
12. **CTA band** — final full-bleed statement + primary CTA.
13. **Footer** — retuned per above.

## Cross-page pass

Public pages (Hackathons, Events, About, Community, Blog, Careers, Contact, FAQs, Sponsors, Partners, Mentors, Judges, Resources, legal, verify): inherit new PageHeader, primitives, motion. Retune per-page hero copy where thin; no data or route changes.

Auth pages: glass card center, brand backdrop, subtle grain.

Authenticated shells (Dashboard, Teams, Profile, Settings, Judge, Organizer, Certificates, Invitations, Notifications, Admin): retune hero blocks, upgrade stat/summary cards, empty states, tables (sticky header, hairline rows, hover row highlight). No logic changes.

## Accessibility

- Contrast recheck for both modes.
- `focus-visible` rings on every interactive.
- `prefers-reduced-motion` disables transforms, marquee, smooth scroll, cursor.
- Cursor + magnetic disabled on `pointer: coarse`.
- Motion is decorative — screen readers see semantic content unchanged.

## Non-goals

- No new routes.
- No schema, RLS, or CMS field changes.
- No new server functions or edge functions.
- No fake numbers, fake logos, fake testimonials, or fake universities. Empty states are honest.
- No stock illustrations.

## Technical notes

- New deps: `lenis` (smooth scroll), `framer-motion` (present already? — verify; add if missing).
- All tokens live in `src/styles.css` under `@theme inline` mapped to `:root` / `.dark`.
- No hard-coded color utilities in components — semantic tokens only.
- Video reference is inspiration only — nothing copied; motion timings and tokens are Compass Crew's own.

## Delivery order (each step ships preview-functional)

1. Tokens + utilities in `styles.css`, `motion.ts`, and the `fx/` primitives.
2. Primitives: button, card, input, table, badge, navbar, footer, page-header, section, empty-state.
3. Home hero + manifesto + bento.
4. Home: hackathons magazine + journey timeline + community split.
5. Home: team matching + certificates + sponsors + testimonials + FAQ + CTA.
6. Auth + dashboard shells.
7. Sweep remaining public + authenticated pages.
8. Playwright pass in light + dark across ~15 representative routes; self-critique and tighten.

## Confirmations before I start

1. Dark-first with a proper light mode, matching the reference feel? (Recommended.)
2. OK to add `lenis` for smooth scroll (respects reduced-motion, disabled on touch)?
3. Keep current typefaces (Space Grotesk + Inter), or swap the display to something more editorial (e.g. `Fraunces` or `Instrument Serif` for the hero accent word)?
4. For sections with no real data yet (testimonials, sponsors), honest empty state or hide entirely until CMS is populated?
