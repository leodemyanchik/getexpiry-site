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
- The page is English; it describes the app's EN/PL/RU support, not website localization.

Checked local routes (home/privacy/terms/auth/styles), FAQ interaction, CTA destinations, and horizontal overflow at 320, 375, 768, 1024 and 1440px.

## Pending landing and search update (2026-09-30)

Local changes add six item types, coupon-link sharing, related FAQ, robots.txt
and a public sitemap. See `docs/search-visibility.md` for release-verification
and Search Console prerequisites; these changes are not yet published.
Run `tests/landing.test.cjs` with Node and Playwright installed, against the local
server on port 8766 (override `SITE_URL` if needed).

## Coupon sharing

`c/` contains the EN/PL/RU public coupon page. It fetches only the public snapshot endpoint, not the private coupons table. QR/barcode rendering uses locally vendored bwip-js 4.11.4; its license is in `c/vendor`. Fonts and their licenses are in `c/fonts`. No analytics or external font requests are added to this page.

Publish `.well-known/apple-app-site-association` and `.nojekyll` as well. Confirm the AASA URL returns JSON over HTTPS without redirects before enabling Universal Links. Backend and app activation prerequisites are recorded in the app repository's `docs/coupon-sharing.md`. Publishing this folder alone does not activate the feature in existing App Store builds.
