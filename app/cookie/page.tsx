import type { Metadata } from 'next';
import { CookiePrefsLink } from '../CookieConsent';
import { PRIVACY_URL } from '@/lib/consent';

export const metadata: Metadata = { title: 'Cookie policy', robots: { index: false } };

export default function CookiePage() {
  return (
    <article className="prose" lang="it">
      <h1>Cookie policy</h1>
      <p>Questo blog usa cookie e archiviazione locale tecnici, necessari per ricordare la tua scelta sui cookie (<code>rmx_consent</code>, <code>rmx_blog_consent_v1</code>, durata 180 giorni).</p>
      <p>Solo se accetti le statistiche, carichiamo Google Analytics 4 (Google Ireland Ltd.) per misurare in forma aggregata le visite. Prima del consenso nessuno script di Google viene caricato; usiamo Google Consent Mode v2 con pubblicità e personalizzazione sempre negate. GA4 non registra gli indirizzi IP completi.</p>
      <p>Puoi cambiare o revocare il consenso in qualsiasi momento: <CookiePrefsLink label="Preferenze cookie" />.</p>
      <p>Per titolare del trattamento, finalità, diritti e contatti consulta l&apos;<a href={PRIVACY_URL}>informativa privacy di Relomatrix</a>.</p>
      <h2 lang="en">English</h2>
      <p lang="en">This blog only uses a necessary cookie/local storage entry to remember your choice. Google Analytics 4 loads only after you accept analytics (Consent Mode v2, ads always denied). Change your choice: <CookiePrefsLink label="Cookie preferences" />. Full privacy notice: <a href={PRIVACY_URL}>relomatrix.com</a>.</p>
    </article>
  );
}
