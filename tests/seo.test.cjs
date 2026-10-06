const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const origin = 'https://getexpiry.me';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const pages = require('./seo-pages.cjs');
const titles = new Set();
const descriptions = new Set();

for (const page of pages) {
  const html = read(page.file);
  assert.ok(html.includes(`<html lang="${page.lang}">`), `language: ${page.route}`);
  assert.ok(html.includes(`rel="canonical" href="${origin}${page.route}"`), `canonical: ${page.route}`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `one h1: ${page.route}`);
  assert.ok(/<title>[^<]+<\/title>/.test(html), `title: ${page.route}`);
  assert.ok(/<meta name="description" content="[^"]+">/.test(html), `description: ${page.route}`);
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)[1];
  assert.ok(!titles.has(title), `unique title: ${page.route}`);
  assert.ok(!descriptions.has(description), `unique description: ${page.route}`);
  titles.add(title); descriptions.add(description);
  assert.ok(html.includes(`property="og:url" content="${origin}${page.route}"`), `OG URL: ${page.route}`);
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
  const pair = pages.filter(p => p.topic === page.topic);
  const en = pair.find(p => p.lang === 'en');
  for (const [lang, url] of [...pair.map(p => [p.lang, `${origin}${p.route}`]), ['x-default', `${origin}${en.route}`]]) {
    assert.ok(html.includes(`rel="alternate" hreflang="${lang}" href="${url}"`), `reciprocal ${lang} on ${page.route}`);
  }
  assert.equal((html.match(/rel="alternate" hreflang=/g) || []).length, 3, `only true translations: ${page.route}`);
  if (page.topic !== 'home') {
    assert.equal(blocks.length, 1);
    const breadcrumbs = JSON.parse(blocks[0][1]);
    assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
    assert.equal(breadcrumbs.itemListElement[0].item, `${origin}${page.lang === 'pl' ? '/pl/' : '/'}`);
    assert.equal(breadcrumbs.itemListElement[1].item, `${origin}${page.route}`);
    const other = pair.find(p => p.lang !== page.lang);
    assert.ok(html.includes(`href="${other.route}" lang="${other.lang}" hreflang="${other.lang}" data-site-language="${other.lang}"`), `same-guide language switch: ${page.route}`);
    assert.ok(html.includes('class="wrap related-guides"'), `related guides: ${page.route}`);
    for (const related of pages.filter(p => p.lang === page.lang && p.topic !== 'home' && p.topic !== page.topic)) {
      assert.ok(html.includes(`href="${related.route}"`), `related link ${related.route} on ${page.route}`);
    }
  } else {
    for (const guide of pages.filter(p => p.lang === page.lang && p.topic !== 'home')) {
      assert.ok(html.includes(`href="${guide.route}"`), `homepage discovers ${guide.route}`);
    }
  }
}

for (const page of pages.slice(0, 2)) {
  assert.equal((read(page.file).match(/<article><h3>/g) || []).length, 6, `six wallet types: ${page.route}`);
}

const guide = read(pages[2].file);
assert.ok(!guide.includes('hreflang="pl" href="https://getexpiry.me/pl/"'), 'Polish guide, not homepage, is the translation');
assert.ok(guide.includes('Import from Photos') && guide.includes('Review details'));
assert.ok(guide.includes('Share Extension') && guide.includes('Recognition can make mistakes'));
assert.ok(guide.includes('Default currency') && guide.includes('Custom date &amp; time') && guide.includes('Version 1.0.5'));
assert.ok(!guide.includes('open Expiry and share the image again'), 'do not prescribe the old pre-import workaround');
const breadcrumbs = JSON.parse(guide.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(breadcrumbs['@type'], 'BreadcrumbList');
assert.equal(breadcrumbs.itemListElement[1].item, `${origin}${pages[2].route}`);

const sitemap = read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(urls.length, pages.length + 2);
assert.equal(new Set(urls).size, urls.length);
for (const page of pages) assert.ok(urls.includes(`${origin}${page.route}`));
assert.ok(!urls.some(url => /\/c\/|\/auth\/|\?t=/.test(url)), 'no coupon tokens or auth URLs');
assert.ok(read('robots.txt').includes(`Sitemap: ${origin}/sitemap.xml`));
assert.ok(read('c/index.html').includes('noindex'), 'shared coupons stay excluded');

const screenshot = fs.readFileSync(path.join(root, 'assets/screenshots/coupon-wallet-en.png'));
assert.equal(screenshot.readUInt32BE(16), 1206);
assert.equal(screenshot.readUInt32BE(20), 2622);
for (const page of pages.filter(p => p.topic === 'reminders')) {
  const html = read(page.file);
  assert.ok(html.includes(page.lang === 'en' ? 'Add Reminder' : 'Dodaj przypomnienie'));
  assert.ok(html.includes('Scheduled Summary') || html.includes('podsumowanie powiadomień'));
  assert.ok(html.includes(page.lang === 'en' ? 'not an app screenshot' : 'nie zrzut ekranu'));
}
console.log(`SEO checks passed: ${pages.length} product pages, 4 reciprocal EN/PL pairs, ${urls.length} sitemap URLs, unique metadata, guide links and privacy exclusions.`);
