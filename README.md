# Expiry website

Static landing page for the released iPhone app. No build step or JavaScript dependency.

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
