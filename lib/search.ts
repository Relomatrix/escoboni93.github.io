// Matching for the blog search box. Pure functions, no dependencies: runs in the reader's browser on the
// static index /blog/search-index.json (app/blog/search-index.json/route.ts). No external search service.

export type SearchPost = { s: string; t: string; d: string; l: string; date: string; img?: string; tags: string[]; m: number };
export type SearchTopic = { slug: string; label: string; l: string; n: number };
export type SearchIndex = { posts: SearchPost[]; topics: SearchTopic[] };

/** Lowercase, no accents, letters and digits only: "Résidence fiscale" -> "residence fiscale". */
export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const STOP = new Set(['il', 'lo', 'la', 'le', 'gli', 'i', 'di', 'da', 'del', 'della', 'per', 'con', 'in', 'e', 'un', 'una', 'che',
  'the', 'of', 'to', 'for', 'and', 'a', 'an', 'on', 'is', 'how', 'what',
  'les', 'des', 'du', 'de', 'et', 'en', 'au', 'aux', 'pour', 'sur', 'est', 'l', 'd']);

export function tokens(q: string): string[] {
  const all = norm(q).split(' ').filter((w) => w.length > 1 || /\d/.test(w));
  const kept = all.filter((w) => !STOP.has(w));
  return kept.length ? kept : all;
}

// How well one query word matches a text: whole-word start (best), then a shorter stem (pensioni ~ pensione),
// then anywhere inside a word for longer queries. 0 when it does not match.
function wordScore(token: string, words: string[]): number {
  if (words.some((w) => w.startsWith(token))) return 3;
  if (token.length >= 5) {
    const stem = token.slice(0, -1);
    if (words.some((w) => w.startsWith(stem))) return 2;
  }
  if (token.length >= 4 && words.some((w) => w.includes(token))) return 1;
  return 0;
}

type Prepared = { title: string[]; tags: string[]; desc: string[] };
const cache = new WeakMap<object, Prepared>();
function prep(p: SearchPost): Prepared {
  let x = cache.get(p);
  if (!x) {
    x = { title: norm(p.t).split(' '), tags: norm(p.tags.join(' ')).split(' '), desc: norm(p.d).split(' ') };
    cache.set(p, x);
  }
  return x;
}

/** Articles matching every query word, best first; the reader's language comes first on equal match. */
export function searchPosts(index: SearchIndex, q: string, lang: string, limit = 50): SearchPost[] {
  const toks = tokens(q);
  if (!toks.length) return [];
  const scored: { p: SearchPost; score: number; i: number }[] = [];
  index.posts.forEach((p, i) => {
    const w = prep(p);
    let score = 0;
    for (const t of toks) {
      const s = Math.max(wordScore(t, w.title) * 3, wordScore(t, w.tags) * 2, wordScore(t, w.desc));
      if (!s) return;
      score += s;
    }
    if (p.l === lang) score += 4;
    scored.push({ p, score, i });
  });
  return scored.sort((a, b) => b.score - a.score || a.i - b.i).slice(0, limit).map((x) => x.p);
}

/** Topics whose name matches every query word, the reader's language first. */
export function searchTopics(index: SearchIndex, q: string, lang: string, limit = 3): SearchTopic[] {
  const toks = tokens(q);
  if (!toks.length) return [];
  return index.topics
    .map((t) => {
      const words = norm(t.label).split(' ');
      let score = 0;
      for (const tok of toks) {
        const s = wordScore(tok, words);
        if (!s) return null;
        score += s;
      }
      return { t, score: score + (t.l === lang ? 4 : 0) + Math.min(t.n, 5) / 10 };
    })
    .filter((x): x is { t: SearchTopic; score: number } => !!x)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.t);
}
