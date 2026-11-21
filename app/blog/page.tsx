import type { Metadata } from 'next';
import PostList from '../PostList';
import SearchBox, { SearchResults } from '../SearchBox';
import LangPicker, { LANG_BOOT } from '../LangPicker';
import { getAllPosts, tagSlug } from '@/lib/posts';
import { HOME, LANGS } from '@/lib/i18n';
import type { Lang, PostMeta } from '@/lib/posts';

export const metadata: Metadata = {
  alternates: { canonical: '/blog/' },
  description: 'Source-referenced guides on relocation, immigration, tax and cross-border compliance, in English, Italian and French.',
};

// The most used topics of one language, for the "pick a topic" chips.
function topTopics(posts: PostMeta[], n = 8) {
  const map = new Map<string, { slug: string; label: string; count: number }>();
  for (const p of posts) for (const label of p.tags || []) {
    const slug = tagSlug(label);
    if (!slug) continue;
    const t = map.get(slug) || { slug, label, count: 0 };
    t.count += 1;
    map.set(slug, t);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, n);
}

// Blog home: a welcome band with the search box, then the reader's language only (chosen from the
// browser, changeable with the buttons). Texts exist in every language; CSS shows the chosen one.
export default function Page() {
  const posts = getAllPosts();
  const langs = LANGS.filter((l) => posts.some((p) => p.lang === l));
  const byLang = (l: Lang) => posts.filter((p) => p.lang === l);
  const counts = Object.fromEntries(langs.map((l) => [l, byLang(l).length]));
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
      <section className="hero wide" aria-labelledby="blog-title">
        <div className="hero-inner">
          <LangPicker langs={langs} counts={counts} />
          <p className="kicker">{langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{HOME[l].kicker}</span>)}</p>
          <h1 id="blog-title">{langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{HOME[l].title}</span>)}</h1>
          <p className="hero-lead">{langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{HOME[l].lead}</span>)}</p>
          <SearchBox />
        </div>
      </section>
      <div id="search-results-slot" className="wide"><SearchResults /></div>
      {langs.map((l) => {
        const list = byLang(l);
        return (
          <section key={l} id={l} lang={l} data-lang={l} className="by-lang wide" aria-labelledby={`latest-${l}`}>
            <div className="topics-row">
              <h2 className="topics-title">{HOME[l].topicsTitle}</h2>
              <p className="chips">
                {topTopics(list).map((t) => <a key={t.slug} className="chip" href={`/blog/tag/${t.slug}/`}>{t.label}</a>)}
                <a className="chip chip-all" href="/blog/tag/">{HOME[l].allTopics} <span aria-hidden="true">→</span></a>
              </p>
            </div>
            <h2 id={`latest-${l}`} className="section-title">{HOME[l].latest}</h2>
            <PostList posts={list} featured showLang={false} heading="h3" />
          </section>
        );
      })}
    </>
  );
}
