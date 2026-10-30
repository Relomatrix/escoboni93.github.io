import type { Lang } from './posts';

export const UI: Record<Lang, Record<string, string>> = {
  en: {
    by: 'By', updated: 'Updated', topics: 'Topics', related: 'Related articles', alsoIn: 'Also available in',
    ctaTitle: 'Review cross-border risks before moving',
    ctaBody: 'Relomatrix turns fragmented relocation and compliance information into source-referenced reviews.',
    ctaLink: 'Visit Relomatrix', language: 'English',
  },
  it: {
    by: 'Di', updated: 'Aggiornato', topics: 'Argomenti', related: 'Articoli correlati', alsoIn: 'Disponibile anche in',
    ctaTitle: 'Verifica i rischi prima del trasferimento',
    ctaBody: 'Relomatrix trasforma informazioni frammentate su relocation e compliance in analisi con fonti verificabili.',
    ctaLink: 'Scopri Relomatrix', language: 'Italiano',
  },
};
