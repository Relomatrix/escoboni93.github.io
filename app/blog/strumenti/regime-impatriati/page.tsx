import type { Metadata } from 'next';
import ImpatriatiCheck from '../../../ImpatriatiCheck';
import { SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';
import { IMPATRIATI_SOURCES, IMPATRIATI_TOOL, TOOL_UPDATED } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Hai diritto al regime impatriati? Test gratuito in 2 minuti',
  description: 'Rispondi a 10 domande e scopri se puoi pagare le tasse solo sul 50% (o 40%) del reddito rientrando in Italia. Gratis, senza registrazione.',
  alternates: { canonical: IMPATRIATI_TOOL.it, languages: { it: IMPATRIATI_TOOL.it, en: IMPATRIATI_TOOL.en, 'x-default': IMPATRIATI_TOOL.en } },
};

export default function Page() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Test regime impatriati', url: `${SITE_URL}${IMPATRIATI_TOOL.it}`,
      applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'it', isAccessibleForFree: true, dateModified: TOOL_UPDATED,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } },
    breadcrumbLd([['Test regime impatriati', IMPATRIATI_TOOL.it]]),
  ];
  return (
    <article className="prose" lang="it">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Test regime impatriati</span></nav>
      <h1>Hai diritto al regime impatriati?</h1>
      <p className="lead">Se trasferisci la residenza in Italia, il regime impatriati ti fa pagare le tasse solo sul 50% del reddito da lavoro, o sul 40% con un figlio minorenne. Rispondi a 10 domande e in 2 minuti sai se fa per te.</p>
      <ImpatriatiCheck lang="it" />
      <h2>Come funziona il regime impatriati</h2>
      <p>Il regime è previsto dall’articolo 5 del decreto legislativo n. 209/2023 e vale per chi diventa residente in Italia per le tasse dal 2024 in poi. I requisiti principali sono quattro: almeno 3 anni di residenza fiscale all’estero (6 o 7 se si lavora per lo stesso datore o gruppo), lavoro svolto in Italia per la maggior parte dell’anno, elevata qualificazione e impegno a restare almeno 4 anni. Tutti i dettagli sono nella nostra guida al <a href="/blog/regime-impatriati-2026-requisiti-tassazione-50/">regime impatriati 2026</a>.</p>
      <h2>Fonti</h2>
      <p>Regole controllate il 12 novembre 2026.</p>
      <ul>{IMPATRIATI_SOURCES.map((s) => <li key={s.url}><a href={s.url}>{s.label.it}</a></li>)}</ul>
      <p><a href={IMPATRIATI_TOOL.en} hrefLang="en" lang="en">English version</a></p>
      <p><em>Informazioni di carattere generale, non consulenza fiscale. Verifica il tuo caso con l’Agenzia delle Entrate o con un professionista.</em></p>
    </article>
  );
}
