// Bylines. `author` in a post's frontmatter must be a key of AUTHORS (default: redazione).
// Add a Person here only for a real person who actually writes or reviews the article.
export type Author = { key: string; type: 'Organization' | 'Person'; name: string; role?: { it: string; en: string } };

export const AUTHORS: Record<string, Author> = {
  redazione: { key: 'redazione', type: 'Organization', name: 'Redazione Relomatrix', role: { it: 'Redazione', en: 'Editorial team' } },
};
export const DEFAULT_AUTHOR = 'redazione';

export const getAuthor = (key?: string): Author => AUTHORS[key || DEFAULT_AUTHOR] || AUTHORS[DEFAULT_AUTHOR];
