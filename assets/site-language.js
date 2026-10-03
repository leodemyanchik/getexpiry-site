(() => {
  'use strict';

  // A device-only preference: no cookies, requests, geolocation or redirects.
  const key = 'expiry.site-language.v1';
  const prompt = document.querySelector('[data-language-prompt]');
  let choice = null;
  const valid = value => value === 'en' || value === 'pl';

  function readChoice() {
    try {
      const value = window.localStorage.getItem(key);
      return valid(value) ? value : null;
    } catch {
      // Keep this visit usable when browser storage is unavailable.
      return choice;
    }
  }

  function prefersPolish() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages : [navigator.language];
    for (const language of languages) {
      if (typeof language !== 'string') continue;
      const base = language.toLowerCase().split('-')[0];
      // Respect the first supported language, not an English browser's backup PL.
      if (base === 'en' || base === 'pl') return base === 'pl';
    }
    return false;
  }

  function refresh() {
    choice = readChoice();
    if (prompt) {
      prompt.hidden = document.documentElement.lang !== 'en' || Boolean(choice) || !prefersPolish();
    }
  }

  document.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    const control = event.target.closest('[data-site-language]');
    if (!control || !valid(control.dataset.siteLanguage)) return;
    const restoreFocus = prompt && prompt.contains(document.activeElement);
    choice = control.dataset.siteLanguage;
    try { window.localStorage.setItem(key, choice); } catch { /* Navigation still works. */ }
    if (prompt) prompt.hidden = true;
    if (restoreFocus) {
      document.querySelector(`.language-switch a[data-site-language="${document.documentElement.lang}"]`)?.focus();
    }
    // Language links navigate normally, including keyboard and open-in-new-tab.
  });

  window.addEventListener('pageshow', refresh);
  window.addEventListener('languagechange', refresh);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) refresh();
  });
  refresh();
})();
