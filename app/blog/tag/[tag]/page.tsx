import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import PostList from '../../../PostList';
import { getAllTags } from '@/lib/posts';
import { SITE_URL, breadcrumbLd, jsonLd } from '@/lib/site';
import { HOME, TOPICS, mainLang } from '@/lib/i18n';

export const dynamicParams = false;
// Static export needs at least one param; a placeholder keeps the build green before any post has tags.
export function generateStaticParams() {
  const tags = getAllTags();
  return tags.length ? tags.map((t) => ({ tag: t.slug })) : [{ tag: '_' }];
}

type Props = { params: Promise<{ tag: string }> };
const find = async (params: Props['params']) => { const s = (await params).tag; return getAllTags().find((t) => t.slug === s); };

// A topic page speaks the language most of its articles are written in (its name is in that language too);
// scripts/set-html-lang.mjs sets <html lang> from data-page-lang so the header follows.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await find(params);
  if (!t) return { robots: { index: false } };
  const L = TOPICS[mainLang(t.posts)];
  return {
    title: L.metaTitle.replace('{t}', t.label),
    description: L.metaDesc.replace('{t}', t.label),
    alternates: { canonical: `/blog/tag/${t.slug}/` },
    robots: t.posts.length < 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function TagPage({ params }: Props) {
  const t = await find(params);
  if (!t) notFound();
  const lang = mainLang(t.posts);
  const L = TOPICS[lang];
  const mixed = t.posts.some((p) => p.lang !== lang);
  return (
    <div lang={lang} data-page-lang={lang}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([
        breadcrumbLd([[HOME[lang].allTopics, '/blog/tag/'], [t.label, `/blog/tag/${t.slug}/`]]),
        { '@context': 'https://schema.org', '@type': 'CollectionPage', name: t.label, url: `${SITE_URL}/blog/tag/${t.slug}/`, inLanguage: lang,
          hasPart: t.posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${SITE_URL}/blog/${p.slug}/`, inLanguage: p.lang })) },
      ]) }} />
      <nav className="meta" aria-label="Breadcrumb"><a href="/blog/">Blog</a> › <a href="/blog/tag/">{L.back}</a> › <span>{t.label}</span></nav>
      <h1>{t.label}</h1>
      <p className="lead">{t.posts.length === 1 ? L.one : L.many.replace('{n}', String(t.posts.length))}</p>
      <PostList posts={t.posts} showLang={mixed} />
    </div>
  );
}
