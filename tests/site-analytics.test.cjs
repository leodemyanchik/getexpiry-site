const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/site-analytics.js'), 'utf8');
const key = 'expiry.analytics-consent.v1';
const id = 'G-BLWC2E75V4';
let count = 0;
function test(name, fn) { fn(); count++; console.log(`PASS ${name}`); }
function setup({route = '/', stored, blocked = false, host = 'getexpiry.me', lang = 'en', referrer = '', search = ''} = {}) {
  const values = new Map(stored === undefined ? [] : [[key, stored]]);
  const handlers = {}, elements = [], scripts = [], cookies = [];
  const focus = {focus() { this.focused = true; }};
  const doc = {
    documentElement: {lang}, activeElement: focus, referrer,
    body: {append(el) { elements.push(el); }}, head: {append(el) { scripts.push(el); }},
    get cookie() { return '_ga=123; _ga_BLWC2E75V4=456; necessary=keep'; },
    set cookie(value) { cookies.push(value); },
    createElement(tag) {
      return {tag, dataset: {}, handlers: {}, setAttribute() {},
        addEventListener(name, fn) { this.handlers[name] = fn; },
        querySelector() { return focus; }, focus() { this.focused = true; }};
    },
    querySelector() { return {append(el) { elements.push(el); }}; },
    addEventListener(name, fn) { handlers[`doc:${name}`] = fn; }
  };
  const win = {addEventListener(name, fn) { handlers[`win:${name}`] = fn; }};
  vm.runInNewContext(source, {window: win, document: doc, location: {
    pathname: route, hostname: host, protocol: host === 'getexpiry.me' ? 'https:' : 'http:',
    origin: host === 'getexpiry.me' ? 'https://getexpiry.me' : `http://${host}`, search
  }, URL, URLSearchParams, Date, localStorage: {
    getItem(k) { if (blocked) throw Error('blocked'); return values.get(k) || null; },
    setItem(k, v) { if (blocked) throw Error('blocked'); values.set(k, v); }
  }});
  function choose(value) { elements[0].handlers.click({target: {closest() { return {dataset: {consent: value}}; }}}); }
  function click(href, area = '.hero') {
    handlers['doc:click']({defaultPrevented: false, target: {closest() {
      return {href, closest(selector) { return selector === area ? {} : null; }};
    }}});
  }
  return {win, elements, scripts, cookies, values, handlers, choose, click, focus};
}
const saved = (value, at = Date.now()) => JSON.stringify({value, at});
const events = p => (p.win.dataLayer || []).map(args => Array.from(args));
test('no consent: banner, no Google script/events', () => {
  const p = setup(); assert.equal(p.elements[0].hidden, false); assert.equal(p.scripts.length, 0);
  assert.equal(events(p).length, 0); p.click('https://apps.apple.com/app/id6780260457'); assert.equal(events(p).length, 0);
});
test('accept: one loader/page view, denied ads, safe URL/referrer', () => {
  const p = setup({search: '?utm_source=instagram&utm_medium=social&utm_campaign=bio&email=private@example.com&token=secret', referrer: 'https://example.com/private?token=secret'});
  p.choose('granted'); assert.equal(p.scripts.length, 1); assert.equal(p.elements[0].hidden, true);
  assert.equal(events(p)[0][2].ad_storage, 'denied');
  const config = events(p).find(e => e[0] === 'config')[2];
  assert.equal(config.page_location, 'https://getexpiry.me/?utm_source=instagram&utm_medium=social&utm_campaign=bio');
  assert.equal(config.page_referrer, 'https://example.com/'); assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  p.handlers['win:pageshow'](); assert.equal(p.scripts.length, 1);
  assert.equal(events(p).filter(e => e[1] === 'page_view').length, 1);
});
test('App Store CTA event only, no coupon URLs or link text', () => {
  const p = setup({stored: saved('granted')});
  p.click('https://apps.apple.com/app/id6780260457?l=pl');
  const event = events(p).find(e => e[1] === 'app_store_click'); assert.ok(event);
  assert.equal(event[2].cta_location, 'hero'); assert.equal(event[2].store, 'app_store');
  const n = events(p).length; p.click('https://getexpiry.me/c/?token=secret');
  p.click('https://apps.apple.com/app/id123'); assert.equal(events(p).length, n);
});
test('reject persists with no requests; settings restore focus', () => {
  const p = setup(); p.choose('denied'); assert.equal(p.scripts.length, 0);
  assert.equal(JSON.parse(p.values.get(key)).value, 'denied');
  p.elements[1].handlers.click(); assert.equal(p.elements[0].hidden, false);
  p.choose('denied'); assert.equal(p.focus.focused, true);
});
test('withdrawal stops events, drops pending queue, only clears GA cookies', () => {
  const p = setup({stored: saved('granted')}); p.choose('denied');
  assert.equal(p.win[`ga-disable-${id}`], true); assert.equal(events(p).length, 0);
  p.click('https://apps.apple.com/app/id6780260457'); assert.equal(events(p).length, 0);
  assert.ok(p.cookies.every(c => /^_ga(?:=|_)/.test(c))); assert.ok(p.cookies.some(c => c.includes('Max-Age=0')));
});
test('cross-tab withdrawal also stops events', () => {
  const p = setup({stored: saved('granted')}); p.values.set(key, saved('denied'));
  p.handlers['win:storage']({key}); assert.equal(p.win[`ga-disable-${id}`], true);
});
test('expired, malformed and future consent require a new choice', () => {
  for (const stored of ['invalid', saved('granted', Date.now() - 181 * 86400000), saved('granted', Date.now() + 86400000)]) {
    const p = setup({stored}); assert.equal(p.scripts.length, 0); assert.equal(p.elements[0].hidden, false);
  }
});
test('storage blocked: functional for this visit only', () => {
  const p = setup({blocked: true}); p.choose('granted'); p.handlers['win:pageshow']();
  assert.equal(p.scripts.length, 1); p.choose('denied'); assert.equal(p.win[`ga-disable-${id}`], true);
});
test('Polish copy and local previews do not send data', () => {
  const p = setup({lang: 'pl', host: 'localhost'}); assert.ok(p.elements[0].innerHTML.includes('Bez analityki'));
  p.choose('granted'); assert.equal(p.scripts.length, 0);
});
test('private/unknown routes excluded even if script accidentally embedded', () => {
  for (const route of ['/c/', '/c/token', '/auth/confirmed/', '/unknown/']) {
    const p = setup({route, stored: saved('granted')}); assert.equal(p.scripts.length, 0); assert.equal(p.elements.length, 0);
  }
});
test('private referrers and campaign values cannot expose tokens or email', () => {
  const p = setup({stored: saved('granted'), referrer: 'https://getexpiry.me/c/?token=secret', search: '?utm_source=someone%40example.com#secret'});
  const config = events(p).find(e => e[0] === 'config')[2];
  assert.equal(config.page_referrer, 'https://getexpiry.me/'); assert.equal(config.page_location, 'https://getexpiry.me/');
});
test('every public page embeds only consent-gated local assets; private pages do not', () => {
  for (const file of [...require('./seo-pages.cjs').map(p => p.file), 'privacy/index.html', 'terms/index.html']) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    assert.equal((html.match(/src="\/assets\/site-analytics.js"/g) || []).length, 1, file);
    assert.ok(!/<script[^>]+src="https:\/\/(?:www\.)?(?:googletagmanager|google-analytics)/.test(html));
  }
  for (const file of ['c/index.html', 'auth/confirmed/index.html']) {
    assert.ok(!fs.readFileSync(path.join(root, file), 'utf8').includes('site-analytics'));
  }
});
console.log(`${count} analytics checks passed`);
