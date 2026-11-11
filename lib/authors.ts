import type { Lang } from './posts';

// Bylines (G-31). `author` in a post's frontmatter must be a key of AUTHORS (default: francesco-bonifazi).
// Add a Person here only for a real person who actually writes or reviews the article.
// `reviewedBy` in frontmatter must be a key of REVIEWERS, and is set only after a real review by that
// professional, with their written consent to be named.
export type Author = {
  key: string;
  type: 'Organization' | 'Person';
  name: string;
  /** Name shown in the byline per language, when it differs from `name` (an editorial team). */
  displayName?: Record<Lang, string>;
  jobTitle?: string;
  role: Record<Lang, string>;
  bio?: Record<Lang, string>;
  sameAs?: string[];
};

export const AUTHORS: Record<string, Author> = {
  'francesco-bonifazi': {
    key: 'francesco-bonifazi',
    type: 'Person',
    name: 'Francesco Bonifazi',
    jobTitle: 'Co-founder and CTO, Relomatrix',
    role: { it: 'Cofondatore e CTO di Relomatrix', en: 'Co-founder and CTO of Relomatrix', fr: 'Cofondateur et CTO de Relomatrix' },
    bio: {
      it: 'Francesco Bonifazi è cofondatore e CTO di Relomatrix. Si occupa dell’architettura della piattaforma e della tracciabilità delle fonti.',
      en: 'Francesco Bonifazi is co-founder and CTO of Relomatrix. He leads the platform architecture and source traceability.',
      fr: 'Francesco Bonifazi est cofondateur et CTO de Relomatrix. Il est responsable de l’architecture de la plateforme et de la traçabilité des sources.',
    },
  },
  redazione: {
    key: 'redazione',
    type: 'Organization',
    name: 'Redazione Relomatrix',
    displayName: { it: 'Redazione Relomatrix', en: 'Relomatrix editorial team', fr: 'Rédaction Relomatrix' },
    role: { it: 'Redazione', en: 'Editorial team', fr: 'Rédaction' },
  },
};
export const DEFAULT_AUTHOR = 'francesco-bonifazi';

/** Professionals who reviewed an article. Empty until a real review with consent (G-31 decision). */
export type Reviewer = { key: string; name: string; qualification: Record<Lang, string>; url?: string };
export const REVIEWERS: Record<string, Reviewer> = {};

export const getAuthor = (key?: string): Author => AUTHORS[key || DEFAULT_AUTHOR] || AUTHORS[DEFAULT_AUTHOR];
export const getReviewer = (key?: string): Reviewer | null => (key && REVIEWERS[key]) || null;
export const PERSON_AUTHORS = Object.values(AUTHORS).filter((a) => a.type === 'Person');

/** Byline text: the person and their role, or only the team name (no "Redazione Relomatrix, Redazione"). */
export const bylineName = (a: Author, lang: Lang) => a.displayName?.[lang] || a.name;
export const bylineRole = (a: Author, lang: Lang) => (a.type === 'Person' ? a.role[lang] : null);
