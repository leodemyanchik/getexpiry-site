const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://getexpiry.me';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = [
  {file: 'index.html', route: '/', lang: 'en'},
  {file: 'pl/index.html', route: '/pl/', lang: 'pl'},
  {file: 'save-coupons-from-screenshots/index.html', route: '/save-coupons-from-screenshots/', lang: 'en'},
];
const alternates = [
  ['en', `${origin}/`],
  ['pl', `${origin}/pl/`],
  ['x-default', `${origin}/`],
];

for (const page of pages) {
  const html = read(page.file);
  assert.ok(html.includes(`<html lang="${page.lang}">`), `language: ${page.route}`);
  assert.ok(html.includes(`rel="canonical" href="${origin}${page.route}"`), `canonical: ${page.route}`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `one h1: ${page.route}`);
  assert.ok(/<title>[^<]+<\/title>/.test(html), `title: ${page.route}`);
  assert.ok(/<meta name="description" content="[^"]+">/.test(html), `description: ${page.route}`);
  assert.ok(html.includes('href="#main"'), `skip link: ${page.route}`);
  assert.ok(html.includes('id="main" tabindex="-1"'), `focusable main target: ${page.route}`);
  assert.ok(!html.includes('noindex'), `indexable: ${page.route}`);
  assert.ok(!/googletagmanager|google-analytics|gtag\(/i.test(html), `no tracking: ${page.route}`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `unique IDs: ${page.route}`);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(match[1]), `anchor ${match[1]} on ${page.route}`);
  }
  for (const match of html.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[?#][^"]*)?"/g)) {
    const local = match[1];
    const target = path.join(root, local.endsWith('/') ? `${local}index.html` : local);
    assert.ok(fs.existsSync(target), `local link ${local} on ${page.route}`);
  }
  for (const match of html.matchAll(/href="(https:\/\/apps\.apple\.com\/[^\"]+)"/g)) {
    assert.ok(match[1].includes('id6780260457'), `released App Store destination: ${page.route}`);
  }
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const block of blocks) JSON.parse(block[1]);
}

for (const page of pages.slice(0, 2)) {
  for (const [lang, url] of alternates) {
    assert.ok(read(page.file).includes(`rel="alternate" hreflang="${lang}" href="${url}"`), `reciprocal ${lang} on ${page.route}`);
  }
  assert.equal((read(page.file).match(/<article><h3>/g) || []).length, 6, `six wallet types: ${page.route}`);
}

const guide = read(pages[2].file);
assert.ok(!guide.includes('rel="alternate"'), 'do not label Polish homepage as a translated guide');
assert.ok(guide.includes('Import from Photos') && guide.includes('Review details'));
assert.ok(guide.includes('Share Extension') && guide.includes('Recognition can make mistakes'));
const breadcrumbs = JSON.parse(guide.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
assert.equal(breadcrumbs.itemListElement[1].item, `${origin}${pages[2].route}`);

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(urls.length, 5);
assert.equal(new Set(urls).size, 5);
for (const page of pages) assert.ok(urls.includes(`${origin}${page.route}`));
assert.ok(!urls.some(url => /\/c\/|\/auth\/|\?t=/.test(url)), 'no coupon tokens or auth URLs');
assert.ok(read('robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok(read('c/index.html').includes('noindex'), 'shared coupons stay excluded');

const screenshot = fs.readFileSync(path.join(root, 'assets/screenshots/coupon-wallet-en.png'));
assert.equal(screenshot.readUInt32BE(16), 1206);
assert.equal(screenshot.readUInt32BE(20), 2622);
console.log('SEO checks passed: 3 product pages, reciprocal EN/PL, 5 sitemap URLs, links, privacy exclusions and screenshot.');
