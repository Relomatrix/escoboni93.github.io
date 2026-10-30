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
};

export function pickLang(): 'it' | 'en' {
  if (typeof document === 'undefined') return 'it';
  const forced = document.querySelector('[data-consent-lang]')?.getAttribute('data-consent-lang');
  if (forced === 'en' || forced === 'it') return forced;
  return (navigator.language || 'it').toLowerCase().startsWith('it') ? 'it' : navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'it';
}

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<'it' | 'en'>('it');
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
      <p>{t.body} <a href="/cookie">{t.more}</a> · <a href={PRIVACY_URL}>{t.privacy}</a></p>
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
