import type { Lang } from './posts';

export const UI: Record<Lang, Record<string, string>> = {
  en: {
    by: 'By', updated: 'Updated', topics: 'Topics', related: 'Related articles', alsoIn: 'Also available in',
    ctaTitle: 'Review cross-border risks before moving',
    ctaBody: 'Relomatrix turns fragmented relocation and compliance information into source-referenced reviews.',
    ctaLink: 'Start the Snapshot', ctaCorridorLink: 'See the {corridor} Risk Report', language: 'English',
    reviewedBy: 'Reviewed by', corridorCluster: 'More on {corridor}', authorPage: 'Author',
    corridorTitle: 'Guides: {corridor}', corridorCta: 'Check your case: {corridor} Risk Report', articlesBy: 'Articles',
    navTopics: 'Topics', navAbout: 'About us', cookiePrefs: 'Cookie preferences', siteHome: 'https://www.relomatrix.com/',
  },
  it: {
    by: 'Di', updated: 'Aggiornato', topics: 'Argomenti', related: 'Articoli correlati', alsoIn: 'Disponibile anche in',
    ctaTitle: 'Verifica i rischi prima del trasferimento',
    ctaBody: 'Relomatrix trasforma informazioni frammentate su relocation e compliance in analisi con fonti verificabili.',
    ctaLink: 'Inizia lo Snapshot', ctaCorridorLink: 'Vedi il Risk Report {corridor}', language: 'Italiano',
    reviewedBy: 'Revisionato da', corridorCluster: 'Altre guide {corridor}', authorPage: 'Autore',
    corridorTitle: 'Guide: {corridor}', corridorCta: 'Verifica il tuo caso: Risk Report {corridor}', articlesBy: 'Articoli',
    navTopics: 'Argomenti', navAbout: 'Chi siamo', cookiePrefs: 'Preferenze cookie', siteHome: 'https://www.relomatrix.com/it',
  },
  fr: {
    by: 'Par', updated: 'Mis à jour', topics: 'Sujets', related: 'Articles connexes', alsoIn: 'Également disponible en',
    ctaTitle: 'Vérifiez les risques avant de déménager',
    ctaBody: 'Relomatrix transforme des informations éparses sur la mobilité internationale et la conformité en analyses sourcées.',
    ctaLink: 'Commencer le Snapshot', ctaCorridorLink: 'Voir le Risk Report {corridor}', language: 'Français',
    reviewedBy: 'Relu par', corridorCluster: 'Autres guides {corridor}', authorPage: 'Auteur',
    corridorTitle: 'Guides : {corridor}', corridorCta: 'Vérifiez votre cas : Risk Report {corridor}', articlesBy: 'Articles',
    navTopics: 'Sujets', navAbout: 'Qui sommes-nous', cookiePrefs: 'Préférences cookies', siteHome: 'https://www.relomatrix.com/fr',
  },
};

export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', it: 'it_IT', fr: 'fr_FR' };

export const LANGS: Lang[] = ['en', 'it', 'fr'];

/** "8 novembre 2026" / "November 8, 2026" / "8 novembre 2026" from an ISO date (YYYY-MM-DD). */
export function formatDate(iso: string, lang: Lang) {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const locale = lang === 'it' ? 'it-IT' : lang === 'fr' ? 'fr-FR' : 'en-GB';
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}
