# Search visibility and landing update — 2026-09-30

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
