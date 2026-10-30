// Cookie consent + Google Analytics 4 (Consent Mode v2). gtag.js loads ONLY after analytics consent.
export const GA4_MEASUREMENT_ID = 'G-BKQ2JPZCKY';
export const CONSENT_KEY = 'rmx_blog_consent_v1';
export const CONSENT_COOKIE = 'rmx_consent';
export const OPEN_PREFS_EVENT = 'rmx:open-cookie-preferences';
export const PRIVACY_URL = 'https://relomatrix.com/legal';

export type Consent = { analytics: boolean; date: string; v: 1 };

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (raw) return JSON.parse(raw) as Consent;
  } catch {}
  const m = typeof document !== 'undefined' ? document.cookie.match(/(?:^|; )rmx_consent=(granted|denied)/) : null;
  return m ? { analytics: m[1] === 'granted', date: '', v: 1 } : null;
}

export function writeConsent(analytics: boolean): Consent {
  const c: Consent = { analytics, date: new Date().toISOString(), v: 1 };
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch {}
  document.cookie = `${CONSENT_COOKIE}=${analytics ? 'granted' : 'denied'}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax; Secure`;
  return c;
}

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; [k: string]: unknown };
let loaded = false;

function stub(w: W) {
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) w.gtag = function () { (w.dataLayer as unknown[]).push(arguments); };
  return w.gtag;
}

export function applyConsent(c: Consent | null) {
  const w = window as unknown as W;
  if (!c?.analytics) {
    if (loaded) {
      stub(w)('consent', 'update', { analytics_storage: 'denied' });
      w[`ga-disable-${GA4_MEASUREMENT_ID}`] = true;
    }
    return;
  }
  const gtag = stub(w);
  if (!loaded) {
    gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  }
  gtag('consent', 'update', { analytics_storage: 'granted' });
  w[`ga-disable-${GA4_MEASUREMENT_ID}`] = false;
  if (!loaded) {
    gtag('js', new Date());
    gtag('config', GA4_MEASUREMENT_ID);
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(s);
    loaded = true;
  }
}
