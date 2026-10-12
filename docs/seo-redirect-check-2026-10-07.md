# Search Console redirect alert — 7 October 2026

Read-only investigation of the user's email/screenshot in Chrome, Domain
property `getexpiry.me`. Page indexing report last updated October 4; redirect
category detection date October 5. No validation or new indexing request sent.

## Exact affected URLs and public response checks

| Affected URL | HTTP response | Destination | Destination response |
| --- | --- | --- | --- |
| `http://getexpiry.me/` | 301 | `https://getexpiry.me/` | 200 |
| `https://getexpiry.me/terms` | 301 | `https://getexpiry.me/terms/` | 200 |
| `https://getexpiry.me/privacy` | 301 | `https://getexpiry.me/privacy/` | 200 |

Each is a single permanent redirect, with no loop or failed destination.
Chrome's indexed-pages report lists precisely those three final HTTPS URLs
as indexed. Displayed crawl dates: homepage October 3, terms September 28,
privacy September 3. Report date is historical, not a fresh crawl today.

The alert concerns HTTP normalization and GitHub Pages directory trailing
slashes, not the five SEO pages published October 6. The ten-entry sitemap
uses the destination URLs, not these redirected variants. Static SEO tests
pass. No reason to remove HTTPS or slash redirects or claim they were fixed.

Source checked: [Google Page indexing report, Page with redirect](https://support.google.com/webmasters/answer/7440203?hl=en#page_with_redirect).
This category describes an unindexed redirecting URL; target indexing must
be checked separately, which the indexed-pages list confirms here.

Small nonblocking cleanup opportunity found in source: legal-page footer
links still use `/terms` and `/privacy`, without slashes; legal pages lack an
explicit HTML canonical tag. These destinations are nevertheless already
indexed. No source fix was requested or implemented. Main/product-page
canonicals and sitemap are correct; retained old footer links incur a normal
single hop. This investigation does not establish a new indexing status for
the seven pending product URLs from October 6.

No site edits, redirect/DNS/hosting changes, Search Console submissions,
commit or push. These are local audit notes only.
