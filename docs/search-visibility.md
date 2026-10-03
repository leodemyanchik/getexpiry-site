# Search visibility and landing update — 2026-09-30

## Update — 2026-10-03

This supersedes the older deployment/ownership prerequisites below, which are
retained as historical evidence.

### Verified before the new local work

- In Chrome, Search Console's URL-prefix property shows the homepage indexed,
  successful fetch/indexing, and matching user/Google canonical.
- Domain property `getexpiry.me` was added by the user on 2026-10-03. Its
  settings explicitly say the user is a verified owner. Its reports still
  show data processing; this is not evidence of an indexing failure.
- Google's verification TXT is visible on both authoritative Spaceship
  nameservers and public Google/Cloudflare resolvers. Keep it in DNS.
- Domain property Sitemap report contains `https://getexpiry.me/sitemap.xml`,
  status Successful, three discovered pages, last processed 2026-10-03.

### New first-stage pages — local, not deployed

The user approved starting with a Polish homepage and an English screenshot
guide. Implemented `/pl/` and `/save-coupons-from-screenshots/`, plus discoverable
links from both homepages, reciprocal EN/PL/x-default annotations for homepages,
unique metadata, guide BreadcrumbList, and two additional sitemap URLs.

The English-only guide links to the Polish homepage explicitly; it does not
pretend the homepage is its translation. The tutorial is based on current
published 1.0.4 workflows and existing English UI labels, not unreleased 1.0.5
feature claims. The actual coupon-list screenshot contains no redeemable code.
Recognition and retailer acceptance caveats are visible. No real coupon token
pages, auth routes or private data are added to the sitemap or structured data.

Dependency-free checks: `node tests/seo.test.cjs`. Chrome layout checks passed
for all three product pages at 320/375/768/812/1024/1440 widths with no horizontal
overflow and loaded images. FAQ expansion, guide anchors and language/site links
are verified separately. No automatic ranking improvement is promised.

After an authorized push/deployment, verify the two public routes, five-entry
sitemap, reciprocal alternates and indexed canonicals in Search Console. Its
existing sitemap URL is unchanged; no new property or DNS change is necessary.
Request indexing only after the new pages are live. Evaluate impressions,
queries and clicks by page over the following weeks before adding more topics.

No publish, commit, push, Search Console write, new analytics or hosting change
has been performed by this local implementation.

## Verified live

- Homepage returns HTTP 200, has static indexable HTML and a canonical URL.
- No homepage `noindex` meta or X-Robots-Tag was found.
- `/robots.txt` and `/sitemap.xml` return 404 before this local update.
- Search Console coverage has not been inspected. Low rankings or a `site:`
  search are not conclusive evidence that a page is not indexed.
- Apple public lookup for Poland returned 1.0.1 on this check; the user reported
  a newer release. Verify the actual downloadable release before publishing
  new-feature claims. This landing update is prepared locally, not deployed.

## Local changes

- Six content types and coupon sharing are described using the existing design.
- No shared-redemption synchronization or automatic Universal Link guarantees.
- Public sitemap includes home/privacy/terms only, never coupon token URLs.
- Shared coupon page retains `noindex,nofollow,noarchive`. Robots allows crawling
  so crawlers can see that directive; robots is not access control.

## Next steps

1. Verify domain ownership in Google Search Console (DNS record requires the
   verification token from the user's property; do not invent it).
2. After publication submit `https://getexpiry.me/sitemap.xml` and inspect the
   homepage URL. Review actual indexing exclusions and selected canonical.
3. Publish useful, original Polish/English content for real product use cases
   after choosing localization scope. Do not create doorway/keyword spam pages.
4. Consider a host migration for HTTP-header control and server-generated share
   previews, not as a promise of ranking improvement. Preserve the domain,
   routes, auth callbacks and Apple association file during any move.

No host migration, DNS change, Search Console registration or deployment was
performed as part of this local implementation.
