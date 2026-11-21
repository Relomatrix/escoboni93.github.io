import { getAllPosts, tagSlug } from '@/lib/posts';
import { formatDate } from '@/lib/i18n';
import type { SearchIndex, SearchPost, SearchTopic } from '@/lib/search';

// Search index for the blog search box (app/SearchBox.tsx), written as a static file at build time.
// It holds only published articles and their real topics: the box never suggests anything else.
export const dynamic = 'force-static';

export function GET() {
  const all = getAllPosts();
  const posts: SearchPost[] = all.map((p) => ({
    s: p.slug, t: p.title, d: p.description, l: p.lang, date: formatDate(p.date, p.lang),
    img: p.image, tags: p.tags || [], m: p.readingMinutes,
  }));
  // One entry per topic and language, so a suggestion links to a topic page the reader can read.
  const topics = new Map<string, SearchTopic>();
  for (const p of all) for (const label of p.tags || []) {
    const slug = tagSlug(label);
    if (!slug) continue;
    const key = `${p.lang}:${slug}`;
    const t = topics.get(key) || { slug, label, l: p.lang, n: 0 };
    t.n += 1;
    topics.set(key, t);
  }
  const index: SearchIndex = { posts, topics: [...topics.values()].sort((a, b) => b.n - a.n) };
  return new Response(JSON.stringify(index), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
