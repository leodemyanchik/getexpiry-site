# Search Console verification — 6 October 2026

Live Chrome inspection of Domain property `sc-domain:getexpiry.me`, after
the user agreed to the next SEO step. This is a Search Console observation,
not an inference from public HTTP status or a search-engine query.

## URL inspection and requests

| URL path | Observed index status before request | Action confirmed |
| --- | --- | --- |
| `/` | URL in Google index | Read only; canonical verified |
| `/pl/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/save-coupons-from-screenshots/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/pl/jak-zapisac-kupon-ze-zrzutu-ekranu/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/coupon-expiry-reminders/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/pl/przypomnienia-o-waznosci-kuponow/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/organize-coupons-vouchers-cards/` | URL unknown to Google; not indexed | Indexing request accepted |
| `/pl/kupony-bony-karty-w-jednym-miejscu/` | URL unknown to Google; not indexed | Indexing request accepted |

All seven requests ended with the explicit confirmation that the URL was
added to the priority crawl queue. No CAPTCHA challenge was solved and no
request was repeated for the same page.

For the seven unindexed URLs, the initial indexed-data report had no crawl
date, no referring sitemap/page and no user/Google-selected canonical. These
absences do not prove a canonical, robots or server fault. The request flow
checked eligibility before accepting each URL; no separate live-test report
was retrieved. Acceptance is not confirmation of indexing or a ranking gain.

For `/`, Search Console confirms successful smartphone Googlebot retrieval,
crawling and indexing permitted, and last crawl `3 Oct 2026, 21:13:11` as
displayed by the console. User canonical is `https://getexpiry.me/`; Google
canonical is the inspected URL. Sitemap is `https://getexpiry.me/sitemap.xml`.
No homepage reindex request was sent.

## Sitemap

The existing sitemap entry initially showed Successful, submitted September
30, last processed October 3, and only three discovered pages. Resubmitted
the same existing URL `https://getexpiry.me/sitemap.xml`, without creating
another sitemap or changing DNS/property ownership. Confirmed the success
dialog, then the updated row: submitted and processed October 6, Successful,
**10 discovered pages**, zero videos. Discovered pages are not indexed pages.

The overall indexing report still said data was processing when the property
overview was first opened. Its zero-click card has no verified reporting
period in this check; do not treat it as an all-time traffic result.

## Evidence and next step

Proof PNGs saved to the app checkout's ignored directory
`D:/LeoWork/expiry/build/seo-2026-10-06/`:

- `pl-home-requested.png`
- `screenshots-en-requested.png`, `screenshots-pl-requested.png`
- `reminders-en-requested.png`, `reminders-pl-requested.png`
- `wallet-en-requested.png`, `wallet-pl-requested.png`
- `en-home-indexed.png`
- `sitemap-submitted.png`, `sitemap-success-ten-pages.png`

Revisit URL inspections after Google has had time to crawl and record the
actual indexed status, chosen canonical and any new exclusion reason. Do
not repeatedly submit the same requests. No fixed completion date or ranking
promise, monitoring automation, external outreach, code deployment, app or
backend change resulted from this Search Console step. Audit notes are local.
