import type { Metadata } from 'next';
import LangPicker, { LANG_BOOT } from '../../LangPicker';
import { getAllTags } from '@/lib/posts';
import { breadcrumbLd, jsonLd } from '@/lib/site';
import { LANGS, TOPICS, mainLang } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Argomenti / Topics / Sujets',
  description: 'All topics covered by the Relomatrix Blog: relocation, immigration, tax and cross-border compliance.',
  alternates: { canonical: '/blog/tag/' },
};

// Topics grouped by language, the reader's language shown first (same switch as the blog home).
export default function TagIndex() {
  const tags = getAllTags().map((t) => ({ ...t, lang: mainLang(t.posts) }));
  const langs = LANGS.filter((l) => tags.some((t) => t.lang === l));
  const counts = Object.fromEntries(langs.map((l) => [l, tags.filter((t) => t.lang === l).length]));
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: LANG_BOOT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd([['Topics', '/blog/tag/']])) }} />
      <section className="hero hero-small wide" aria-labelledby="topics-title">
        <div className="hero-inner">
          <LangPicker langs={langs} counts={counts} />
          <h1 id="topics-title">{langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{TOPICS[l].title}</span>)}</h1>
          <p className="hero-lead">{langs.map((l) => <span key={l} className={`ui-${l}`} lang={l}>{TOPICS[l].lead}</span>)}</p>
        </div>
      </section>
      {langs.map((l) => (
        <section key={l} id={l} lang={l} data-lang={l} className="by-lang wide topic-index">
          <h2 className="section-title">{TOPICS[l].section}</h2>
          <p className="chips">
            {tags.filter((t) => t.lang === l).map((t) => (
              <a key={t.slug} className="chip" href={`/blog/tag/${t.slug}/`}>{t.label} <span className="chip-count">{t.posts.length}</span></a>
            ))}
          </p>
        </section>
      ))}
    </>
  );
}
