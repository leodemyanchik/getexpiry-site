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
    for (const width of [320, 375, 768, 812, 1024, 1440]) {
      await page.setViewportSize({width, height: width === 812 ? 375 : 812});
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('.wallet-types article').count(), 6);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      const faq = page.locator('details').filter({hasText: 'Does someone need Expiry'});
      await faq.locator('summary').click();
      assert.ok(await faq.getAttribute('open') !== null);
      if (width === 1440 && process.env.PREVIEW_PATH) {
        await page.locator('#wallet').screenshot({path: process.env.PREVIEW_PATH});
        await page.locator('#sharing').screenshot({path: process.env.PREVIEW_PATH.replace(/\.png$/, '-sharing.png')});
      }
    }
    assert.deepEqual(errors, []);
    assert.equal((await page.request.get(`${base}/robots.txt`)).status(), 200);
    assert.equal((await page.request.get(`${base}/sitemap.xml`)).status(), 200);
    console.log('Landing checks passed: six sizes, six item types, sharing FAQ, SEO files.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
