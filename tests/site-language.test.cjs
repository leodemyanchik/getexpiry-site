const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/site-language.js'), 'utf8');
const key = 'expiry.site-language.v1';

function setup({languages = ['pl-PL', 'en-US'], language = 'en-US', lang = 'en', saved = null, blocked = false, promptPresent = true} = {}) {
  const values = new Map(saved === null ? [] : [[key, saved]]);
  const handlers = {};
  const writes = [];
  const currentLink = {focused: false, focus() { this.focused = true; }};
  const prompt = {hidden: true, contains: element => Boolean(element?.inPrompt)};
  const document = {
    documentElement: {lang}, activeElement: null,
    querySelector(selector) {
      return selector === '[data-language-prompt]' ? (promptPresent ? prompt : null) : currentLink;
    },
    addEventListener: (name, handler) => { handlers[`document:${name}`] = handler; },
  };
  const window = {
    addEventListener: (name, handler) => { handlers[`window:${name}`] = handler; },
    get localStorage() {
      if (blocked) throw new Error('Storage unavailable');
      return {
        getItem: item => values.get(item) ?? null,
        setItem: (item, value) => { writes.push([item, value]); values.set(item, value); },
      };
    },
  };
  vm.runInNewContext(source, {window, document, navigator: {languages, language}});
  return {
    prompt, values, writes, currentLink, handlers,
    click(value, {inside = false, cancelled = false} = {}) {
      document.activeElement = inside ? {inPrompt: true} : currentLink;
      handlers['document:click']({defaultPrevented: cancelled, target: {closest: () => value === null ? null : {dataset: {siteLanguage: value}}}});
    },
  };
}

let checks = 0;
function check(name, run) { run(); checks++; console.log(`PASS ${name}`); }
check('Polish preferred language reveals the suggestion without writing a preference', () => {
  const page = setup(); assert.equal(page.prompt.hidden, false); assert.deepEqual(page.writes, []);
});
check('Regional and uppercase Polish tags work', () => {
  for (const languages of [['pl'], ['PL-pl'], ['pl-US']]) assert.equal(setup({languages}).prompt.hidden, false);
});
check('An English-first browser is not treated as Polish because of its backup language', () => {
  assert.equal(setup({languages: ['en-GB', 'pl-PL']}).prompt.hidden, true);
});
check('The first supported language wins; unrelated languages do not imply Poland', () => {
  assert.equal(setup({languages: ['de-DE', 'pl-PL', 'en']}).prompt.hidden, false);
  for (const languages of [['en'], ['ru-RU'], [], ['x-pl']]) assert.equal(setup({languages}).prompt.hidden, true);
});
check('navigator.language fallback and malformed values are safe', () => {
  assert.equal(setup({languages: null, language: 'pl-PL'}).prompt.hidden, false);
  assert.equal(setup({languages: [null, 'pl-PL']}).prompt.hidden, false);
});
check('Saved manual choices suppress further prompts; unknown values do not', () => {
  for (const saved of ['en', 'pl']) assert.equal(setup({saved}).prompt.hidden, true);
  assert.equal(setup({saved: 'fr'}).prompt.hidden, false);
});
check('Stay in English saves the choice, hides the prompt and restores focus', () => {
  const page = setup(); page.click('en', {inside: true});
  assert.equal(page.values.get(key), 'en'); assert.equal(page.prompt.hidden, true); assert.equal(page.currentLink.focused, true);
  page.handlers['window:pageshow'](); assert.equal(page.prompt.hidden, true);
});
check('Polish CTA and header choices save PL; later EN overrides it', () => {
  const page = setup(); page.click('pl'); assert.equal(page.values.get(key), 'pl');
  page.click('en'); assert.equal(page.values.get(key), 'en');
});
check('Blocked storage never breaks display, choice or the current visit', () => {
  const page = setup({blocked: true}); assert.equal(page.prompt.hidden, false);
  page.click('en', {inside: true}); assert.equal(page.prompt.hidden, true);
  page.handlers['window:pageshow'](); assert.equal(page.prompt.hidden, true);
});
check('Polish page records only manual selection and needs no suggestion element', () => {
  const page = setup({lang: 'pl', promptPresent: false}); assert.deepEqual(page.writes, []);
  page.click('en'); assert.equal(page.values.get(key), 'en');
});
check('Unrelated, invalid and cancelled clicks do not write choices', () => {
  const page = setup(); page.click(null); page.click('ru'); page.click('pl', {cancelled: true});
  assert.deepEqual(page.writes, []); assert.equal(page.prompt.hidden, false);
});
check('History restoration and changes in another tab refresh the prompt', () => {
  const page = setup(); page.values.set(key, 'en'); page.handlers['window:pageshow']();
  assert.equal(page.prompt.hidden, true); page.values.delete(key); page.handlers['window:storage']({key});
  assert.equal(page.prompt.hidden, false);
  page.values.set(key, 'pl'); page.handlers['window:storage']({key: null}); assert.equal(page.prompt.hidden, true);
});
check('No redirects, geo/analytics requests, or cookie writes are introduced', () => {
  const code = source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/\blocation\b|\bfetch\s*\(|XMLHttpRequest|document\.cookie|geolocation/.test(code));
});
check('Prompt is progressive enhancement; real links and excluded routes are preserved', () => {
  const home = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.ok(home.includes('data-language-prompt hidden lang="pl"'));
  assert.ok(home.includes('href="/pl/" hreflang="pl" data-site-language="pl"'));
  assert.ok(home.indexOf('src="/assets/site-language.js"') < home.indexOf('<main'));
  const polish = fs.readFileSync(path.join(__dirname, '../pl/index.html'), 'utf8');
  assert.ok(polish.includes('data-site-language="en"') && polish.includes('data-site-language="pl"'));
  const guide = fs.readFileSync(path.join(__dirname, '../save-coupons-from-screenshots/index.html'), 'utf8');
  assert.ok(guide.includes('data-site-language="pl"') && guide.includes('site-language.js'));
  assert.ok(!guide.includes('data-language-prompt'), 'guides use explicit same-topic language links, not forced prompts');
  assert.ok(guide.includes('href="/pl/jak-zapisac-kupon-ze-zrzutu-ekranu/" lang="pl" hreflang="pl" data-site-language="pl"'));
  for (const route of ['c', 'privacy', 'terms', 'auth/confirmed']) {
    assert.ok(!fs.readFileSync(path.join(__dirname, '..', route, 'index.html'), 'utf8').includes('site-language.js'), route);
  }
});
console.log(`${checks} language suggestion checks passed.`);
