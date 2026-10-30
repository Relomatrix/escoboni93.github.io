import type { Metadata } from 'next';
import { ABOUT_PATH, ORG_ID, SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';
import { AUTHORS } from '@/lib/authors';

export const metadata: Metadata = {
  title: 'Chi siamo / About us',
  description: 'Chi scrive il blog di Relomatrix, come scegliamo le fonti e come correggiamo gli errori. Who writes the Relomatrix Blog and how we source it.',
  alternates: { canonical: ABOUT_PATH },
};

export default function About() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'AboutPage', url: `${SITE_URL}${ABOUT_PATH}`, name: 'Chi siamo', about: { '@id': ORG_ID },
      inLanguage: ['it', 'en'] },
    breadcrumbLd([['Chi siamo', ABOUT_PATH]]),
  ];
  return (
    <article className="prose about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <span>Chi siamo</span></nav>
      <section lang="it">
        <h1>Chi siamo</h1>
        <p>Il blog è curato dalla <strong>redazione di Relomatrix</strong>. Relomatrix è una piattaforma per la relocation internazionale e il lavoro professionale tra Paesi diversi: aiuta privati, studi professionali e aziende a mettere in ordine documenti, fatti e fonti normative di un trasferimento, lasciando la decisione al professionista.</p>
        <h2>Come scriviamo</h2>
        <ul>
          <li>Ogni articolo affronta una sola domanda e risponde subito, nelle prime righe.</li>
          <li>Ogni affermazione su norme, tasse, previdenza o immigrazione rimanda a una <strong>fonte ufficiale</strong> (Gazzetta Ufficiale, Normattiva, Agenzia delle Entrate, INPS, Ministero degli Esteri, Commissione europea, IRS, OCSE e simili). Gli articoli senza una sezione Fonti con almeno una fonte ufficiale non vengono pubblicati: il controllo è automatico.</li>
          <li>Non pubblichiamo statistiche, casi o testimonianze che non si possano verificare.</li>
          <li>Gli articoli sono preparati con l&apos;aiuto di strumenti di intelligenza artificiale e pubblicati dopo i controlli automatici sulle fonti. Dalle immagini non rimuoviamo mai i metadati che indicano l&apos;uso dell&apos;AI.</li>
          <li>Le regole cambiano: ogni articolo riporta la data di pubblicazione e quella dell&apos;ultimo aggiornamento.</li>
        </ul>
        <h2>Cosa non è</h2>
        <p>I contenuti sono informazioni generali e non sono un parere legale, fiscale o previdenziale. Per il tuo caso verifica con l&apos;autorità competente o con un professionista.</p>
        <h2>Errori e correzioni</h2>
        <p>Se trovi un errore o una fonte superata, scrivici tramite <a href="https://relomatrix.com">relomatrix.com</a>: correggiamo l&apos;articolo e aggiorniamo la data di modifica.</p>
      </section>
      <section lang="en">
        <h2>About us</h2>
        <p>The blog is run by the <strong>Relomatrix editorial team</strong>. Relomatrix is a platform for international relocation and cross-border professional work: it helps individuals, firms and companies organise the documents, facts and legal sources of a move, while the professional keeps the final decision.</p>
        <ul>
          <li>Every claim about law, tax, social security or immigration links to an <strong>official source</strong>. Articles without a Sources section citing at least one official source are not published; the check runs automatically at build time.</li>
          <li>No unverifiable statistics, case studies or testimonials.</li>
          <li>Articles are drafted with the help of AI tools and published after the automated source checks. We never strip AI-provenance metadata from images.</li>
          <li>General information only, not legal or tax advice. Found an error? Tell us via <a href="https://relomatrix.com">relomatrix.com</a>.</li>
        </ul>
        <p>Bylines: {Object.values(AUTHORS).map((a) => a.name).join(', ')}.</p>
      </section>
    </article>
  );
}
