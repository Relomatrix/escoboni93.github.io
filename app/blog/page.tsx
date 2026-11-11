import type { Metadata } from 'next';
import PostList from '../PostList';
import { getAllPosts } from '@/lib/posts';
import { LANGS, UI } from '@/lib/i18n';
import type { Lang } from '@/lib/posts';

export const metadata: Metadata = {
  alternates: { canonical: '/blog/' },
  description: 'Source-referenced guides on relocation, immigration, tax and cross-border compliance, in English, Italian and French.',
};

const INTRO: Record<Lang, { lead: string; heading: string; topics: string }> = {
  en: { lead: 'Source-referenced guides on relocation, immigration, tax and cross-border compliance.', heading: 'Articles in English', topics: 'All topics' },
  it: { lead: 'Guide con fonti ufficiali su trasferimento, immigrazione, fisco e adempimenti tra Paesi.', heading: 'Articoli in italiano', topics: 'Tutti gli argomenti' },
  fr: { lead: 'Guides sourcés sur l’expatriation, l’immigration, la fiscalité et la conformité entre pays.', heading: 'Articles en français', topics: 'Tous les sujets' },
};

// One section per language, so a reader finds the articles in their language without a wall of mixed tags.
export default function Page() {
  const posts = getAllPosts();
  const langs = LANGS.filter((l) => posts.some((p) => p.lang === l));
  return (
    <>
      <h1>Relomatrix Blog</h1>
      <div className="home-intro">
        {langs.map((l) => <p key={l} lang={l} className={l === 'en' ? 'lead' : undefined}>{INTRO[l].lead}</p>)}
      </div>
      <nav className="lang-switch" aria-label="Language / Lingua / Langue">
        {langs.map((l) => <a key={l} href={`#${l}`} hrefLang={l} lang={l}>{UI[l].language} ({posts.filter((p) => p.lang === l).length})</a>)}
        <a href="/blog/tag/">{INTRO.en.topics} / {INTRO.it.topics}</a>
      </nav>
      {langs.map((l) => (
        <section key={l} id={l} lang={l} aria-labelledby={`h-${l}`}>
          <h2 id={`h-${l}`}>{INTRO[l].heading}</h2>
          <PostList posts={posts.filter((p) => p.lang === l)} />
        </section>
      ))}
    </>
  );
}
