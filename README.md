# Aquaku Shop â€” Aquascaping Homepage

A Next.js (App Router) + TypeScript + Tailwind rebuild of the "Verdant Waters"
Stitch homepage design: sticky nav, hero, brand story, category grid,
featured products, a 7-step build guide, aquascape style showcase, a value
strip, and a masonry inspiration gallery.

## A note on versions (security)

This project was originally scaffolded on Next.js 14.2.5. That line is now fully
end-of-life (EOL since Oct 26, 2025) and was carrying a critical middleware
auth-bypass vulnerability (CVE-2025-29927) plus a high-severity RSC
denial-of-service issue (CVE-2025-55184 / CVE-2025-67779). Since 14.x will
never receive another patch, the project has been moved to **Next.js 16.2.12**
(the current Active LTS line) with matching **React 19.2** and **ESLint 9**
(flat config, see `eslint.config.mjs`) rather than just patching the dead
14.x branch.

Nothing in this codebase relies on the Next 15/16 breaking changes (no
`cookies()`/`headers()`, no dynamic route `params`, no middleware), so the
upgrade should be a clean `npm install` with no code changes required. Still,
after installing:

```bash
npm install
npm run build   # confirms nothing broke
npm audit       # should now report 0 (or only unrelated dev-only) issues
```

Next.js does monthly security releases now, so before you deploy, it's worth
a quick check on https://nextjs.org/blog for anything newer than 16.2.12.

### Round 2: the remaining `npm audit` findings

After the 14 â†’ 16 upgrade, the critical middleware-bypass and high RSC DoS
issues are gone. What's left (all "high") are three *nested* dependencies
that Next.js and the ESLint plugin chain bundle internally and haven't bumped
yet on their end:

- **`brace-expansion`** (DoS) â€” pulled in transitively by ESLint's plugin
  chain (`eslint-config-next` â†’ `eslint-plugin-*` â†’ `minimatch`). Dev/lint
  tooling only; never runs against untrusted input in normal use.
- **`postcss`** (XSS / source-map path traversal) â€” bundled *inside*
  `next`'s own `node_modules`, separate from the `postcss` we use directly
  for Tailwind. This is a known, widely-reported issue where Next.js pins an
  old internal postcss version â€” see
  [vercel/next.js#93234](https://github.com/vercel/next.js/issues/93234).
- **`sharp`** (inherited libvips CVEs) â€” also bundled inside `next`, used by
  `next/image`'s built-in optimizer. This one matters more if you self-host
  with `next start`, since it does run at request time (on Vercel, image
  optimization happens on Vercel's infrastructure instead).

**Do not run `npm audit fix --force`.** Its suggested fix downgrades `next`
all the way to `9.3.3` and reintroduces every issue from Round 1 â€” that's
npm's resolver picking the nearest version *outside* the flagged range, not
an actual safe version.

Instead, this `package.json` pins the fixed versions directly via an
[`overrides`](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#overrides)
block, which forces npm to use patched versions of these nested packages
without touching the top-level `next`/`eslint` versions:

```json
"overrides": {
  "brace-expansion": "^5.0.8",
  "postcss": "^8.5.23",
  "sharp": ">=0.35.0"
}
```

After `npm install`, re-run `npm audit` â€” it should come back clean. If a
newer Next.js patch has since bundled fixed versions itself, npm may report
these overrides as unnecessary/no-ops, which is fine to leave in place.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Project structure

```
app/
  layout.tsx        Root layout, loads Poppins (display) + Inter (body) via next/font
  page.tsx           Composes the homepage from the section components
  globals.css        Tailwind layers + small utilities (glass nav, scroll reveal)
components/
  layout/            Navbar, Footer
  home/               One component per homepage section
  ui/                 Reusable pieces: ProductCard, StarRating, Badge, SectionHeading, SectionReveal
data/                 Mock data (products, categories, styles, gallery, build steps)
lib/                  Shared TypeScript types + the IDR currency formatter
tailwind.config.ts    Color, type scale, spacing, and radius tokens from DESIGN.md
```

## Swapping in real data

Everything on the page is rendered from the arrays in `data/*.ts`, typed
against the interfaces in `lib/types.ts`. To connect a real backend or CMS,
replace the contents of those files with fetch calls (e.g. in a Server
Component) that return the same shapes â€” the components themselves don't
need to change.

## Placeholder images

Every image currently points to **picsum.photos** with a fixed seed (e.g.
`.../seed/aqua-hero/1600/1000`) purely so the layout has something realistic
to render out of the box. Swap these for your own product photography before
launch â€” `next.config.mjs` only whitelists `picsum.photos` for
`next/image`, so add your real image host(s) to `images.remotePatterns`
when you do.

## Design tokens

All colors, type sizes, spacing, and border radii in `tailwind.config.ts`
are transcribed directly from the original `DESIGN.md` ("Verdant Waters")
so the visual language stays consistent if you extend the site â€” e.g. use
`font-display text-headline-lg text-primary` for a section heading, or
`shadow-soft` / `shadow-soft-hover` for the card elevation system.

## Notes on this build

- This delivers the **homepage only** (as scoped). Category, product-detail,
  cart, and checkout pages aren't built yet â€” the nav and "Shop Now" /
  "View All Products" links point to routes like `/shop`, `/category/plants`,
  `/product/[slug]` that you can build next using the same data layer.
- The "Bringing Nature Home" section was rewritten with more specific,
  concrete copy plus a stat strip and a founder pull-quote â€” all placeholder
  content, so edit `components/home/AboutSection.tsx` with your real story.
