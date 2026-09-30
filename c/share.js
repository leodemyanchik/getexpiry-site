import { toSVG } from './vendor/bwip-js.mjs';
const words = {
 en: {eyebrow:'A little saving, shared.',title:'A coupon for you.',loading:'Loading coupon…',error:'This link is unavailable, disabled or has expired.',network:'Could not load the coupon. Check your connection and try again.',retry:'Try again',checkout:'Show at checkout',warning:'Single-use coupons can only be redeemed once. Check the store’s terms; some coupons require the original.',keep:'Keep it. Don’t forget it.',benefit:'Save your coupons in Expiry and get an expiry reminder.',open:'Open in Expiry',download:'Get Expiry for iPhone ↗',after:'Just installed? Return to this message and open the link again.',privacy:'Anyone with this link can view this copy. The sender can disable the link. Saved copies cannot be recalled.',close:'Close',until:'Valid until',minimum:'Minimum spend',expired:'Expired'},
 pl: {eyebrow:'Mała oszczędność. Podaj dalej.',title:'Kupon dla Ciebie.',loading:'Wczytywanie kuponu…',error:'Ten link jest niedostępny, wyłączony lub wygasł.',network:'Nie udało się wczytać kuponu. Sprawdź połączenie i spróbuj ponownie.',retry:'Spróbuj ponownie',checkout:'Pokaż przy kasie',warning:'Kupon jednorazowy można wykorzystać tylko raz. Sprawdź warunki sklepu; czasem wymagany jest oryginał.',keep:'Zachowaj. Nie zapomnij.',benefit:'Zapisuj kupony w Expiry i otrzymuj przypomnienia o terminie ważności.',open:'Otwórz w Expiry',download:'Pobierz Expiry na iPhone’a ↗',after:'Po instalacji wróć do wiadomości i ponownie otwórz link.',privacy:'Każdy, kto ma link, może zobaczyć tę kopię. Nadawca może wyłączyć link. Zapisanych kopii nie można cofnąć.',close:'Zamknij',until:'Ważny do',minimum:'Minimalny zakup',expired:'Wygasły'},
 ru: {eyebrow:'Небольшая скидка — для тебя.',title:'Тебе прислали купон.',loading:'Загружаем купон…',error:'Ссылка недоступна, отключена или срок её действия истёк.',network:'Не удалось загрузить купон. Проверь интернет и попробуй снова.',retry:'Повторить',checkout:'Показать на кассе',warning:'Одноразовый купон можно использовать только один раз. Проверь условия магазина: иногда нужен оригинал.',keep:'Сохрани. Не забудь.',benefit:'Храни купоны в Expiry и получай напоминания до окончания срока.',open:'Открыть в Expiry',download:'Скачать Expiry для iPhone ↗',after:'После установки вернись к сообщению и открой ссылку ещё раз.',privacy:'Любой, у кого есть ссылка, может увидеть эту копию. Отправитель может отключить ссылку. Сохранённые копии отозвать нельзя.',close:'Закрыть',until:'Действует до',minimum:'Минимальная покупка',expired:'Срок истёк'},
};
const $ = id => document.getElementById(id);
let language = navigator.language.slice(0,2) in words ? navigator.language.slice(0,2) : 'en';
let coupon, state = 'loading';
const token = new URL(location.href).searchParams.get('t');
const valid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(token ?? '');
const currencyLabel = value => ({
  PLN:'zł', EUR:'€', USD:'$', GBP:'£', RUB:'₽', UAH:'₴', CZK:'Kč',
  JPY:'¥', CNY:'CN¥', KRW:'₩',
})[String(value).trim().toUpperCase()] ?? String(value).trim().toUpperCase();
function render() {
  const w = words[language]; document.documentElement.lang = language;
  document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = w[el.dataset.copy]; });
  $('language').value = language;
  $('status').textContent = state === 'ready' ? '' : w[state];
  $('retry').hidden = state !== 'network';
  $('coupon').hidden = state !== 'ready';
  $('open-app').hidden = state !== 'ready';
  if (!coupon) return;
  $('store').textContent = coupon.store_name;
  const currency = currencyLabel(coupon.currency);
  const hasValue = coupon.has_value !== false;
  $('discount').hidden = !hasValue;
  $('discount').textContent = hasValue ? `${coupon.discount_value}${coupon.discount_type === 'percent' ? '%' : ' '+currency}` : '';
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const hasExpiry = coupon.has_expiry !== false;
  const expired = hasExpiry && coupon.expiry_date < today;
  const used = !!coupon.used_at;
  if (used) $('status').textContent = {en:'Marked as used by a recipient or owner.',pl:'Oznaczony jako wykorzystany przez odbiorcę lub właściciela.',ru:'Получатель или владелец отметил купон использованным.'}[language];
  const fromLabel = {en:'Valid from',pl:'Ważny od',ru:'Действует с'}[language];
  $('expiry').hidden = !hasExpiry && !coupon.valid_from;
  $('expiry').textContent = [
    coupon.valid_from ? `${fromLabel} ${coupon.valid_from}` : '',
    hasExpiry ? `${w.until} ${coupon.expiry_date}${expired ? ' · '+w.expired : ''}` : '',
  ].filter(Boolean).join(' · ');
  $('minimum').textContent = coupon.min_spend == null ? '' : `${w.minimum}: ${coupon.min_spend} ${currency}`;
  $('raw-code').textContent = coupon.code_value ?? '';
  $('promo').textContent = coupon.promo_code ?? '';
  $('code').replaceChildren();
  if (coupon.code_value && ['barcode','qr'].includes(coupon.code_type)) {
    try {
      // Locally bundled encoder; the coupon code is never sent to a QR service.
      const svg = toSVG({bcid:coupon.code_type === 'qr' ? 'qrcode' : 'code128',text:coupon.code_value,scale:3,height:16,padding:12});
      const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
      $('code').append(document.importNode(doc.documentElement, true));
    } catch { /* Keep the exact readable code if this symbology cannot encode it. */ }
  }
  $('checkout').hidden = expired || used || !coupon.code_value;
  $('open-app').href = `expiry://coupon?t=${token}`;
}
async function load() {
  coupon = null; state = valid ? 'loading' : 'error'; render();
  if (!valid) return;
  try {
    const result = await fetch(`https://dnjkbdolxsqmwndoczvd.supabase.co/functions/v1/shared-coupon?t=${token}`, {cache:'no-store',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(10000)});
    if (result.status === 404) {state='error'; render(); return;}
    if (!result.ok) throw new Error('unavailable');
    coupon = await result.json(); state='ready'; render();
  } catch {state='network'; render();}
}
$('language').addEventListener('change', e => {language=e.target.value; render();});
$('retry').addEventListener('click', load);
$('checkout').addEventListener('click', () => {
  $('large-code').replaceChildren(...Array.from($('code').childNodes).map(node => node.cloneNode(true)));
  const text = document.createElement('p'); text.textContent = coupon.code_value;
  $('large-code').append(text); $('fullscreen').showModal();
});
$('close').addEventListener('click', () => $('fullscreen').close());
load();
