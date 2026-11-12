import type { Metadata } from 'next';
import ImpatriatiCheck from '../../../ImpatriatiCheck';
import { SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';
import { IMPATRIATI_SOURCES, IMPATRIATI_TOOL, TOOL_UPDATED } from '@/lib/tools';

export const metadata: Metadata = {
  title: 'Do you qualify for Italy’s impatriate tax regime? Free 2-minute check',
  description: 'Answer 10 questions to see if moving to Italy lets you pay tax on only 50% (or 40%) of your work income. Free, no sign-up.',
  alternates: { canonical: IMPATRIATI_TOOL.en, languages: { en: IMPATRIATI_TOOL.en, it: IMPATRIATI_TOOL.it, 'x-default': IMPATRIATI_TOOL.en } },
};

export default function Page() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Italy impatriate regime check', url: `${SITE_URL}${IMPATRIATI_TOOL.en}`,
      applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'en', isAccessibleForFree: true, dateModified: TOOL_UPDATED,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' } },
    breadcrumbLd([['Impatriate regime check', IMPATRIATI_TOOL.en]]),
  ];
  return (
    <article className="prose" lang="en">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Impatriate regime check</span></nav>
      <h1>Do you qualify for Italy’s impatriate tax regime?</h1>
      <p className="lead">If you move your tax residence to Italy, the impatriate regime taxes only 50% of your work income, or 40% with a child under 18. Answer 10 questions and find out in 2 minutes whether it applies to you.</p>
      <ImpatriatiCheck lang="en" />
      <h2>How the impatriate regime works</h2>
      <p>The regime is set by article 5 of Legislative Decree 209/2023 and applies to people who become tax resident in Italy from 2024 onwards. There are four main requirements: at least 3 years of tax residence abroad (6 or 7 if you work for the same employer or group), work done in Italy for most of the year, a high qualification, and a commitment to stay at least 4 years. From 2027, newcomers can no longer combine it with the new-resident flat tax: see <a href="/blog/italy-flat-tax-impatriate-regime-no-combining-2027/">Italy flat tax and impatriate regime: no combining from 2027</a>.</p>
      <h2>Sources</h2>
      <p>Rules checked on 12 November 2026.</p>
      <ul>{IMPATRIATI_SOURCES.map((s) => <li key={s.url}><a href={s.url}>{s.label.en}</a></li>)}</ul>
      <p><a href={IMPATRIATI_TOOL.it} hrefLang="it" lang="it">Versione italiana</a></p>
      <p><em>General information, not tax advice. Check your case with the Agenzia delle Entrate or a qualified professional.</em></p>
    </article>
  );
}
