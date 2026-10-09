(() => {
  'use strict';
  const id = 'G-BLWC2E75V4';
  const key = 'expiry.analytics-consent.v1';
  const lifetime = 180 * 24 * 60 * 60 * 1000;
  const publicPaths = new Set([
    '/', '/pl/', '/save-coupons-from-screenshots/', '/pl/jak-zapisac-kupon-ze-zrzutu-ekranu/',
    '/coupon-expiry-reminders/', '/pl/przypomnienia-o-waznosci-kuponow/',
    '/organize-coupons-vouchers-cards/', '/pl/kupony-bony-karty-w-jednym-miejscu/',
    '/privacy/', '/terms/'
  ]);
  // Never run on coupon-token/auth routes, unknown pages or local previews.
  if (!publicPaths.has(location.pathname)) return;
  const production = location.protocol === 'https:' && location.hostname === 'getexpiry.me';
  const pl = document.documentElement.lang === 'pl';
  const copy = pl ? {
    title: 'Pomóż nam ulepszyć Expiry',
    text: 'Za Twoją zgodą Google Analytics mierzy odwiedziny, źródła ruchu i kliknięcia App Store, używając plików cookie. Bez zgody nie uruchamiamy analityki. Wybór możesz zmienić w dowolnym momencie.',
    accept: 'Zgadzam się', reject: 'Bez analityki', privacy: 'Prywatność (EN)', settings: 'Ustawienia analityki'
  } : {
    title: 'Help us improve Expiry',
    text: 'With your permission, Google Analytics uses cookies to measure visits, traffic sources and App Store clicks. Analytics stays off without your consent. You can change your choice at any time.',
    accept: 'Allow analytics', reject: 'No analytics', privacy: 'Privacy', settings: 'Analytics settings'
  };
  let choice = null;
  let started = false;
  let restoreFocus = null;

  function readChoice() {
    try {
      const saved = JSON.parse(localStorage.getItem(key));
      return saved && ['granted', 'denied'].includes(saved.value)
        && Number.isFinite(saved.at) && saved.at <= Date.now()
        && Date.now() - saved.at < lifetime ? saved.value : null;
    } catch { return choice; }
  }
  function clearCookies() {
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.trim().split('=')[0];
      if (name === '_ga' || name.startsWith('_ga_')) {
        for (const domain of ['', ';domain=getexpiry.me', ';domain=.getexpiry.me']) {
          document.cookie = `${name}=;Max-Age=0;path=/${domain};SameSite=Lax`;
        }
      }
    }
  }
  function cleanLocation() {
    const url = new URL(location.origin + location.pathname);
    const source = new URLSearchParams(location.search);
    // Explicit campaign labels only; never forward arbitrary query strings or fragments.
    for (const name of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      const value = source.get(name);
      if (value && /^[a-z0-9_-]{1,80}$/i.test(value)) url.searchParams.set(name, value);
    }
    return url.href;
  }
  function cleanReferrer() {
    try {
      const url = new URL(document.referrer);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      return url.origin + (url.origin === location.origin && publicPaths.has(url.pathname) ? url.pathname : '/');
    } catch { return ''; }
  }
  function start() {
    window[`ga-disable-${id}`] = !production || choice !== 'granted';
    if (!production || choice !== 'granted' || started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', id, {
      send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, cookie_domain: 'none',
      cookie_expires: 90 * 24 * 60 * 60, cookie_update: false,
      page_location: cleanLocation(), page_referrer: cleanReferrer(),
      page_title: `Expiry website: ${location.pathname}`
    });
    window.gtag('event', 'page_view', {send_to: id});
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.append(script);
  }

  const panel = document.createElement('section');
  panel.className = 'analytics-consent';
  panel.hidden = true;
  panel.setAttribute('aria-labelledby', 'analytics-consent-title');
  panel.innerHTML = `<div class="analytics-consent-copy"><h2 id="analytics-consent-title">${copy.title}</h2><p>${copy.text} <a href="/privacy/#website-analytics">${copy.privacy}</a></p></div><div class="analytics-consent-actions"><button type="button" data-consent="denied">${copy.reject}</button><button type="button" data-consent="granted">${copy.accept}</button></div>`;
  document.body.append(panel);
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = copy.settings;
  (document.querySelector('footer') || document.body).append(settings);
  function show(focus) {
    panel.hidden = false;
    if (focus) {
      restoreFocus = document.activeElement;
      panel.querySelector('button').focus();
    }
  }
  function hide() {
    panel.hidden = true;
    if (restoreFocus) { restoreFocus.focus(); restoreFocus = null; }
  }
  function refresh() {
    choice = readChoice();
    if (choice === 'granted') start();
    else {
      window[`ga-disable-${id}`] = true;
      clearCookies();
      // Drop any not-yet-dispatched events when consent is withdrawn.
      if (started && window.dataLayer) window.dataLayer.length = 0;
    }
    if (choice) hide(); else show(false);
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('[data-consent]');
    if (!button) return;
    choice = button.dataset.consent;
    try { localStorage.setItem(key, JSON.stringify({value: choice, at: Date.now()})); } catch { /* This visit only. */ }
    if (choice === 'granted') start();
    else { window[`ga-disable-${id}`] = true; clearCookies(); if (started) window.dataLayer.length = 0; }
    hide();
  });
  settings.addEventListener('click', () => show(true));
  panel.addEventListener('keydown', event => {
    if (event.key === 'Escape' && choice) hide();
  });
  document.addEventListener('click', event => {
    if (event.defaultPrevented || !production || choice !== 'granted' || window[`ga-disable-${id}`]) return;
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    let url;
    try { url = new URL(anchor.href); } catch { return; }
    if (url.protocol !== 'https:' || url.hostname !== 'apps.apple.com' || !/\/id6780260457(?:\/|$)/.test(url.pathname)) return;
    window.gtag('event', 'app_store_click', {
      send_to: id, store: 'app_store', site_language: pl ? 'pl' : 'en',
      cta_location: anchor.closest('header') ? 'header' : anchor.closest('.hero') ? 'hero'
        : anchor.closest('.final-cta') ? 'footer_cta' : 'content', transport_type: 'beacon'
    });
    // Do not delay or prevent the normal link navigation.
  });
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) refresh(); });
  window.addEventListener('pageshow', refresh);
  refresh();
})();
