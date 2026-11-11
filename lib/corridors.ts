import type { Lang } from './posts';

// G-34: P0 corridors of the product. A post may set `corridor` in frontmatter to one of these ids;
// it then joins that corridor's cluster page (/blog/corridor/<id>/) and its CTA opens the Risk Report
// page with the corridor preselected. Every CTA carries utm_source=blog so the site can count it.
export type Corridor = { id: string; slug: string; label: Record<Lang, string>; intro: Record<Lang, string> };

export const CORRIDORS: Corridor[] = [
  {
    id: 'US-IT', slug: 'us-it',
    label: { en: 'United States → Italy', it: 'Stati Uniti → Italia', fr: 'États-Unis → Italie' },
    intro: {
      en: 'Visas, work permits, tax residence and social security for moving from the United States to Italy.',
      it: 'Visti, permessi di lavoro, residenza fiscale e previdenza per chi si trasferisce dagli Stati Uniti in Italia.',
      fr: 'Visas, permis de travail, résidence fiscale et sécurité sociale pour s’installer des États-Unis en Italie.',
    },
  },
  {
    id: 'US-FR', slug: 'us-fr',
    label: { en: 'United States → France', it: 'Stati Uniti → Francia', fr: 'États-Unis → France' },
    intro: {
      en: 'Residence permits, remote work and tax for moving from the United States to France.',
      it: 'Permessi di soggiorno, lavoro da remoto e fisco per chi si trasferisce dagli Stati Uniti in Francia.',
      fr: 'Titres de séjour, télétravail et fiscalité pour s’installer des États-Unis en France.',
    },
  },
  {
    id: 'IT-FR', slug: 'it-fr',
    label: { en: 'Italy → France', it: 'Italia → Francia', fr: 'Italie → France' },
    intro: {
      en: 'Social security, tax residence and work for moving from Italy to France.',
      it: 'Previdenza, residenza fiscale e lavoro per chi si trasferisce dall’Italia in Francia.',
      fr: 'Sécurité sociale, résidence fiscale et travail pour s’installer d’Italie en France.',
    },
  },
  {
    id: 'FR-IT', slug: 'fr-it',
    label: { en: 'France → Italy', it: 'Francia → Italia', fr: 'France → Italie' },
    intro: {
      en: 'Social security, tax residence and work for moving from France to Italy.',
      it: 'Previdenza, residenza fiscale e lavoro per chi si trasferisce dalla Francia in Italia.',
      fr: 'Sécurité sociale, résidence fiscale et travail pour s’installer de France en Italie.',
    },
  },
];

export const CORRIDOR_IDS = new Set(CORRIDORS.map((c) => c.id));
export const getCorridor = (id?: string) => CORRIDORS.find((c) => c.id === id) || null;

const SITE_PATH: Record<Lang, string> = { en: '', it: '/it', fr: '/fr' };

/** Measurable CTA from a post: corridor Risk Report page when the post has one, otherwise the Snapshot. */
export function ctaHref(lang: Lang, slug: string, corridorId?: string) {
  const c = getCorridor(corridorId);
  const params = new URLSearchParams({ utm_source: 'blog', utm_medium: 'cta', utm_campaign: slug });
  if (c) {
    params.set('corridor', c.id);
    return `https://www.relomatrix.com${SITE_PATH[lang]}/report?${params}`;
  }
  // The Snapshot has no /it or /fr path: the site reads the language from ?lang=.
  if (lang !== 'en') params.set('lang', lang);
  return `https://www.relomatrix.com/snapshot?${params}`;
}
