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
    navSearch: 'Search', readMin: '{n} min read', readMore: 'Read the article',
  },
  it: {
    by: 'Di', updated: 'Aggiornato', topics: 'Argomenti', related: 'Articoli correlati', alsoIn: 'Disponibile anche in',
    ctaTitle: 'Verifica i rischi prima del trasferimento',
    ctaBody: 'Relomatrix trasforma informazioni frammentate su relocation e compliance in analisi con fonti verificabili.',
    ctaLink: 'Inizia lo Snapshot', ctaCorridorLink: 'Vedi il Risk Report {corridor}', language: 'Italiano',
    reviewedBy: 'Revisionato da', corridorCluster: 'Altre guide {corridor}', authorPage: 'Autore',
    corridorTitle: 'Guide: {corridor}', corridorCta: 'Verifica il tuo caso: Risk Report {corridor}', articlesBy: 'Articoli',
    navTopics: 'Argomenti', navAbout: 'Chi siamo', cookiePrefs: 'Preferenze cookie', siteHome: 'https://www.relomatrix.com/it',
    navSearch: 'Cerca', readMin: '{n} min di lettura', readMore: 'Leggi l’articolo',
  },
  fr: {
    by: 'Par', updated: 'Mis à jour', topics: 'Sujets', related: 'Articles connexes', alsoIn: 'Également disponible en',
    ctaTitle: 'Vérifiez les risques avant de déménager',
    ctaBody: 'Relomatrix transforme des informations éparses sur la mobilité internationale et la conformité en analyses sourcées.',
    ctaLink: 'Commencer le Snapshot', ctaCorridorLink: 'Voir le Risk Report {corridor}', language: 'Français',
    reviewedBy: 'Relu par', corridorCluster: 'Autres guides {corridor}', authorPage: 'Auteur',
    corridorTitle: 'Guides : {corridor}', corridorCta: 'Vérifiez votre cas : Risk Report {corridor}', articlesBy: 'Articles',
    navTopics: 'Sujets', navAbout: 'Qui sommes-nous', cookiePrefs: 'Préférences cookies', siteHome: 'https://www.relomatrix.com/fr',
    navSearch: 'Rechercher', readMin: '{n} min de lecture', readMore: 'Lire l’article',
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

/** Labels of the blog home and of the search box, by language (the reader picks the language on the home). */
export const HOME: Record<Lang, {
  kicker: string; title: string; lead: string; readIn: string; latest: string; topicsTitle: string; allTopics: string;
  searchLabel: string; searchPlaceholder: string; searchButton: string; searchHint: string; suggestionsTitle: string;
  topicLabel: string; articles: string; oneArticle: string; results: string; oneResult: string; noResults: string; tryWith: string; clear: string; otherLang: string;
}> = {
  it: {
    kicker: 'Il blog di Relomatrix', title: 'Guide chiare per chi vive tra due Paesi',
    lead: 'Tasse, visti, pensione e documenti spiegati con parole semplici. Ogni articolo indica la fonte ufficiale.',
    readIn: 'Leggi in', latest: 'Gli ultimi articoli', topicsTitle: 'Oppure scegli un argomento', allTopics: 'Tutti gli argomenti',
    searchLabel: 'Cosa vuoi sapere?', searchPlaceholder: 'Per esempio: pensione', searchButton: 'Cerca',
    searchHint: 'Scrivi una parola: mentre scrivi ti mostriamo gli articoli che ne parlano.', suggestionsTitle: 'Articoli',
    topicLabel: 'Argomento', articles: '{n} articoli', oneArticle: '1 articolo', results: '{n} articoli su «{q}»', oneResult: '1 articolo su «{q}»', noResults: 'Non abbiamo ancora articoli su «{q}».',
    tryWith: 'Prova con', clear: 'Cancella la ricerca', otherLang: 'In un’altra lingua',
  },
  en: {
    kicker: 'The Relomatrix blog', title: 'Clear guides for life between two countries',
    lead: 'Tax, visas, pensions and paperwork explained in plain words. Every article links to the official source.',
    readIn: 'Read in', latest: 'Latest articles', topicsTitle: 'Or pick a topic', allTopics: 'All topics',
    searchLabel: 'What do you want to know?', searchPlaceholder: 'For example: pension', searchButton: 'Search',
    searchHint: 'Type a word: as you type, we show the articles about it.', suggestionsTitle: 'Articles',
    topicLabel: 'Topic', articles: '{n} articles', oneArticle: '1 article', results: '{n} articles about “{q}”', oneResult: '1 article about “{q}”', noResults: 'We have no articles about “{q}” yet.',
    tryWith: 'Try', clear: 'Clear search', otherLang: 'In another language',
  },
  fr: {
    kicker: 'Le blog de Relomatrix', title: 'Des guides clairs pour vivre entre deux pays',
    lead: 'Impôts, visas, retraite et démarches expliqués simplement. Chaque article cite la source officielle.',
    readIn: 'Lire en', latest: 'Derniers articles', topicsTitle: 'Ou choisissez un sujet', allTopics: 'Tous les sujets',
    searchLabel: 'Que voulez-vous savoir ?', searchPlaceholder: 'Par exemple : retraite', searchButton: 'Rechercher',
    searchHint: 'Tapez un mot : pendant que vous tapez, nous affichons les articles qui en parlent.', suggestionsTitle: 'Articles',
    topicLabel: 'Sujet', articles: '{n} articles', oneArticle: '1 article', results: '{n} articles sur « {q} »', oneResult: '1 article sur « {q} »', noResults: 'Nous n’avons pas encore d’article sur « {q} ».',
    tryWith: 'Essayez', clear: 'Effacer la recherche', otherLang: 'Dans une autre langue',
  },
};
