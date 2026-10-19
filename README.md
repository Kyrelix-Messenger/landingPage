# Kyrelix landing page

A single-page site for the Kyrelix messenger. React 19, TypeScript, Vite 7 and framer-motion. The design follows the messenger client: glass, a static gradient, light and dark themes, and the same 10 languages. The hero has a live messenger demo. Feature cards and the final call to action keep their cursor spotlights.

## Getting started

```bash
npm install
npm run dev            # http://localhost:5180
npm run build          # types, client build, 10 static locale pages and SEO checks; output in dist/
npm run preview        # http://localhost:5181, check the build
npm run lint
npm run format         # prettier
npm run check:types    # types, tests included
npm test               # node:test, 125 tests
npm run check:seo      # verify the generated HTML, metadata, sitemap, links and assets in dist/
```

Node 20.19 or newer is required (Vite 7). `dist/` is plain static output. The English page lives at `/`; the other nine translations live in locale directories such as `/ru/` and `/ar/`. Every directory contains its own `index.html`. The existing anchors still navigate within a page. Serve these files directly and return 404 for unknown paths; an SPA fallback is not needed.

## Deployment

`.github/workflows/deploy.yml` runs on every push and pull request (lint, types, tests, build) and publishes `dist/` to GitHub Pages on a push to `main`. It can also be started by hand from the Actions tab.

One-time setup: **Settings, Pages, Source: GitHub Actions**. The site uses relative asset paths (`base: "./"`), so it works both at `https://<org>.github.io/landingPage/` and at the root of a custom domain. To use a domain such as `kyrelix.org`, set it in Settings, Pages (and point DNS at GitHub); no `CNAME` file is needed with Actions deployments.

## Structure

```
src/
  app/            shell, global styles (tokens.css, base.css)
  pages/home/     the page, made of sections
  widgets/        sections and larger blocks
    app-preview/  the live messenger window and the demo chat (pacing in model/pacing.ts)
    appearance/   the theme comparison
    ...           hero, features, languages, roadmap, faq, cta, header, footer
  shared/
    boot/         language and theme kernel: inlined into <head>, runs before the first paint
    i18n/         dictionaries (en.ts is the source), language store
    theme/        theme store
    lib/          smoothScroll.ts, cn.ts
    ui/           button, icons, avatar, bubble, GlowSurface, Reveal, Section
tests/            dictionaries, language detection, links, chat pacing, theme comparison, SEO
```

## Where to change things

| What                  | Where                                                                                                                                  |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Web version address   | `src/shared/config/links.ts` (`web.kyrelix.org`), written nowhere else                                                                 |
| Texts                 | `src/shared/i18n/dictionaries/*.ts`. `en.ts` is the source and the others are typed against it: a missing or extra key is a type error |
| Language list         | `LOCALES` in `src/shared/boot/boot.ts`; every language needs a dictionary (a test checks this)                                         |
| Colours, radii, glass | `src/app/styles/tokens.css`                                                                                                            |
| Scale                 | `src/app/styles/base.css` (the root `font-size` formula)                                                                               |
| Demo chat pacing      | `src/widgets/app-preview/model/pacing.ts`                                                                                              |

Copy style: short plain sentences, no long dashes, no hype, no promises the app does not keep. For every language `tests/locales.test.ts` checks the same keys as English, no empty strings, no dashes or spaced hyphens, no HTML or Markdown, no copies of the English text, the right script for ru, zh, ja and ar, and a non-breaking space before `: ; ? !` in French.

## Language and the translate prompt

Each public URL has a stable language: `/` is English, `/ru/` is Russian, and so on. Browser and saved language preferences never override an explicit page. Old `?lang=xx` links still work: the client replaces the query parameter with the corresponding locale path and keeps other query parameters and anchors. A manual language change keeps the existing fade, updates history and metadata, and works with Back/Forward. Locale controls are ordinary links, so translations can also be opened in another tab or without JavaScript. The choice is still remembered in `kyrelix-site-locale`; the pure resolver retains browser/storage fallback for callers without a page locale.

The browser's "Translate this page" prompt is suppressed only when we show a language we support ourselves. The `boot.ts` kernel does this: it is inlined into `<head>` (a plugin in `vite.config.ts`) and runs before the first paint, so the browser sees the final `lang`, `dir` and `translate` right away. It must not import anything.

| Situation                                                | What the browser sees                                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The visitor's language is supported, the site uses it    | `<meta name="google" content="notranslate">`, `translate="no"`, `class="notranslate"`: no prompt  |
| The visitor's language is not supported, site in English | nothing is blocked, the prompt and translator extensions work; the page shows a note about it     |
| The visitor picked a language on the site                | as in the first row; picking English with an unsupported browser language opens translation again |

The decision tables are in `tests/detection.test.ts`. Arabic: `dir="rtl"` on the whole document, and the layout mirrors through logical properties.

## Theme

Follows `prefers-color-scheme` live. The header button switches it by hand and remembers the choice (`kyrelix-site-theme`); going back to the system theme clears the override. The theme button inside the messenger window changes the theme of the window only; if the page theme changes afterwards, the window follows the page again.

## Background and effects

The page and the messenger window keep their CSS gradients and static colour fields. Feature cards and the final call to action keep the cursor glow, moved with CSS transforms by `GlowSurface`. The floating 3D shapes, press particles, glare inside the hero chat, window tilt and background parallax were removed together with their unused source files and dependencies. Chat animations, panel switching, theme comparison and ordinary hover/focus feedback remain.

## Motion and transparency

- `prefers-reduced-motion`: short colour and opacity changes stay; chat and panel transitions are shortened. Smooth scrolling to anchors is shortened, not removed.
- `prefers-reduced-transparency`: the glass gets denser but stays glass. On Windows this is on when "Transparency effects" is off.
- `framer-motion` is used through `LazyMotion` and `m.*` components (`strict` stops a full `motion` import from sneaking back in).

## Contrast

The client does not meet WCAG AA for small text on glass; the site does: secondary text is darker in the light theme and lighter in the dark one, highlighted rows (`--row-lit-bg`) are lit less, and the header is denser than ordinary glass (`--header-bg`). The check was done on a screenshot with transparent text: the background colour under every text node against the text colour, threshold 4.5 (3 for large text). Scroll step 380 px, both themes, widths 1440 and 390, with and without `prefers-reduced-transparency`: 0 violations. Repeat it after changing colours or the background.

## Technical decisions that are easy to break

- `overflow: clip`, not `hidden`, in the preview window: `hidden` makes a scroll container, and focus or `scrollIntoView` can shift the contents.
- Swapping the window panels is computed by hand (FLIP through `offsetLeft` and the Web Animations API), and chat rows grow by animating their height.
- `Reveal` only lifts a block and never changes its opacity: an element with `opacity < 1` becomes a backdrop root, so the glass inside cannot see the page while the animation runs (the blocks used to be grey and then turn blue).
- The header's glass sits on `::before`: a nested `backdrop-filter` cannot see the page.

## Before publishing

- The roadmap has "Kyrelix for Business". In the client it exists only as translation keys, with no screens. If there will be no such product, delete the entry in `src/widgets/roadmap/Roadmap.tsx` and the `roadmap.business.*` keys in every dictionary.
- The "Android and iOS: planned" line is based on the customer's word. Calls are marked "in development" because calls in the client are still a placeholder.
- About encryption the site only says the connection is protected by TLS and that end-to-end encryption is not available yet. Do not call it E2EE until the client has it.
- SEO implementation and publishing checks: [docs/SEO.md](docs/SEO.md).

## Static rendering and SEO

`npm run build` first builds the normal client assets, then `scripts/prerender.ts` builds a temporary SSR entry under `node_modules/.cache/kyrelix-prerender` and renders the same React components for each existing dictionary. No server runtime or new dependency is required. `main.tsx` hydrates that HTML; locale stores are created separately for each render so translations cannot leak between pages.

`src/shared/seo/metadata.ts` supplies both static and client metadata: translated title/description, self-canonical URLs, reciprocal hreflang links with `x-default`, Open Graph/Twitter image metadata, and JSON-LD for the organization, site, page and web application. Only existing product features are described. It also generates `robots.txt` and `sitemap.xml` from the published locale list. The canonical domain is `SITE_URL` in `src/shared/config/links.ts`.

`public/og-image.png` is a 1200 × 630 preview of the existing site. The build runs `scripts/check-seo.ts` against the final files and fails on missing static content, broken asset paths, incorrect locale metadata or an invalid social image. The hero text is visible immediately, including without JavaScript. The below-the-fold theme comparison is created when it approaches the viewport.

The prerender step inlines the existing built CSS into every locale document, so the first paint does not wait for a separate stylesheet request. The stylesheet currently has no external asset URLs; preserve that property when adding CSS assets, or update URL handling in the prerender step. The build also checks heading order and rejects render-blocking stylesheet links. Performance measurements and the GitHub Pages cache limitation are documented in [docs/PERFORMANCE.md](docs/PERFORMANCE.md).
