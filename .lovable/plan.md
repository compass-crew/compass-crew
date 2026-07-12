
# Compass Crew — Premium Redesign

Scope: pure visual + interaction rebuild. No changes to routes, DB, RLS, auth, RBAC, APIs, CMS, or business logic. Every existing page keeps its data and behavior; only the surface changes.

## Design language

- Reference vocabulary: Linear (restraint, sharp type), Vercel (mono-neutral + glow), Stripe (density with air), Framer (motion), Apple (hierarchy), Arc (glass), Notion (readability). Distinct Compass Crew identity — no clone.
- Palette
  - Brand gradient: violet `#6E56F7` → indigo `#4F46E5` → cyan `#22D3EE`.
  - Light: warm white `#FBFAF8` bg, soft gray surfaces `#F3F1EC / #EFEDE7`, ink `#0B0B12`.
  - Dark: premium near-black `#0A0A0F` bg, elevated `#111119`, subtle borders `#1E1E28` — never `#000`.
  - Semantic tokens only in components; all values live in `src/styles.css` under `@theme inline` mapped to `:root` / `.dark`.
- Type: keep Space Grotesk (display) + Inter (body). Tighten tracking on display (`-0.035em`), open body leading to `1.65`, cap line length. Hero display ~ `clamp(48px, 7vw, 92px)`.
- Elevation: layered — hairline border + soft ambient shadow + optional inner-top highlight. Glass = `bg-card/60` + `backdrop-blur-xl` + `border-white/8`.
- Motion: Framer Motion. Fade+rise 12px / 500ms / `cubic-bezier(.2,.7,.2,1)`. Hover lifts 2px. Reduced-motion respected.

## Foundation edits (cascade site-wide)

1. `src/styles.css` — rewrite token layer:
   - New OKLCH palette for light/dark, semantic tokens for `--surface`, `--surface-2`, `--border-hairline`, `--ring`, `--gradient-brand`, `--shadow-elegant`, `--shadow-glow`.
   - Utilities: `.glass`, `.glass-strong`, `.hairline`, `.text-gradient-brand`, `.bg-mesh`, `.bg-grid`, `.bg-noise`, `.hero-glow`, `.scroll-fade`.
   - `@utility` (v4) — no v3 `@layer utilities`.
2. `src/components/ui/button.tsx` — variants: `primary` (brand gradient + soft glow + inner highlight), `secondary` (glass), `ghost`, `outline` (hairline), `link`. Larger radius (`rounded-full` for CTA, `rounded-xl` for standard). Animated arrow on `.group` hover, focus ring `ring-2 ring-ring/60`, loading state.
3. `src/components/ui/card.tsx` — glass + hairline, hover elevation, optional gradient border via masked pseudo.
4. `src/components/ui/input.tsx`, `textarea`, `select` — floating labels helper, refined focus (ring + border shift), error shake.
5. `src/components/ui/table.tsx` — sticky header, zebra off, hairline rows, hover row highlight.
6. `src/components/navbar.tsx` — floating pill, glass, scroll shrink, gradient active underline, refined mobile sheet.
7. `src/components/footer.tsx` — quieter, columns aligned, hairline dividers, brand mark bottom-left.
8. `src/components/page-header.tsx` — already editorial; retune spacing, add mesh backdrop, gentle parallax.
9. `src/components/section.tsx` + `SectionHeading` — alternating tones (`default`, `alt`, `contrast`), consistent rhythm (`py-24 → py-32`), eyebrow with dot rule.
10. `src/components/empty-state.tsx` — abstract gradient glyph instead of single icon tile; richer copy tone.

## Home page (`src/routes/index.tsx`)

- Hero: massive display headline with brand-gradient accent word, eyebrow pill, dual CTAs (primary gradient + ghost with arrow), trust row of six pills — Student-first / AI Innovation / Open Source / Hackathons / Research / Startup Ecosystem (no fake numbers).
- Visual backdrop: mesh gradient + faint grid + noise, slow-drifting radial (60s), fades to bg at bottom.
- Sections rebuilt with distinct rhythm: What we build (bento), Programs, Community proof (logos/quotes if present), Open Source, CTA band. Alternating tones, no repeating 3-col grid.

## Cross-page pass

- Public pages (Hackathons, Events, About, Community, Blog, Careers, Contact, FAQs, Sponsors, Partners, Mentors, Judges, Resources, legal): inherit new PageHeader, cards, buttons — verify per-page spacing and hero copy retune where thin.
- Auth pages: glass card center, brand backdrop.
- Authenticated (Dashboard, Teams, Profile, Settings, Judge, Organizer, Certificates, Invitations, Notifications, Admin): retune hero blocks to match PageHeader language, upgrade stat/summary cards, empty states, tables.

## Motion

- `motion` variants module `src/lib/motion.ts` (fadeUp, stagger, scaleIn). Applied to hero, section headings, card grids.

## Accessibility

- Recheck contrast on the new tokens both modes, focus-visible rings on every interactive, `prefers-reduced-motion` disables transforms.

## Non-goals

- No new routes, no schema changes, no server functions, no RBAC edits, no CMS field changes, no copy on data-driven pages beyond hero/eyebrow retunes.

## Delivery order

1. Tokens + utilities in `styles.css`.
2. Primitives: button, card, input, table, badge.
3. Navbar + footer + page-header + section + empty-state.
4. Home hero + sections.
5. Auth + dashboard shells.
6. Sweep remaining public + authenticated pages.
7. Playwright pass in light + dark across ~15 representative routes.

Each step lands as its own commit-sized change; preview stays functional throughout.
