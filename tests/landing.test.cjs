const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const base = process.env.SITE_URL || 'http://127.0.0.1:8766';
(async () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('rel="canonical" href="https://getexpiry.me/"'));
  assert.ok(!html.includes('noindex'));
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, require('./seo-pages.cjs').length + 2);
  assert.ok(!sitemap.includes('/c/') && !sitemap.includes('/auth/'));
  assert.ok(fs.readFileSync(path.join(root, 'c/index.html'), 'utf8').includes('noindex'));
  const browser = await chromium.launch({headless: true, channel: 'chrome'});
  try {
    const page = await browser.newPage({reducedMotion: 'reduce'});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of ['/', '/pl/']) for (const width of [320, 375, 768, 812, 1024, 1440]) {
      await page.setViewportSize({width, height: width === 812 ? 375 : 812});
      await page.goto(base + route);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.wallet-types article').count(), 6);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      assert.equal(await page.locator('#cards .release-label').count(), 1);
      assert.equal(await page.locator('#cards .cards-benefits h3').count(), 2);
      assert.equal(await page.locator('#cards .release-label').textContent(), route === '/' ? 'AVAILABLE NOW' : 'JUŻ DOSTĘPNE');
      const faq = page.locator('details').filter({hasText: route === '/' ? 'Where do I find my loyalty cards?' : 'Gdzie znajdę swoje karty lojalnościowe?'});
      await faq.locator('summary').click();
      assert.ok(await faq.getAttribute('open') !== null);
      for (const href of await page.locator('a[href*="apps.apple.com"]').evaluateAll(links => links.map(link => link.href))) {
        const destination = new URL(href);
        assert.equal(destination.origin + destination.pathname, 'https://apps.apple.com/app/id6780260457');
        assert.ok(!destination.search || destination.search === '?l=pl');
      }
      if ([375,1440].includes(width) && process.env.PREVIEW_PATH) {
        await page.locator('#cards').screenshot({path: process.env.PREVIEW_PATH.replace(/\.png$/, `-${route === '/' ? 'en' : 'pl'}-${width}.png`)});
      }
    }
    assert.deepEqual(errors, []);
    assert.equal((await page.request.get(`${base}/robots.txt`)).status(), 200);
    assert.equal((await page.request.get(`${base}/sitemap.xml`)).status(), 200);
    console.log('Landing checks passed: EN/PL at six sizes, released Cards section and FAQ, App Store links, six item types, SEO files.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
