'use client';
import { useEffect, useState } from 'react';
import { applyConsent, OPEN_PREFS_EVENT, PRIVACY_URL, readConsent, writeConsent } from '@/lib/consent';

const T = {
  it: {
    title: 'Cookie su questo sito',
    body: 'Usiamo solo cookie tecnici necessari. Con il tuo consenso usiamo anche Google Analytics 4 per statistiche aggregate sulle visite. Puoi cambiare idea in qualsiasi momento da "Preferenze cookie" nel footer.',
    accept: 'Accetta statistiche', reject: 'Solo necessari', more: 'Cookie policy', privacy: 'Privacy',
  },
  en: {
    title: 'Cookies on this site',
    body: 'We only use necessary technical cookies. With your consent we also use Google Analytics 4 for aggregated visit statistics. You can change your mind at any time via "Cookie preferences" in the footer.',
    accept: 'Accept analytics', reject: 'Necessary only', more: 'Cookie policy', privacy: 'Privacy',
  },
  fr: {
    title: 'Cookies sur ce site',
    body: 'Nous utilisons uniquement les cookies techniques nécessaires. Avec votre accord, nous utilisons aussi Google Analytics 4 pour des statistiques de visite agrégées. Vous pouvez changer d’avis à tout moment depuis « Préférences cookies » en bas de page.',
    accept: 'Accepter les statistiques', reject: 'Nécessaires uniquement', more: 'Politique cookies', privacy: 'Confidentialité',
  },
};
type ConsentLang = keyof typeof T;
const isLang = (v: unknown): v is ConsentLang => v === 'it' || v === 'en' || v === 'fr';

// The banner follows the page language (article or <html lang>, set per post at build time). On pages
// written in several languages (blog home, topics) it follows the browser.
export function pickLang(): ConsentLang {
  if (typeof document === 'undefined') return 'it';
  const forced = document.querySelector('[data-consent-lang]')?.getAttribute('data-consent-lang');
  if (isLang(forced)) return forced;
  const article = document.querySelector('article.post[lang]')?.getAttribute('lang');
  if (isLang(article)) return article;
  const html = document.documentElement.getAttribute('lang');
  if (html === 'it' || html === 'fr') return html;
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('it') ? 'it' : nav.startsWith('fr') ? 'fr' : 'en';
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<ConsentLang>('it');
  useEffect(() => {
    setLang(pickLang());
    const c = readConsent();
    applyConsent(c);
    if (!c) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_PREFS_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, onOpen);
  }, []);
  if (!open) return null;
  const t = T[lang];
  const choose = (a: boolean) => { applyConsent(writeConsent(a)); setOpen(false); };
  return (
    <div className="cookie-banner" role="dialog" aria-labelledby="cookie-title" lang={lang}>
      <p id="cookie-title"><strong>{t.title}</strong></p>
      <p>{t.body} <a href="/blog/cookie/">{t.more}</a> · <a href={PRIVACY_URL}>{t.privacy}</a></p>
      <div className="cookie-actions">
        <button type="button" onClick={() => choose(false)}>{t.reject}</button>
        <button type="button" className="primary" onClick={() => choose(true)}>{t.accept}</button>
      </div>
    </div>
  );
}

export function CookiePrefsLink({ label }: { label: string }) {
  return <button type="button" className="linklike" onClick={() => window.dispatchEvent(new Event(OPEN_PREFS_EVENT))}>{label}</button>;
}
