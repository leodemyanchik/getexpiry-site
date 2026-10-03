# Expiry website

Static landing page for the released iPhone app. No build step. The coupon-sharing page uses vendored browser JavaScript.

## Local preview

Run `python -m http.server 8765 --bind 127.0.0.1` from this directory and open http://127.0.0.1:8765/.

## Design (September 2026)

Light editorial direction: warm off-white, dark ink, Expiry purple, Outfit headings and DM Sans body text (Google Fonts with system fallbacks). UI/UX Pro Max guidance informed hierarchy, clear download actions, keyboard focus, reduced motion and responsive layout. Brand purple intentionally replaces the search tool's generic pink recommendation.

- Landing: `index.html` and `assets/landing.css`.
- All download links use App Store ID 6780260457; no TestFlight CTA.
- Coupon visuals are labeled CSS illustrations, not actual app screenshots or user records.
- Legal pages and auth handoff use `assets/pages.css`, sharing the landing's palette and typography. Legal text and auth callback script remain unchanged.
- No analytics scripts, cookies or new tracking added. External Google Fonts was already used by the website.
- The published homepage was originally English; a Polish homepage is now
  prepared locally at `/pl/` (see the first SEO expansion below). App language
  support does not imply that all website routes are translated.

Checked local routes (home/privacy/terms/auth/styles), FAQ interaction, CTA destinations, and horizontal overflow at 320, 375, 768, 1024 and 1440px.

## Landing and search update (2026-09-30)

The six item types, coupon-link sharing, related FAQ, robots.txt and the original
three-page sitemap are published. Search Console was checked on 2026-10-03:
the homepage is indexed, the sitemap succeeds, and the user is a verified owner
of both `https://getexpiry.me/` and the Domain property `getexpiry.me`.
See `docs/search-visibility.md` for dated evidence and new-page status.
Run `tests/landing.test.cjs` with Node and Playwright installed, against the local
server on port 8766 (override `SITE_URL` if needed).

## First SEO expansion (2026-10-03, local until published)

- `/pl/`: complete Polish product landing, using the same visual language.
- `/save-coupons-from-screenshots/`: original English iPhone import guide with
  two workflows, review checklist, reminders, retailer caveats and an actual
  English app screenshot from the user's 1.0.4 App Store asset set.
- Homepages link to one another with reciprocal `en`, `pl`, `x-default`
  alternates. No false Polish alternate is declared for the English-only guide.
- Unique titles/descriptions/canonicals, guide breadcrumbs, EN/PL navigation,
  homepage-to-guide links and five public sitemap entries.
- Shared coupon token pages remain `noindex`; auth callbacks, legal text,
  Apple association data, DNS, hosting and tracking are not changed.
- Existing brand colors and Outfit/DM Sans are retained; new layouts preserve
  keyboard focus, 44px language links and reduced-motion behavior.

Run `node tests/seo.test.cjs` for dependency-free static checks. Browser QA uses
the local server and routes above at 320, 375, 768, 812 (landscape), 1024, 1440px.
New pages are **not live** until this checkout is committed/pushed and the
GitHub Pages deployment succeeds; then recheck public URLs and Search Console.

## Coupon sharing

`c/` contains the EN/PL/RU public coupon page. It fetches only the public snapshot endpoint, not the private coupons table. QR/barcode rendering uses locally vendored bwip-js 4.11.4; its license is in `c/vendor`. Fonts and their licenses are in `c/fonts`. No analytics or external font requests are added to this page.

Publish `.well-known/apple-app-site-association` and `.nojekyll` as well. Confirm the AASA URL returns JSON over HTTPS without redirects before enabling Universal Links. Backend and app activation prerequisites are recorded in the app repository's `docs/coupon-sharing.md`. Publishing this folder alone does not activate the feature in existing App Store builds.
