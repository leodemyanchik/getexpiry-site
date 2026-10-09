# Website analytics — 2026-10-09

## Configuration

- Google Analytics account: Expiry, account ID `411362236`.
- Property: getexpiry.me — Website, ID `558264834`.
- Stream: Expiry website, `https://getexpiry.me`, stream ID `16094882692`.
- Measurement ID: `G-BLWC2E75V4` (public identifier, not a secret).
- Reporting timezone: Poland/Warsaw. Reporting currency: USD; no revenue tracking.
- Enhanced measurement is off. Optional account data-sharing boxes were disabled during setup.
- Google Signals and advertising personalization are disabled by the website integration.
- No Measurement Protocol secret, Ads link or additional account access was created.

## Collection and privacy

`assets/site-analytics.js` loads Google only after explicit consent on ten
allowlisted public pages: EN/PL homepages and guides, privacy and terms.
Coupon-token, auth and unknown routes are excluded. Local previews never load Google.
Equal-access accept/reject buttons are available in English and Polish.
Footer settings permit withdrawal. Choice is device-local for 180 days; GA cookies
are configured for 90 days without sliding renewal. Refusal/withdrawal clears GA
cookies, disables the counter and drops queued commands. Already collected or
in-flight data cannot be recalled. Privacy page describes this behavior.

Collected events: a single explicit `page_view` per loaded document and
`app_store_click` for this app's listing. CTA events include only site language,
store and CTA position; they are clicks, **not confirmed installs**.
Page URLs omit arbitrary queries/fragments. Four campaign labels may be retained
when they contain only letters/numbers/underscores/hyphens (maximum 80 characters).
External referrers are reduced to origin; private same-origin paths are removed.
No coupon content, account details or private link tokens are passed by this code.

This is a consent-based subset of visits, not all website visitors. Ad blockers,
refused consent and unavailable storage can affect counts. No historical traffic
can be backfilled. Initial setup/testing adds our own visits to reports.

## Finding reports

Open the property at
https://analytics.google.com/analytics/web/#/a411362236p558264834/reports/intelligenthome
and use Reports / traffic acquisition for channels and session source/medium,
pages/screens for visited pages, demographics for countries, and events for
`app_store_click`. Real-time is useful for confirming a test visit. Standard
reports need processing and may not populate immediately after installation.

For social posts use consistent non-personal UTM labels, for example:
`https://getexpiry.me/?utm_source=instagram&utm_medium=social&utm_campaign=profile`.
Do not put email addresses, user IDs, coupon codes or private data in campaign labels.

## Verification

- Dependency-free tests: `node tests/site-analytics.test.cjs` (12 checks),
  `node tests/site-language.test.cjs` (14 checks), `node tests/seo.test.cjs`.
- Browser checks: mobile EN/PL accept/refuse, settings and focus restoration;
  local preview has no Google script. Responsive styles preserve keyboard focus
  and equivalent accept/reject buttons (UI/UX Pro Max guidance).
- Publish status and live collection must be verified separately; local tests
  do not establish deployment or successful delivery to Google.
